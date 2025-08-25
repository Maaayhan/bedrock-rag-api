import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { makeBedrockClient, retrieveAndGenerate } from "./bedrock";

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "1mb" }));

const env = {
  PORT: process.env.PORT || "3000",
  AWS_REGION: process.env.AWS_REGION || "",
  BEDROCK_KB_ID: process.env.BEDROCK_KB_ID || "",
  BEDROCK_MODEL_ARN: process.env.BEDROCK_MODEL_ARN || "",
};

const client = makeBedrockClient(env);

// —— 你的系统 Prompt（极简与统一）——
function buildSystemPrompt() {
  const currentDate = new Date().toISOString().split("T")[0];
  return `Return the top 5 most relevant MBS candidates (single items or bundles). Each must follow MBS rules (validity, no conflicts).

JSON only:
{
  "results": [
    {
      "itemNum": "123",   // bundles use "itemNums": ["123","10997"]
      "title": "brief description",
      "match_reason": "why this bundle or item matches the query",
      "match_score": 0.0-1.0,
      "fee": "scheduled fee amount (or total for bundles)",
      "benefit": "Medicare benefit amount (or total for bundles)"
    }
  ]
}

Current date: ${currentDate}.`;
}

// 健康检查
app.get("/health", (_req, res) => {
  res.json({ ok: true, ts: new Date().toISOString() });
});

// 主接口：POST /rag/query
app.post("/rag/query", async (req, res) => {
  try {
    const query = (req.body?.query ?? "").toString().trim();
    if (!query) {
      return res.status(400).json({ error: "Missing 'query' in body" });
    }

    const systemPrompt = buildSystemPrompt();
    const output = await retrieveAndGenerate(client, env, query, systemPrompt);

    // 直接返回模型的 outputText（应为 JSON 字符串）；若不是 JSON，可按需解析/校验
    res.type("application/json").send(output);
  } catch (e: any) {
    console.error("RAG error:", e);
    res.status(500).json({ error: e?.message ?? "Internal error" });
  }
});

app.listen(Number(env.PORT), () => {
  console.log(`🚀 Bedrock RAG API running on :${env.PORT}`);
});

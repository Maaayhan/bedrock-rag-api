import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { makeBedrockClient, retrieveAndGenerate } from "./bedrock";

const app = express();

// Configure helmet to allow Railway healthcheck
app.use(helmet({
  contentSecurityPolicy: false, // Allow Railway healthcheck
}));

// Configure CORS to allow Railway healthcheck
app.use(cors({
  origin: true, // Allow all origins including Railway healthcheck
  credentials: true
}));

app.use(express.json({ limit: "1mb" }));

const env = {
  PORT: process.env.PORT || "3000",
  AWS_REGION: process.env.AWS_REGION || "us-east-1", // 默认区域
  BEDROCK_KB_ID: process.env.BEDROCK_KB_ID || "",
  BEDROCK_MODEL_ARN: process.env.BEDROCK_MODEL_ARN || "",
};

// Debug: 打印所有环境变量
console.log("=== DEBUG: Environment Variables ===");
console.log("All env keys:", Object.keys(process.env));
console.log("Total env vars count:", Object.keys(process.env).length);

// 查找 AWS 相关的环境变量
const awsEnvs = Object.keys(process.env).filter(key => 
  key.includes('AWS') || key.includes('BEDROCK')
);
console.log("AWS/BEDROCK related env vars:", awsEnvs);

// 验证必需的环境变量
console.log("\n=== Environment Check ===");
console.log("- AWS_REGION:", env.AWS_REGION);
console.log("- BEDROCK_KB_ID:", env.BEDROCK_KB_ID ? "✓ Set" : "✗ Missing");
console.log("- BEDROCK_MODEL_ARN:", env.BEDROCK_MODEL_ARN ? "✓ Set" : "✗ Missing");
console.log("- AWS_ACCESS_KEY_ID:", process.env.AWS_ACCESS_KEY_ID ? "✓ Set" : "✗ Missing");
console.log("- AWS_SECRET_ACCESS_KEY:", process.env.AWS_SECRET_ACCESS_KEY ? "✓ Set" : "✗ Missing");

// 打印具体的环境变量值（隐藏敏感信息）
console.log("\n=== Detailed Values ===");
console.log("process.env.AWS_REGION:", process.env.AWS_REGION);
console.log("process.env.BEDROCK_KB_ID:", process.env.BEDROCK_KB_ID);
console.log("process.env.BEDROCK_MODEL_ARN:", process.env.BEDROCK_MODEL_ARN ? "[SET]" : "[NOT SET]");
console.log("process.env.AWS_ACCESS_KEY_ID:", process.env.AWS_ACCESS_KEY_ID ? "[SET]" : "[NOT SET]");
console.log("process.env.AWS_SECRET_ACCESS_KEY:", process.env.AWS_SECRET_ACCESS_KEY ? "[SET]" : "[NOT SET]");

// 检查关键环境变量
const missingVars = [];
if (!env.BEDROCK_KB_ID) missingVars.push("BEDROCK_KB_ID");
if (!env.BEDROCK_MODEL_ARN) missingVars.push("BEDROCK_MODEL_ARN");
if (!process.env.AWS_ACCESS_KEY_ID) missingVars.push("AWS_ACCESS_KEY_ID");
if (!process.env.AWS_SECRET_ACCESS_KEY) missingVars.push("AWS_SECRET_ACCESS_KEY");

if (missingVars.length > 0) {
  console.warn("⚠️  Warning: Missing environment variables:", missingVars.join(", "));
  console.warn("⚠️  The app will start but Bedrock functionality may not work");
}

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

// 健康检查 - 支持根路径和 /health 路径
app.get("/", (_req, res) => {
  res.status(200).send("OK");
});

app.get("/health", (_req, res) => {
  res.status(200).json({ ok: true, ts: new Date().toISOString() });
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

// Listen on all interfaces (0.0.0.0) to ensure Railway can reach the service
const port = Number(env.PORT);
app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Bedrock RAG API running on port ${port}`);
  console.log(`Health check available at: http://localhost:${port}/health`);
});

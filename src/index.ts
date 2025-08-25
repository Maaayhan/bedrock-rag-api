import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { makeBedrockClient, retrieveAndGenerate } from "./bedrock";

const app = express();

// Configure helmet to allow healthcheck
app.use(helmet({
  contentSecurityPolicy: false, // Allow healthcheck
}));

// Configure CORS to allow healthcheck
app.use(cors({
  origin: true, // Allow all origins including healthcheck
  credentials: true
}));

app.use(express.json({ limit: "1mb" }));

const env = {
  PORT: process.env.PORT || "3000",
  AWS_REGION: process.env.AWS_REGION || "us-east-1", // Default region
  BEDROCK_KB_ID: process.env.BEDROCK_KB_ID || "",
  BEDROCK_MODEL_ARN: process.env.BEDROCK_MODEL_ARN || "",
};

// Check critical environment variables
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

// System Prompt (minimal and consistent)
function buildSystemPrompt(topK: number = 5) {
  const currentDate = new Date().toISOString().split("T")[0];
  return `Return the top ${topK} most relevant MBS candidates (single items or bundles). Each must follow MBS rules (validity, no conflicts).

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

// Health check - support both root path and /health path
app.get("/", (_req, res) => {
  res.status(200).send("OK");
});

app.get("/health", (_req, res) => {
  res.status(200).json({ ok: true, ts: new Date().toISOString() });
});

// Main endpoint: POST /rag/query
app.post("/rag/query", async (req, res) => {
  try {
    const query = (req.body?.query ?? "").toString().trim();
    if (!query) {
      return res.status(400).json({ error: "Missing 'query' in body" });
    }

    // Parse and validate top-k parameter
    let topK = 5; // default value
    if (req.body?.top !== undefined) {
      const topValue = parseInt(req.body.top);
      if (isNaN(topValue) || topValue < 1 || topValue > 20) {
        return res.status(400).json({ 
          error: "Invalid 'top' parameter. Must be a number between 1 and 20" 
        });
      }
      topK = topValue;
    }

    console.log(`Processing query with top-${topK} results: "${query}"`);

    const systemPrompt = buildSystemPrompt(topK);
    const output = await retrieveAndGenerate(client, env, query, systemPrompt);

    // Return model output directly (should be JSON string); parse/validate if needed
    res.type("application/json").send(output);
  } catch (e: any) {
    console.error("RAG error:", e);
    res.status(500).json({ error: e?.message ?? "Internal error" });
  }
});

// Listen on all interfaces (0.0.0.0) to ensure deployment platforms can reach the service
const port = Number(env.PORT);
app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Bedrock RAG API running on port ${port}`);
  console.log(`Health check available at: http://localhost:${port}/health`);
});

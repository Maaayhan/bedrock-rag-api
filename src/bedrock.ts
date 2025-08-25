import {
  BedrockAgentRuntimeClient,
  RetrieveAndGenerateCommand,
  RetrieveAndGenerateCommandInput,
} from "@aws-sdk/client-bedrock-agent-runtime";

type Env = {
  AWS_REGION: string;
  BEDROCK_KB_ID: string;
  BEDROCK_MODEL_ARN: string;
};

export function makeBedrockClient(env: Env) {
  console.log(`Creating Bedrock client for region: ${env.AWS_REGION}`);
  
  if (!env.AWS_REGION) {
    throw new Error("AWS_REGION is required but not provided");
  }
  
  return new BedrockAgentRuntimeClient({ 
    region: env.AWS_REGION,
    // 让 AWS SDK 自动从环境变量读取凭据
    credentials: undefined
  });
}

/**
 * 调用 Bedrock KB：RetrieveAndGenerate
 * 按 AWS v3 SDK 推荐的入参结构组织
 */
export async function retrieveAndGenerate(
  client: BedrockAgentRuntimeClient,
  env: Env,
  userQuery: string,
  systemPrompt: string
) {
  const inputText = `${systemPrompt}\n\nUser query: ${userQuery}`;

  const params: RetrieveAndGenerateCommandInput = {
    input: { text: inputText },
    retrieveAndGenerateConfiguration: {
      type: "KNOWLEDGE_BASE",
      knowledgeBaseConfiguration: {
        knowledgeBaseId: env.BEDROCK_KB_ID,
        modelArn: env.BEDROCK_MODEL_ARN,
        // 可选：retrievalConfiguration / generationConfiguration ...
      },
    },
  };

  const cmd = new RetrieveAndGenerateCommand(params);
  const res = await client.send(cmd);

  // output.text 里通常就是模型生成的文本结果（你的 JSON）
  return res.output?.text ?? "";
}

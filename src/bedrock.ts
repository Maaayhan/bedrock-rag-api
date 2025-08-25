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
    // Let AWS SDK automatically read credentials from environment variables
    credentials: undefined
  });
}

/**
 * Call Bedrock KB: RetrieveAndGenerate
 * Organized according to AWS v3 SDK recommended input structure
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
        // Optional: retrievalConfiguration / generationConfiguration ...
      },
    },
  };

  const cmd = new RetrieveAndGenerateCommand(params);
  const res = await client.send(cmd);

  // output.text usually contains the model-generated text result (your JSON)
  return res.output?.text ?? "";
}

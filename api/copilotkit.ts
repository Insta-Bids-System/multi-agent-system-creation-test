import { CopilotRuntime, OpenAIAdapter } from "@copilotkit/runtime";
import OpenAI from "openai";

export default async function handler(req: any, res: any) {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const copilotKit = new CopilotRuntime();
  
  const openaiAdapter = new OpenAIAdapter({ openai });

  const result = await copilotKit.streamHttpServerResponse(req, res, openaiAdapter);
  
  return result;
}

export const config = {
  api: {
    bodyParser: false,
  },
};
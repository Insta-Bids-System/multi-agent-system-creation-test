import { CopilotRuntime, OpenAIAdapter } from "@copilotkit/runtime";

export default async function handler(req: any, res: any) {
  const copilotKit = new CopilotRuntime();
  
  const openaiAdapter = new OpenAIAdapter({
    model: "gpt-4o",
  });

  const response = await copilotKit.response(req, openaiAdapter);
  
  for (const [key, value] of Object.entries(response.headers)) {
    res.setHeader(key, value);
  }
  res.status(response.status).send(response.body);
}

export const config = {
  api: {
    bodyParser: false,
  },
};
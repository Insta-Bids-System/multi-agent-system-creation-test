import { CopilotBackend, OpenAIAdapter } from "@copilotkit/backend";
import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  try {
    // Check if OpenAI API key is present
    if (!process.env.OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY is not set in environment variables");
      return res.status(500).json({ 
        error: { 
          code: "500", 
          message: "OpenAI API key is not configured. Please set OPENAI_API_KEY in Vercel environment variables." 
        } 
      });
    }

    // Log for debugging
    console.log("Initializing CopilotKit backend...");
    
    const copilotKit = new CopilotBackend();
    
    const openaiAdapter = new OpenAIAdapter({
      model: "gpt-4o",
    });

    // Process the request
    return copilotKit.response(req, openaiAdapter);
  } catch (error) {
    console.error("CopilotKit API Error:", error);
    
    // If headers haven't been sent yet, send error response
    if (!res.headersSent) {
      return res.status(500).json({ 
        error: { 
          code: "500", 
          message: "A server error has occurred",
          details: error instanceof Error ? error.message : "Unknown error"
        } 
      });
    }
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
import { 
  CopilotRuntime, 
  OpenAIAdapter,
  copilotRuntimeNextJSAppRouterEndpoint 
} from "@copilotkit/runtime";
import OpenAI from "openai";
import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: { 
        code: "405", 
        message: "Method not allowed. Only POST requests are accepted." 
      } 
    });
  }

  try {
    // Check if OpenAI API key is present
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      console.error("OPENAI_API_KEY is not set in environment variables");
      return res.status(500).json({ 
        error: { 
          code: "500", 
          message: "OpenAI API key is not configured. Please set OPENAI_API_KEY in Vercel environment variables.",
          instruction: "Go to Vercel Dashboard > Settings > Environment Variables and add OPENAI_API_KEY"
        } 
      });
    }

    // Log for debugging
    console.log("Initializing CopilotKit runtime...");
    console.log("API Key present:", apiKey.substring(0, 7) + "...");
    
    // Create OpenAI instance
    const openai = new OpenAI({
      apiKey: apiKey,
    });

    // Create the service adapter
    const serviceAdapter = new OpenAIAdapter({ openai });

    // Create the runtime
    const runtime = new CopilotRuntime();

    // Create the handler
    const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
      runtime,
      serviceAdapter,
      endpoint: "/api/copilotkit",
    });

    // Convert the request to NextRequest format
    const url = new URL(req.url || '', `http://${req.headers.host}`);
    const headers = new Headers();
    
    // Copy headers
    for (const [key, value] of Object.entries(req.headers)) {
      if (typeof value === 'string') {
        headers.set(key, value);
      } else if (Array.isArray(value)) {
        headers.set(key, value.join(','));
      }
    }

    // Create NextRequest
    const nextRequest = new Request(url, {
      method: req.method,
      headers: headers,
      body: req.method !== 'GET' && req.method !== 'HEAD' ? req.body : undefined,
    });

    // Handle the request
    const response = await handleRequest(nextRequest as any);
    
    // Copy response headers
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });
    
    // Set status
    res.status(response.status);
    
    // Send body
    if (response.body) {
      const reader = response.body.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(value);
      }
    }
    
    res.end();
    
  } catch (error) {
    console.error("CopilotKit API Error:", error);
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace");
    
    // Return detailed error for debugging
    if (!res.headersSent) {
      return res.status(500).json({ 
        error: { 
          code: "500", 
          message: "A server error has occurred",
          details: error instanceof Error ? error.message : "Unknown error",
          type: error instanceof Error ? error.constructor.name : typeof error
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
import { CopilotRuntime, OpenAIAdapter } from "@copilotkit/runtime";
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
    
    // Create the runtime
    const runtime = new CopilotRuntime();
    
    // Create OpenAI adapter
    const serviceAdapter = new OpenAIAdapter({ 
      apiKey: apiKey,
      model: "gpt-4o"
    });

    // Stream the response
    const { headers, body, status } = await runtime.response(req, serviceAdapter);
    
    // Set response headers
    for (const [key, value] of Object.entries(headers)) {
      res.setHeader(key, value);
    }
    
    // Set status and send body
    res.status(status || 200);
    
    // If body is a readable stream, pipe it
    if (body && typeof body.pipe === 'function') {
      body.pipe(res);
    } else {
      res.send(body);
    }
    
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
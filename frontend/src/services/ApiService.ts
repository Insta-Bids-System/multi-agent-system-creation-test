import { SessionContext, Message } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api/copilotkit';
const N8N_WEBHOOK_URL = process.env.REACT_APP_N8N_WEBHOOK_URL || '';
const API_TIMEOUT = parseInt(process.env.REACT_APP_API_TIMEOUT || '300000');

export class ApiService {
  private static async fetchWithTimeout(
    url: string,
    options: RequestInit,
    timeout: number = API_TIMEOUT
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    }
  }

  static async startSession(context: SessionContext): Promise<string> {
    try {
      // Use n8n webhook for session start
      const response = await this.fetchWithTimeout(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(context),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.sessionId;
    } catch (error) {
      console.error('Error starting session:', error);
      throw error;
    }
  }

  static async sendMessage(
    sessionId: string,
    message: string
  ): Promise<Message> {
    try {
      // Use CopilotKit API for chat
      const response = await this.fetchWithTimeout(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [{
            role: 'user',
            content: message
          }],
          sessionId
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        id: `msg-${Date.now()}`,
        text: data.content,
        sender: 'ai',
        timestamp: new Date(),
      };
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  static async endSession(sessionId: string): Promise<void> {
    try {
      // Use n8n webhook for session end
      const response = await this.fetchWithTimeout(`${N8N_WEBHOOK_URL}/end`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error ending session:', error);
      throw error;
    }
  }
}

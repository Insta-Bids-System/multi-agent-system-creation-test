import { ApiService } from '../services/ApiService';

// Mock fetch
global.fetch = jest.fn();

describe('ApiService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  describe('startSession', () => {
    it('should start a session successfully', async () => {
      const mockSessionId = 'test-session-123';
      const mockResponse = { sessionId: mockSessionId };
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const context = {
        projectName: 'Test Project',
        userRole: 'Developer',
        industry: 'Technology',
      };

      const result = await ApiService.startSession(context);

      expect(global.fetch).toHaveBeenCalledWith(
        process.env.REACT_APP_N8N_WEBHOOK_URL,
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(context),
        })
      );

      expect(result).toBe(mockSessionId);
    });

    it('should handle start session error', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const context = {
        projectName: 'Test Project',
      };

      await expect(ApiService.startSession(context)).rejects.toThrow(
        'HTTP error! status: 500'
      );
    });

    it('should handle network error', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      );

      const context = {
        projectName: 'Test Project',
      };

      await expect(ApiService.startSession(context)).rejects.toThrow(
        'Network error'
      );
    });
  });

  describe('sendMessage', () => {
    it('should send a message successfully', async () => {
      const mockResponse = {
        messageId: 'msg-123',
        response: 'This is the AI response',
        timestamp: '2024-01-01T12:00:00Z',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await ApiService.sendMessage('session-123', 'Hello AI');

      expect(global.fetch).toHaveBeenCalledWith(
        `${process.env.REACT_APP_N8N_WEBHOOK_URL}/message`,
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sessionId: 'session-123',
            message: 'Hello AI',
          }),
        })
      );

      expect(result).toEqual({
        id: 'msg-123',
        text: 'This is the AI response',
        sender: 'ai',
        timestamp: new Date('2024-01-01T12:00:00Z'),
      });
    });

    it('should handle send message error', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
      });

      await expect(
        ApiService.sendMessage('session-123', 'Hello')
      ).rejects.toThrow('HTTP error! status: 400');
    });
  });

  describe('endSession', () => {
    it('should end a session successfully', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      await ApiService.endSession('session-123');

      expect(global.fetch).toHaveBeenCalledWith(
        `${process.env.REACT_APP_N8N_WEBHOOK_URL}/end`,
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sessionId: 'session-123' }),
        })
      );
    });
  });

  describe('fetchWithTimeout', () => {
    it('should timeout after specified duration', async () => {
      (global.fetch as jest.Mock).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 5000))
      );

      await expect(
        ApiService.startSession({ projectName: 'Test' })
      ).rejects.toThrow('Request timeout');
    }, 10000);
  });
});

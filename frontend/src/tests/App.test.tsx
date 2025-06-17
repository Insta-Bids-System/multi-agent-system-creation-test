import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../App';
import { ApiService } from '../services/ApiService';

// Mock the ApiService
jest.mock('../services/ApiService');

describe('App', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render start screen initially', () => {
    render(<App />);
    
    expect(screen.getByText('Pain Point Scoping System')).toBeInTheDocument();
    expect(screen.getByText(/Discover and analyze your business challenges/)).toBeInTheDocument();
    expect(screen.getByText("Let's begin your session")).toBeInTheDocument();
  });

  it('should render form inputs on start screen', () => {
    render(<App />);
    
    expect(screen.getByLabelText(/Project Name/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Your Role/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Industry/)).toBeInTheDocument();
  });

  it('should start session when form is submitted', async () => {
    const mockSessionId = 'test-session-123';
    (ApiService.startSession as jest.Mock).mockResolvedValue(mockSessionId);

    render(<App />);
    
    const projectInput = screen.getByLabelText(/Project Name/);
    const roleInput = screen.getByLabelText(/Your Role/);
    const industryInput = screen.getByLabelText(/Industry/);
    const submitButton = screen.getByText('Start Scoping Session');

    fireEvent.change(projectInput, { target: { value: 'Test Project' } });
    fireEvent.change(roleInput, { target: { value: 'Developer' } });
    fireEvent.change(industryInput, { target: { value: 'Technology' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(ApiService.startSession).toHaveBeenCalledWith({
        projectName: 'Test Project',
        userRole: 'Developer',
        industry: 'Technology',
      });
    });
  });

  it('should show loading state when starting session', async () => {
    (ApiService.startSession as jest.Mock).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve('session-123'), 1000))
    );

    render(<App />);
    
    const submitButton = screen.getByText('Start Scoping Session');
    fireEvent.click(submitButton);

    expect(screen.getByText('Starting...')).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });

  it('should handle session start error', async () => {
    const mockError = new Error('Network error');
    (ApiService.startSession as jest.Mock).mockRejectedValue(mockError);
    
    // Mock window.alert
    window.alert = jest.fn();

    render(<App />);
    
    const submitButton = screen.getByText('Start Scoping Session');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Failed to start session. Please try again.');
    });
  });

  it('should transition to chat interface after successful session start', async () => {
    const mockSessionId = 'test-session-123';
    (ApiService.startSession as jest.Mock).mockResolvedValue(mockSessionId);

    render(<App />);
    
    const submitButton = screen.getByText('Start Scoping Session');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('ScopeAI - Business Analyst')).toBeInTheDocument();
    });
  });

  it('should handle message sending', async () => {
    const mockSessionId = 'test-session-123';
    (ApiService.startSession as jest.Mock).mockResolvedValue(mockSessionId);
    (ApiService.sendMessage as jest.Mock).mockResolvedValue({
      id: 'msg-123',
      text: 'AI response',
      sender: 'ai',
      timestamp: new Date(),
    });

    render(<App />);
    
    // Start session
    const submitButton = screen.getByText('Start Scoping Session');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('ScopeAI - Business Analyst')).toBeInTheDocument();
    });

    // Send message
    const messageInput = screen.getByPlaceholderText(/Tell me about the challenge/);
    fireEvent.change(messageInput, { target: { value: 'Test message' } });
    fireEvent.submit(messageInput.closest('form')!);

    await waitFor(() => {
      expect(ApiService.sendMessage).toHaveBeenCalledWith(mockSessionId, 'Test message');
    });
  });

  it('should detect session completion', async () => {
    const mockSessionId = 'test-session-123';
    (ApiService.startSession as jest.Mock).mockResolvedValue(mockSessionId);
    (ApiService.sendMessage as jest.Mock).mockResolvedValue({
      id: 'msg-123',
      text: 'Session analysis complete. //SESSION_COMPLETE//',
      sender: 'ai',
      timestamp: new Date(),
    });

    render(<App />);
    
    // Start session
    const submitButton = screen.getByText('Start Scoping Session');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('ScopeAI - Business Analyst')).toBeInTheDocument();
    });

    // Send message that triggers completion
    const messageInput = screen.getByPlaceholderText(/Tell me about the challenge/);
    fireEvent.change(messageInput, { target: { value: 'Complete the session' } });
    fireEvent.submit(messageInput.closest('form')!);

    await waitFor(() => {
      expect(screen.getByText(/Session completed successfully/)).toBeInTheDocument();
      expect(screen.getByText('Start New Session')).toBeInTheDocument();
    });
  });

  it('should handle message send error', async () => {
    const mockSessionId = 'test-session-123';
    (ApiService.startSession as jest.Mock).mockResolvedValue(mockSessionId);
    (ApiService.sendMessage as jest.Mock).mockRejectedValue(new Error('Network error'));

    render(<App />);
    
    // Start session
    const submitButton = screen.getByText('Start Scoping Session');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('ScopeAI - Business Analyst')).toBeInTheDocument();
    });

    // Send message that fails
    const messageInput = screen.getByPlaceholderText(/Tell me about the challenge/);
    fireEvent.change(messageInput, { target: { value: 'Test message' } });
    fireEvent.submit(messageInput.closest('form')!);

    await waitFor(() => {
      expect(screen.getByText(/I apologize, but I encountered an error/)).toBeInTheDocument();
    });
  });

  it('should reset session when clicking start new session', async () => {
    const mockSessionId = 'test-session-123';
    (ApiService.startSession as jest.Mock).mockResolvedValue(mockSessionId);
    (ApiService.sendMessage as jest.Mock).mockResolvedValue({
      id: 'msg-123',
      text: '//SESSION_COMPLETE//',
      sender: 'ai',
      timestamp: new Date(),
    });

    render(<App />);
    
    // Start and complete session
    const submitButton = screen.getByText('Start Scoping Session');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('ScopeAI - Business Analyst')).toBeInTheDocument();
    });

    const messageInput = screen.getByPlaceholderText(/Tell me about the challenge/);
    fireEvent.change(messageInput, { target: { value: 'Test' } });
    fireEvent.submit(messageInput.closest('form')!);

    await waitFor(() => {
      expect(screen.getByText('Start New Session')).toBeInTheDocument();
    });

    // Click start new session
    fireEvent.click(screen.getByText('Start New Session'));

    expect(screen.getByText('Pain Point Scoping System')).toBeInTheDocument();
  });
});

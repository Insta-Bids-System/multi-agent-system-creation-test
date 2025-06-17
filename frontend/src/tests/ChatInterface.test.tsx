import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChatInterface } from '../components/ChatInterface';
import { Message } from '../types';

describe('ChatInterface', () => {
  const mockOnSendMessage = jest.fn();

  const mockMessages: Message[] = [
    {
      id: '1',
      text: 'Hello, I need help with my project',
      sender: 'user',
      timestamp: new Date('2024-01-01T10:00:00'),
    },
    {
      id: '2',
      text: 'I\'d be happy to help you. Can you tell me more about what you\'re trying to accomplish?',
      sender: 'ai',
      timestamp: new Date('2024-01-01T10:00:30'),
    },
  ];

  beforeEach(() => {
    mockOnSendMessage.mockClear();
  });

  it('should render welcome message when no messages', () => {
    render(
      <ChatInterface
        messages={[]}
        isLoading={false}
        onSendMessage={mockOnSendMessage}
        sessionStatus="active"
      />
    );

    expect(screen.getByText(/Welcome! I'm ScopeAI/)).toBeInTheDocument();
    expect(screen.getByText(/Team Efficiency/)).toBeInTheDocument();
    expect(screen.getByText(/Project Delivery/)).toBeInTheDocument();
    expect(screen.getByText(/Communication/)).toBeInTheDocument();
  });

  it('should render messages correctly', () => {
    render(
      <ChatInterface
        messages={mockMessages}
        isLoading={false}
        onSendMessage={mockOnSendMessage}
        sessionStatus="active"
      />
    );

    expect(screen.getByText('Hello, I need help with my project')).toBeInTheDocument();
    expect(screen.getByText(/I'd be happy to help you/)).toBeInTheDocument();
  });

  it('should show typing indicator when loading', () => {
    render(
      <ChatInterface
        messages={mockMessages}
        isLoading={true}
        onSendMessage={mockOnSendMessage}
        sessionStatus="active"
      />
    );

    const typingIndicator = screen.getByTestId('typing-indicator');
    expect(typingIndicator).toBeInTheDocument();
  });

  it('should send message on form submit', () => {
    render(
      <ChatInterface
        messages={[]}
        isLoading={false}
        onSendMessage={mockOnSendMessage}
        sessionStatus="active"
      />
    );

    const input = screen.getByPlaceholderText(/Tell me about the challenge/);
    const sendButton = screen.getByRole('button', { name: /send/i });

    fireEvent.change(input, { target: { value: 'Test message' } });
    fireEvent.click(sendButton);

    expect(mockOnSendMessage).toHaveBeenCalledWith('Test message');
  });

  it('should clear input after sending message', () => {
    render(
      <ChatInterface
        messages={[]}
        isLoading={false}
        onSendMessage={mockOnSendMessage}
        sessionStatus="active"
      />
    );

    const input = screen.getByPlaceholderText(/Tell me about the challenge/) as HTMLInputElement;
    const form = screen.getByRole('form');

    fireEvent.change(input, { target: { value: 'Test message' } });
    fireEvent.submit(form);

    expect(input.value).toBe('');
  });

  it('should disable input when session is completed', () => {
    render(
      <ChatInterface
        messages={mockMessages}
        isLoading={false}
        onSendMessage={mockOnSendMessage}
        sessionStatus="completed"
      />
    );

    const input = screen.getByPlaceholderText(/Session ended/);
    const sendButton = screen.getByRole('button', { name: /send/i });

    expect(input).toBeDisabled();
    expect(sendButton).toBeDisabled();
  });

  it('should show session complete message', () => {
    render(
      <ChatInterface
        messages={mockMessages}
        isLoading={false}
        onSendMessage={mockOnSendMessage}
        sessionStatus="completed"
      />
    );

    expect(screen.getByText(/Session completed successfully/)).toBeInTheDocument();
  });

  it('should handle starter button clicks', () => {
    render(
      <ChatInterface
        messages={[]}
        isLoading={false}
        onSendMessage={mockOnSendMessage}
        sessionStatus="active"
      />
    );

    const teamEfficiencyButton = screen.getByText('Team Efficiency');
    fireEvent.click(teamEfficiencyButton);

    expect(mockOnSendMessage).toHaveBeenCalledWith(
      "I'm trying to improve my team's efficiency"
    );
  });

  it('should not send empty messages', () => {
    render(
      <ChatInterface
        messages={[]}
        isLoading={false}
        onSendMessage={mockOnSendMessage}
        sessionStatus="active"
      />
    );

    const sendButton = screen.getByRole('button', { name: /send/i });
    fireEvent.click(sendButton);

    expect(mockOnSendMessage).not.toHaveBeenCalled();
  });

  it('should format timestamps correctly', () => {
    render(
      <ChatInterface
        messages={mockMessages}
        isLoading={false}
        onSendMessage={mockOnSendMessage}
        sessionStatus="active"
      />
    );

    // Check that time is formatted correctly (10:00 AM format)
    const timeElements = screen.getAllByText(/10:00/);
    expect(timeElements.length).toBeGreaterThan(0);
  });
});

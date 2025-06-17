import React from 'react';
import { Message } from '../types';
import './ChatInterface.css';

interface ChatInterfaceProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (message: string) => void;
  sessionStatus: 'active' | 'completed' | 'error';
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  isLoading,
  onSendMessage,
  sessionStatus,
}) => {
  const [inputValue, setInputValue] = React.useState('');
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    // Check if scrollIntoView is available (not in test environment)
    if (messagesEndRef.current?.scrollIntoView) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && sessionStatus === 'active' && !isLoading) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="chat-interface">
      <div className="chat-header">
        <div className="ai-indicator">
          <span className="ai-dot"></span>
          <span className="ai-label">ScopeAI - Business Analyst</span>
        </div>
        <p className="ai-description">
          I'm here to help you identify and understand your pain points
        </p>
      </div>

      <div className="messages-container">
        {messages.length === 0 && (
          <div className="welcome-message">
            <h3>Welcome! I'm ScopeAI</h3>
            <p>
              I'm an expert Business Analyst here to help you understand and
              diagnose the challenges you're facing. Let's start by discussing
              what you're trying to accomplish.
            </p>
            <div className="suggested-starters">
              <button
                onClick={() =>
                  onSendMessage("I'm trying to improve my team's efficiency")
                }
                className="starter-btn"
              >
                Team Efficiency
              </button>
              <button
                onClick={() =>
                  onSendMessage('I need help with project delivery issues')
                }
                className="starter-btn"
              >
                Project Delivery
              </button>
              <button
                onClick={() =>
                  onSendMessage("I'm facing communication challenges")
                }
                className="starter-btn"
              >
                Communication
              </button>
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`message ${message.sender}`}
          >
            <div className="message-content">
              <p>{message.text}</p>
              <span className="message-time">
                {formatTime(message.timestamp)}
              </span>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="message ai loading">
            <div className="typing-indicator" data-testid="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}

        {sessionStatus === 'completed' && (
          <div className="session-complete">
            <p>
              Session completed successfully! Your pain point analysis has been
              saved.
            </p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="input-form">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={
            sessionStatus === 'active'
              ? 'Tell me about the challenge you\'re facing...'
              : 'Session ended'
          }
          disabled={sessionStatus !== 'active' || isLoading}
          className="message-input"
        />
        <button
          type="submit"
          disabled={
            !inputValue.trim() || sessionStatus !== 'active' || isLoading
          }
          className="send-button"
          aria-label="send"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M22 2L11 13"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M22 2L15 22L11 13L2 9L22 2Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </form>
    </div>
  );
};

import React, { useState, useCallback } from 'react';
import './App.css';
import { ChatInterface } from './components/ChatInterface';
import { ApiService } from './services/ApiService';
import { Message, ChatSession, SessionContext } from './types';

function App() {
  const [session, setSession] = useState<ChatSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showStartScreen, setShowStartScreen] = useState(true);

  const generateMessageId = () => {
    return `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  const startSession = async (context: SessionContext) => {
    try {
      setIsLoading(true);
      const sessionId = await ApiService.startSession(context);
      
      const newSession: ChatSession = {
        id: sessionId,
        messages: [],
        status: 'active',
        context,
        startTime: new Date(),
      };
      
      setSession(newSession);
      setShowStartScreen(false);
    } catch (error) {
      console.error('Failed to start session:', error);
      alert('Failed to start session. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = useCallback(async (text: string) => {
    if (!session || session.status !== 'active') return;

    const userMessage: Message = {
      id: generateMessageId(),
      text,
      sender: 'user',
      timestamp: new Date(),
    };

    setSession(prev => ({
      ...prev!,
      messages: [...prev!.messages, userMessage],
    }));

    setIsLoading(true);

    try {
      const aiResponse = await ApiService.sendMessage(session.id, text);
      
      setSession(prev => ({
        ...prev!,
        messages: [...prev!.messages, aiResponse],
      }));

      // Check if session is complete
      if (aiResponse.text.includes('//SESSION_COMPLETE//')) {
        setSession(prev => ({
          ...prev!,
          status: 'completed',
          endTime: new Date(),
        }));
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      
      const errorMessage: Message = {
        id: generateMessageId(),
        text: 'I apologize, but I encountered an error. Please try again.',
        sender: 'ai',
        timestamp: new Date(),
      };
      
      setSession(prev => ({
        ...prev!,
        messages: [...prev!.messages, errorMessage],
      }));
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  const resetSession = () => {
    setSession(null);
    setShowStartScreen(true);
  };

  if (showStartScreen) {
    return (
      <div className="App">
        <div className="start-screen">
          <div className="start-content">
            <h1 className="app-title">Pain Point Scoping System</h1>
            <p className="app-subtitle">
              Discover and analyze your business challenges with AI-powered insights
            </p>
            
            <div className="start-form">
              <h2>Let's begin your session</h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  startSession({
                    projectName: formData.get('projectName') as string,
                    userRole: formData.get('userRole') as string,
                    industry: formData.get('industry') as string,
                  });
                }}
              >
                <div className="form-group">
                  <label htmlFor="projectName">Project Name (Optional)</label>
                  <input
                    id="projectName"
                    name="projectName"
                    type="text"
                    placeholder="e.g., Q4 Efficiency Initiative"
                    className="form-input"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="userRole">Your Role (Optional)</label>
                  <input
                    id="userRole"
                    name="userRole"
                    type="text"
                    placeholder="e.g., Product Manager"
                    className="form-input"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="industry">Industry (Optional)</label>
                  <input
                    id="industry"
                    name="industry"
                    type="text"
                    placeholder="e.g., Technology"
                    className="form-input"
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={isLoading}
                  className="start-button"
                >
                  {isLoading ? 'Starting...' : 'Start Scoping Session'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      {session && (
        <>
          <ChatInterface
            messages={session.messages}
            isLoading={isLoading}
            onSendMessage={sendMessage}
            sessionStatus={session.status}
          />
          {session.status === 'completed' && (
            <div className="session-actions">
              <button onClick={resetSession} className="new-session-btn">
                Start New Session
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;

import React, { useState } from 'react';
import { useCopilotReadable } from "@copilotkit/react-core";
import './PainPointDiscovery.css';

interface PainPoint {
  painPoint: string;
  impact: string;
  rootCauseAnalysis: Array<{
    why: number;
    cause: string;
  }>;
  rootCause: string;
}

interface SessionData {
  sessionId: string;
  timestamp: string;
  userPersona: {
    role: string;
    industry: string;
  };
  jobToBeDone: {
    primaryJob: string;
    functionalAspects: string[];
    emotionalAspects: string[];
    socialAspects: string[];
    barriers: string[];
  };
  identifiedPainPoints: PainPoint[];
  conversationSummary: string;
}

export function PainPointDiscovery() {
  const [sessionData] = useState<SessionData>({
    sessionId: generateUUID(),
    timestamp: new Date().toISOString(),
    userPersona: {
      role: '',
      industry: ''
    },
    jobToBeDone: {
      primaryJob: '',
      functionalAspects: [],
      emotionalAspects: [],
      socialAspects: [],
      barriers: []
    },
    identifiedPainPoints: [],
    conversationSummary: ''
  });

  // Make session data readable to CopilotKit
  useCopilotReadable({
    description: "Current session data for pain point discovery",
    value: sessionData,
  });

  return (
    <div className="pain-point-discovery">
      <div className="welcome-section">
        <h1>Discover Your Pain Points with AI</h1>
        <p>Let our intelligent assistant help you uncover the root causes of your business challenges through structured discovery.</p>
        
        <div className="features">
          <div className="feature">
            <div className="feature-icon">🎯</div>
            <div>
              <h3>Jobs-to-be-Done Framework</h3>
              <p>Understand what progress you're trying to make</p>
            </div>
          </div>
          <div className="feature">
            <div className="feature-icon">🔍</div>
            <div>
              <h3>5 Whys Analysis</h3>
              <p>Drill down to the root cause of your challenges</p>
            </div>
          </div>
          <div className="feature">
            <div className="feature-icon">📊</div>
            <div>
              <h3>Structured Insights</h3>
              <p>Get actionable, validated analysis of your pain points</p>
            </div>
          </div>
        </div>

        <div className="instructions">
          <h2>How to Get Started</h2>
          <p>Simply start a conversation with our AI assistant in the sidebar. It will guide you through:</p>
          <ol>
            <li>Understanding your primary goal (Jobs-to-be-Done)</li>
            <li>Identifying specific pain points</li>
            <li>Analyzing root causes (5 Whys)</li>
            <li>Documenting insights for action</li>
          </ol>
          <p className="hint">💡 Tip: Be specific and honest about your challenges for the best results.</p>
        </div>
      </div>
    </div>
  );
}

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : ((r & 0x3) | 0x8);
    return v.toString(16);
  });
}

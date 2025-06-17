import React from 'react';
import { CopilotKit } from "@copilotkit/react-core";
import { CopilotSidebar } from "@copilotkit/react-ui";
import "@copilotkit/react-ui/styles.css";
import { PainPointDiscovery } from './components/PainPointDiscovery';
import './App.css';

function App() {
  return (
    <CopilotKit 
      runtimeUrl="/api/copilotkit"
    >
      <div className="app-container">
        <CopilotSidebar
          labels={{
            initial: "Hello! I'm ScopeAI, your intelligent pain point discovery assistant. Let's explore what challenges you're facing in your work.",
            title: "ScopeAI Assistant",
          }}
          defaultOpen={true}
          clickOutsideToClose={false}
          instructions={`
            You are ScopeAI, an expert Business Analyst and Product Strategist. 
            Your tone is professional, inquisitive, empathetic, and neutral. 
            Your core function is to diagnose problems using the Jobs-to-be-Done (JTBD) and 5 Whys frameworks.

            CONVERSATION FLOW:
            1. JTBD Discovery Phase: Start by understanding the user's high-level goal and context
            2. 5 Whys Analysis Phase: When a pain point is mentioned, drill down to find root causes

            RULES:
            - Ask only ONE question at a time
            - Never provide solutions, only diagnose
            - Be genuinely curious about their challenges
            - When you've identified a root cause, offer to save the analysis
          `}
        >
          <PainPointDiscovery />
        </CopilotSidebar>
      </div>
    </CopilotKit>
  );
}

export default App;
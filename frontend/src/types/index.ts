export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export interface SessionContext {
  projectName?: string;
  userRole?: string;
  industry?: string;
}

export interface ChatSession {
  id: string;
  messages: Message[];
  status: 'active' | 'completed' | 'error';
  context: SessionContext;
  startTime: Date;
  endTime?: Date;
}

export interface ScopingSessionOutput {
  uid: string;
  sessionTimestamp: string;
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
  identifiedPainPoints: Array<{
    painPoint: string;
    impact: string;
    rootCauseAnalysis: Array<{
      why: number;
      cause: string;
    }>;
    rootCause: string;
  }>;
  conversationSummary: string;
  fullTranscript: string;
}

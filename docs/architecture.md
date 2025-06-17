# System Architecture Documentation

## Overview

The Pain Point Scoping System is a sophisticated multi-agent architecture designed to autonomously discover, analyze, and validate user pain points through structured conversational AI. The system leverages n8n's automation capabilities, event-driven communication, and advanced LLM technologies.

## Architecture Diagram

```
┌─────────────────┐         ┌─────────────────┐
│                 │         │                 │
│  Frontend App   │◄────────┤   User/Human    │
│  (React SPA)    │         │                 │
│                 │         └─────────────────┘
└────────┬────────┘
         │ HTTPS/Webhook
         ▼
┌─────────────────────────────────────────────┐
│            n8n Automation Platform           │
│                                             │
│  ┌─────────────────┐    MCP Events         │
│  │   Orchestrator   │──────────────┐        │
│  │     Agent       │              │        │
│  └────────┬────────┘              ▼        │
│           │                ┌──────────────┐ │
│           │ Execute        │   Auditor    │ │
│           ▼ Workflow       │    Agent     │ │
│  ┌─────────────────┐      │   (Claude)   │ │
│  │  Scoping Agent  │      └──────┬───────┘ │
│  │  (Claude/GPT-4) │              │         │
│  └─────────────────┘              │         │
│                                   │         │
└───────────────────────────────────┼─────────┘
                                    │
                                    ▼
                          ┌─────────────────┐
                          │  Google Drive   │
                          │  (Data Store)   │
                          └─────────────────┘
```

## Component Architecture

### 1. Frontend Layer

**Technology**: React with TypeScript

**Components**:
- `App.tsx` - Main application controller
- `ChatInterface.tsx` - Conversational UI component
- `ApiService.ts` - HTTP client for backend communication

**Key Features**:
- Futuristic, dark-themed UI with glassmorphism effects
- Real-time chat interface with typing indicators
- Mobile-responsive design
- Accessibility compliance (WCAG 2.1)

### 2. Orchestration Layer

**Technology**: n8n Workflow Automation

**Orchestrator Agent**:
- Entry point via webhook trigger
- Generates unique session IDs (UUID v4)
- Manages workflow execution lifecycle
- Publishes completion events via MCP

**Communication Pattern**:
- Event-driven architecture using Model Context Protocol (MCP)
- Decoupled agent communication
- No direct webhook chains between agents

### 3. Intelligence Layer

**Scoping Agent**:
- **Core Technology**: Claude 3 Opus or GPT-4
- **Memory**: Simple memory buffer (10-message context)
- **Methodology**: Hybrid JTBD + 5 Whys framework
- **Output**: Structured JSON inference

**Conversation Flow**:
```
Phase 1: JTBD Discovery
├── Understand user's goal
├── Identify functional aspects
├── Uncover emotional drivers
└── Document barriers

Phase 2: 5 Whys Analysis
├── Identify specific pain point
├── Ask "Why?" iteratively
├── Drill down 5 levels
└── Determine root cause
```

### 4. Validation Layer

**Auditor Agent**:
- **Technology**: Claude (LLM-as-a-Judge)
- **Trigger**: MCP event subscription
- **Process**: Multi-criteria evaluation

**Evaluation Criteria**:
1. Role Adherence (0.0-1.0 score)
2. Framework Adherence - JTBD (0.0-1.0 score)
3. Framework Adherence - 5 Whys (0.0-1.0 score)
4. Conversation Relevancy (0.0-1.0 score)
5. Output Schema Compliance (0.0-1.0 score)
6. Absence of Hallucinations (0.0-1.0 score)

### 5. Persistence Layer

**Technology**: Google Drive API

**Data Storage**:
- Session outputs as JSON files
- Validation reports as separate JSON files
- Naming convention: `{UID}-PainPointScope-{ProjectName}.json`

## Data Flow

### 1. Session Initiation
```
User → Frontend → Webhook → Orchestrator → Generate UID → Execute Scoping Agent
```

### 2. Conversation Loop
```
User Input → Scoping Agent → Memory Buffer → AI Processing → Response → Frontend
```

### 3. Completion & Validation
```
Session Complete → Save to Drive → Publish MCP Event → Trigger Auditor → Validation → Save Report
```

## Security Architecture

### Authentication & Authorization
- Google OAuth 2.0 for Drive access
- API key authentication for AI services
- Webhook URL as entry point (consider adding authentication)

### Data Security
- HTTPS for all communications
- Credentials encrypted in n8n vault
- No PII stored in conversation logs (configurable)

### Input Validation
- Frontend sanitization
- Backend validation in n8n
- Prompt injection prevention

## Scalability Considerations

### Horizontal Scaling
- n8n instances can be load-balanced
- Stateless webhook design
- Google Drive as external state store

### Performance Optimization
- Async processing via MCP events
- Configurable memory buffer limits
- Parallel validation criteria evaluation

### Rate Limiting
- API provider limits (Claude/OpenAI)
- Google Drive API quotas
- Frontend request throttling

## Reliability & Fault Tolerance

### Error Handling
- Graceful degradation in frontend
- Retry logic with exponential backoff
- Error message queuing

### Monitoring
- n8n execution logs
- Validation score tracking
- API usage monitoring

### Recovery
- Session state persisted early
- Idempotent operations
- Manual intervention workflows

## Technology Stack Summary

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React, TypeScript | User Interface |
| Automation | n8n | Workflow Orchestration |
| Communication | MCP (SSE) | Inter-agent Events |
| AI/ML | Claude 3 Opus / GPT-4 | Conversational Intelligence |
| Storage | Google Drive | Data Persistence |
| Validation | Claude (LLM-as-Judge) | Quality Assurance |

## Deployment Architecture

### Development Environment
```
Local React Dev Server → Local n8n → Mock AI Services → Local File System
```

### Production Environment
```
CDN (React Build) → n8n Cloud/Self-hosted → AI APIs → Google Drive
```

### CI/CD Pipeline
1. Frontend: Build → Test → Deploy to CDN
2. Workflows: Export → Version Control → Import to Production
3. Prompts: Version Control → Manual Update

## Future Architecture Enhancements

### Phase 2 Features
- WebSocket for real-time updates
- Multi-tenant support
- Advanced analytics dashboard

### Phase 3 Features
- Voice interface integration
- Multi-language support
- Custom ML models for validation

### Phase 4 Features
- Federated learning from sessions
- Automated prompt optimization
- Industry-specific agent variants

# ScopeAI - CopilotKit Implementation

This is the CopilotKit-powered version of the Multi-Agent Pain Point Scoping System. It provides a more sophisticated, context-aware AI assistant experience using CopilotKit's framework.

## Features

- **CopilotKit Integration**: Advanced AI assistant with context retention
- **Structured Actions**: Programmatic updates to session data
- **Real-time Analysis**: Live pain point discovery and root cause analysis
- **Seamless n8n Integration**: Connects to existing backend workflows
- **Modern UI**: Dark theme with smooth animations

## Key Improvements with CopilotKit

1. **Context Retention**: CopilotKit maintains conversation context automatically
2. **Structured Actions**: Uses typed actions for data collection instead of free-form parsing
3. **Better UX**: Pre-built components with customizable styling
4. **Developer Experience**: Easier to extend with new features
5. **Type Safety**: Full TypeScript support

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```env
REACT_APP_COPILOT_CLOUD_API_KEY=your_copilot_cloud_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
```

To get your CopilotKit Cloud API key:
1. Go to https://cloud.copilotkit.ai
2. Sign up or log in
3. Copy your public API key from the dashboard

### 3. Run Locally

```bash
npm start
```

The app will run on http://localhost:3000

### 4. Deploy to Vercel

1. Push to GitHub (see instructions below)
2. Deploy on Vercel:
   - Go to https://vercel.com
   - Import your GitHub repository
   - Add environment variable: `OPENAI_API_KEY`
   - Deploy

## Architecture

### Frontend Components

- **App.tsx**: Main component with CopilotKit provider
- **PainPointDiscovery.tsx**: Core UI with CopilotKit actions
- **CopilotSidebar**: Pre-built chat interface from CopilotKit

### CopilotKit Actions

1. **updateUserPersona**: Captures user role and industry
2. **updateJobToBeDone**: Records JTBD framework data
3. **addPainPointAnalysis**: Stores 5 Whys analysis
4. **saveFinalReport**: Sends data to n8n webhook

### Backend Integration

The app integrates with your existing n8n workflows:
- Saves reports to: `https://instabidssystem.app.n8n.cloud/webhook/save-pain-point-report`
- Maintains the same data structure as the original system

## Conversation Flow

1. **Discovery Phase**: AI uses JTBD framework to understand goals
2. **Analysis Phase**: Applies 5 Whys to identify root causes
3. **Completion**: Saves structured report to backend

## Customization

### Styling

Modify `App.css` to customize the CopilotKit theme:
```css
.copilotKitSidebar {
  /* Your custom styles */
}
```

### Instructions

Update the `instructions` prop in `CopilotSidebar` to modify AI behavior.

### Actions

Add new actions in `PainPointDiscovery.tsx`:
```typescript
useCopilotAction({
  name: "yourAction",
  description: "What this action does",
  parameters: [...],
  handler: async (params) => {
    // Your logic
  }
});
```

## Advantages Over Standard Implementation

1. **Better Context Management**: CopilotKit handles conversation state
2. **Type-Safe Actions**: Structured data collection vs parsing
3. **Production Ready**: Built-in error handling and edge cases
4. **Extensible**: Easy to add new features and integrations
5. **Professional UI**: Pre-built components that work out of the box

## Multi-Agent System Architecture

This CopilotKit frontend connects to a sophisticated three-agent backend:
- **Scoping Agent**: Conducts structured conversations (powered by CopilotKit)
- **Auditor Agent**: Validates conversation quality using LLM-as-a-Judge
- **Orchestrator Agent**: Manages the entire process lifecycle

## Technology Stack

- **Frontend**: React + TypeScript + CopilotKit
- **Backend**: n8n automation platform
- **AI Models**: OpenAI GPT-4 (CopilotKit) + Claude (Auditor)
- **Storage**: Google Drive API for data persistence
- **Communication**: Webhooks + CopilotKit Actions

## Next Steps

1. Deploy to Vercel
2. Test the complete flow
3. Monitor usage in CopilotKit dashboard
4. Add more sophisticated actions as needed

## Support

- CopilotKit Docs: https://docs.copilotkit.ai
- n8n Instance: https://instabidssystem.app.n8n.cloud
- Email: instabidssystem@gmail.com

## License

This project is licensed under the MIT License - see the LICENSE file for details.

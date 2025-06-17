# n8n Workflow Configuration Guide

This guide explains how to set up and configure the n8n workflows for the Pain Point Scoping System.

## Prerequisites

- n8n instance (self-hosted or cloud)
- Google Cloud account with Drive API enabled
- OpenAI or Anthropic API key
- Basic understanding of n8n workflows

## Workflow Overview

The system consists of three main workflows:

1. **Orchestrator Workflow** - Main controller that manages the process
2. **Scoping Agent Workflow** - Conversational AI agent
3. **Auditor Agent Workflow** - Validation and quality assurance

## Setup Instructions

### Step 1: Configure Credentials

1. **Google Drive OAuth 2.0**
   - Go to n8n Settings → Credentials
   - Add new credential → Google Drive OAuth2 API
   - Follow the OAuth flow to authenticate
   - Note the folder ID where you want to store session data

2. **AI Provider (Choose one)**
   - **For Claude (Anthropic)**:
     - Add new credential → Anthropic API
     - Enter your API key from console.anthropic.com
   - **For GPT-4 (OpenAI)**:
     - Add new credential → OpenAI API
     - Enter your API key from platform.openai.com

### Step 2: Import Workflows

1. Import each workflow JSON file from the `n8n-workflows` directory:
   - `orchestrator/orchestrator-workflow.json`
   - `scoping-agent/scoping-agent-workflow.json`
   - `auditor-agent/auditor-agent-workflow.json`

2. In n8n, go to Workflows → Import from File

### Step 3: Configure Workflow IDs

1. After importing, each workflow will have a unique ID
2. In the Orchestrator workflow:
   - Find the "Execute Scoping Agent" node
   - Update the `workflowId` parameter with the actual ID of your Scoping Agent workflow

### Step 4: Configure Google Drive Folder

1. Create a folder in Google Drive for storing session data
2. Get the folder ID from the URL (e.g., `https://drive.google.com/drive/folders/[FOLDER_ID]`)
3. Update all Google Drive nodes with this folder ID

### Step 5: Configure Webhook URL

1. In the Orchestrator workflow, find the Webhook trigger node
2. Copy the production webhook URL
3. Update your frontend `.env` file with this URL:
   ```
   REACT_APP_N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/[webhook-id]
   ```

### Step 6: Configure MCP Channels

1. Ensure all MCP nodes use consistent channel names:
   - Orchestrator publishes to: `scoping_complete`
   - Auditor listens on: `scoping_complete`

### Step 7: Load the Genesis Prompt

1. In the Scoping Agent workflow, find the Claude/OpenAI node
2. Copy the content from `prompts/genesis-prompt-scoping-agent.md`
3. Paste it into the system message or prompt field

### Step 8: Activate Workflows

1. Activate workflows in this order:
   - First: Auditor Agent (listener)
   - Second: Scoping Agent
   - Last: Orchestrator (main entry point)

## Testing the Setup

### Test 1: Webhook Connection
```bash
curl -X POST https://your-n8n-instance.com/webhook/[webhook-id] \
  -H "Content-Type: application/json" \
  -d '{"projectName": "Test Project", "userRole": "Tester"}'
```

### Test 2: End-to-End Flow
1. Use the frontend application
2. Start a new session
3. Have a conversation with the agent
4. Check Google Drive for:
   - Session JSON file
   - Validation report (appears after completion)

## Troubleshooting

### Common Issues

1. **Webhook returns 404**
   - Ensure the Orchestrator workflow is active
   - Check the webhook URL is correct

2. **Google Drive authentication fails**
   - Re-authenticate the Google Drive credentials
   - Ensure the app is published (not in testing mode)

3. **AI responses are slow**
   - Check API rate limits
   - Consider using streaming responses
   - Adjust timeout settings

4. **MCP events not triggering**
   - Verify channel names match exactly
   - Ensure both workflows are active
   - Check n8n logs for errors

### Debugging Tips

1. **Enable workflow execution logs**:
   - Settings → Workflow Settings → Save Execution Progress
   - Set to "Save on Success and Error"

2. **Test individual nodes**:
   - Use the "Execute Node" feature
   - Check input/output data

3. **Monitor executions**:
   - Go to Executions tab
   - Filter by workflow
   - Review error messages

## Performance Optimization

1. **Memory Settings**:
   - For Simple Memory node, limit context window
   - Default: 10 messages
   - Adjust based on conversation length

2. **API Rate Limiting**:
   - Add delay nodes between API calls if needed
   - Use exponential backoff for retries

3. **Parallel Processing**:
   - Auditor can evaluate criteria in parallel
   - Use Split In Batches node for better performance

## Security Best Practices

1. **Credential Storage**:
   - Never commit credentials to Git
   - Use n8n's built-in credential encryption

2. **Webhook Security**:
   - Consider adding webhook authentication
   - Implement rate limiting

3. **Data Privacy**:
   - Ensure Google Drive folder has appropriate permissions
   - Consider data retention policies

## Monitoring and Maintenance

1. **Set up alerts** for:
   - Failed executions
   - Low API credits
   - Validation scores below threshold

2. **Regular maintenance**:
   - Review and archive old sessions
   - Monitor storage usage
   - Update prompts based on validation feedback

## Advanced Configuration

### Custom Validation Criteria

Edit `prompts/auditor-agent-prompts.md` to add new evaluation criteria.

### Multi-Language Support

Modify the Genesis Prompt to include language detection and response.

### Integration with Other Tools

- Slack notifications for completed sessions
- Jira ticket creation for identified pain points
- Analytics dashboard integration

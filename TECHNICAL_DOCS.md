# 🤖 Multi-Agent Dev Team Simulator - Technical Documentation

## Overview

This application simulates a realistic software development team with 3 AI agents that interact with each other and human users through a chat interface. Each agent has distinct roles, personalities, and capabilities that mirror real development team dynamics.

## 🏗️ System Architecture

### Frontend (React + Vite)
- **Technology Stack**: React 18, Vite, Tailwind CSS, Socket.IO Client
- **Port**: http://localhost:5173
- **Key Components**:
  - `ChatInterface`: Real-time messaging interface
  - `AgentControlPanel`: Agent management and role switching
  - `SocketService`: WebSocket client management

### Backend (Node.js + Express)
- **Technology Stack**: Node.js, Express, Socket.IO Server, Google Gemini AI
- **Port**: http://localhost:3001
- **Key Services**:
  - `AgentManager`: Orchestrates multi-agent conversations
  - `AIClient`: Google Gemini API integration
  - `GitHubService`: GitHub API interactions
  - `DatabaseService`: JSON-based data persistence

## 🤖 AI Agent Specifications

### 1. Scrum Master/Product Owner
- **Primary Role**: Project management and quality assurance
- **Responsibilities**:
  - Task assignment and sprint planning
  - Feature requirements gathering
  - Testing and quality control
  - Project status reporting
- **Interaction Pattern**: 
  - First to respond to new feature requests
  - Creates user stories and assigns tasks
  - Provides final status updates

### 2. Junior Developer
- **Primary Role**: Feature implementation
- **Responsibilities**:
  - Code implementation based on assigned tasks
  - Pull request creation
  - Asking clarifying questions
  - Learning from code reviews
- **Interaction Pattern**:
  - Responds after task assignment
  - Creates simulated GitHub PRs
  - Implements features with generated code

### 3. Senior Developer
- **Primary Role**: Code review and technical leadership
- **Responsibilities**:
  - Code review and quality assessment
  - Technical guidance and mentorship
  - Pull request approval/rejection
  - Architecture decisions
- **Interaction Pattern**:
  - Reviews work after Junior Dev creates PRs
  - Provides constructive feedback
  - Merges approved changes

## 🔄 Conversation Flow

### Standard Workflow
1. **Human Input**: User requests a feature or asks a question
2. **Scrum Master Response**: Acknowledges request, creates task, assigns to Junior Dev
3. **Junior Dev Response**: Implements feature, creates simulated PR
4. **Senior Dev Response**: Reviews code, approves or requests changes
5. **Scrum Master Update**: Provides project status and completion confirmation

### Example Conversation
```
Human: "Can you build a user login form?"

Scrum Master: "I'll create a user story for authentication. Junior Dev, please implement a login form with email/password validation and proper error handling."

Junior Dev: "Working on the login form now! I'll create a React component with form validation... [Creates PR: Feature/user-login-form]"

Senior Dev: "Reviewing the login PR. The implementation looks good - I like the validation approach. Just one suggestion: consider adding rate limiting. Approved for merge!"

Scrum Master: "Login form feature completed and deployed! The system now supports user authentication with proper validation. Ready for testing."
```

## 🛠️ Technical Implementation

### Turn-Based Messaging System
- Agents respond in a predefined order: Scrum Master → Junior Dev → Senior Dev
- 2-second delays between responses for natural pacing
- Message processing queue prevents concurrent responses

### AI Prompt Engineering
Each agent has a specialized system prompt that defines:
- Role-specific responsibilities
- Communication style and personality
- Technical expertise level
- Interaction patterns with other agents

### GitHub Integration Simulation
- **Branch Creation**: Simulated feature branches
- **Pull Request Workflow**: Mock PR creation and review
- **Code Generation**: AI-generated code snippets for features
- **Review Process**: Automated code review with approval/rejection

### Real-Time Communication
- **WebSocket Connection**: Socket.IO for bi-directional communication
- **Connection Status**: Live connection monitoring
- **Message Persistence**: All conversations stored in JSON database
- **Agent State Management**: Real-time agent status updates

## 📊 Data Storage

### JSON Database Structure
```json
{
  "messages": [
    {
      "id": "uuid",
      "content": "message text",
      "author": "Human|Scrum Master/PO|Senior Developer|Junior Developer",
      "timestamp": "ISO string",
      "type": "human|ai"
    }
  ],
  "agents": [
    {
      "id": "scrum-master|senior-dev|junior-dev",
      "role": "Agent Role Name",
      "system_prompt": "AI system prompt",
      "active": 1|0,
      "created_at": "ISO string",
      "updated_at": "ISO string"
    }
  ],
  "tasks": [
    {
      "id": "uuid",
      "title": "Task description",
      "status": "pending|in_review|completed",
      "assigned_to": "agent-id",
      "github_pr_url": "mock PR URL",
      "created_at": "ISO string",
      "updated_at": "ISO string"
    }
  ]
}
```

## 🎛️ Agent Control Features

### Real-Time Agent Management
- **Pause/Resume**: Toggle individual agents on/off
- **Role Switching**: Dynamically change agent roles
- **Status Monitoring**: Live status indicators
- **Conversation Control**: Manage conversation flow

### Available Roles
- Scrum Master/PO
- Senior Developer  
- Junior Developer
- DevOps Engineer
- QA Tester
- UI/UX Designer

## 🔧 Configuration

### Environment Variables
```env
GEMINI_API_KEY=your_gemini_api_key    # Google Gemini AI API key
GITHUB_TOKEN=your_github_token        # GitHub personal access token
GITHUB_REPO_OWNER=your_username       # GitHub repository owner
GITHUB_REPO_NAME=repo_name           # Target repository name
DB_PATH=./database.json              # Database file path
PORT=3001                            # Backend server port
```

### API Requirements
- **Google Gemini API**: For AI agent responses
- **GitHub API**: For simulated PR workflows (optional)

## 🚀 Development Commands

### Full Stack Development
```bash
npm run dev          # Start both frontend and backend
npm run backend      # Start backend only
npm run frontend     # Start frontend only
```

### Setup Commands
```bash
npm run install-all  # Install all dependencies
npm run build        # Build frontend for production
npm start           # Start production backend
```

## 🧪 Testing Scenarios

### Feature Implementation Test
```
Input: "Create a shopping cart component"
Expected Flow: SM assigns → JD implements → SD reviews → SM confirms
```

### Code Review Test
```
Input: "Review the latest pull request"
Expected: SD provides detailed code review with feedback
```

### Project Management Test
```
Input: "What's the current project status?"
Expected: SM provides comprehensive status report
```

## 🔮 Extension Points

### Adding New Agent Types
1. Update available roles in `AgentControlPanel.jsx`
2. Add role-specific prompts in `AgentManager.js`
3. Define role behavior patterns
4. Test interaction flows

### Custom Workflows
1. Modify turn order in `AgentManager.js`
2. Add new action types in `handleAgentAction()`
3. Implement workflow-specific logic
4. Update UI components as needed

### Integration Extensions
- Slack/Discord integration
- Jira/Linear task management
- CI/CD pipeline simulation
- Real GitHub repository integration

## 📈 Performance Considerations

### Optimization Strategies
- **Message Batching**: Reduce Socket.IO overhead
- **Database Indexing**: Optimize JSON queries
- **Response Caching**: Cache AI responses for repeated queries
- **Connection Pooling**: Manage WebSocket connections efficiently

### Scalability Notes
- Current implementation supports single-user sessions
- For multi-user support, implement room-based isolation
- Consider Redis for session management at scale
- Database migration to PostgreSQL for production use

## 🛡️ Security Best Practices

### API Key Management
- Store keys in environment variables
- Use different keys for development/production
- Implement key rotation policies
- Monitor API usage and quotas

### Input Validation
- Sanitize all user inputs
- Validate message content and length
- Implement rate limiting
- Add CSRF protection for production

## 🐛 Troubleshooting

### Common Issues

#### Connection Problems
```
Issue: "Socket.IO connection failed"
Solution: Check backend server is running on port 3001
```

#### AI Response Failures
```
Issue: "Failed to generate AI response"  
Solution: Verify GEMINI_API_KEY in .env file
```

#### GitHub Integration Errors
```
Issue: "GitHub API authentication failed"
Solution: Check GITHUB_TOKEN permissions and validity
```

### Debug Mode
Enable verbose logging by setting `NODE_ENV=development` in backend `.env`

## 📚 Additional Resources

- [Google Gemini AI Documentation](https://ai.google.dev/docs)
- [Socket.IO Documentation](https://socket.io/docs/)
- [GitHub REST API](https://docs.github.com/en/rest)
- [React + Vite Setup Guide](https://vitejs.dev/guide/)

---

**Built with ❤️ for realistic AI development team simulation**

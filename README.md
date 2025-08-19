# Multi-Agent Dev Team Simulator

A web application where 3 AI agents (Scrum Master/PO, Senior Dev, Junior Dev) and 1 human client collaborate as a software development team. The AIs simulate realistic dev team interactions including GitHub workflows, code reviews, and task management.

## 🏗️ Architecture

- **Frontend**: React + Vite with Socket.IO for real-time chat
- **Backend**: Node.js + Express with Socket.IO server
- **Database**: SQLite for storing chat logs and AI states
- **AI Integration**: Google Gemini API for AI responses
- **GitHub Integration**: GitHub REST API via Octokit for PR workflows

## 🤖 AI Agents

### Scrum Master/Product Owner
- Assigns tasks and creates user stories
- Manages team workflow and sprint planning
- Reviews completed work and provides feedback
- Runs tests and reports on feature completion

### Junior Developer
- Implements features when assigned tasks
- Creates pull requests with generated code
- Asks questions when requirements are unclear
- Learns from code reviews and feedback

### Senior Developer  
- Reviews pull requests thoroughly
- Provides technical guidance and mentorship
- Merges approved PRs after quality checks
- Focuses on code quality and best practices

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Git repository for GitHub integration
- Google Gemini API key
- GitHub personal access token

### 1. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file:
```env
GEMINI_API_KEY=your_gemini_api_key_here
GITHUB_TOKEN=your_github_token_here
GITHUB_REPO_OWNER=your_github_username
GITHUB_REPO_NAME=test-repo
DB_PATH=./database.sqlite
PORT=3001
```

Start the backend:
```bash
npm run dev
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`

## 💬 How to Use

1. **Start a Conversation**: Type a message like "Build a simple login form"
2. **AI Collaboration**: Watch as the agents respond in turn:
   - Scrum Master assigns the task
   - Junior Dev implements and creates a PR
   - Senior Dev reviews and merges if approved
   - Scrum Master provides status update

3. **Control Agents**: Use the Agent Control panel to:
   - Pause/resume individual agents
   - Change agent roles dynamically
   - Monitor agent status

## 🔧 Features

### Core Features ✅
- [x] Real-time chat interface with all agents + human
- [x] Role-specific AI behavior and responses
- [x] Agent control (pause/resume, role switching)
- [x] Persistent chat history and agent states
- [x] Turn-based messaging system

### GitHub Integration ✅
- [x] Simulated PR creation by Junior Dev
- [x] Code review by Senior Dev
- [x] Merge workflow simulation
- [x] Task tracking with GitHub URLs

### UI/UX ✅
- [x] Clean, modern interface with Tailwind CSS
- [x] Real-time connection status
- [x] Message history with timestamps
- [x] Agent status indicators
- [x] Responsive design

## 🛠️ Technical Details

### Backend Services

- **AgentManager**: Orchestrates AI agent interactions and turn-based responses
- **AIClient**: Handles Google Gemini API integration with role-specific prompts
- **GitHubService**: Manages GitHub API interactions (branches, PRs, reviews)
- **DatabaseService**: SQLite operations for persistence

### Frontend Components

- **ChatInterface**: Main chat UI with message history and input
- **AgentControlPanel**: Agent management and role switching
- **SocketService**: WebSocket client for real-time communication

### Database Schema

- `messages`: Chat history with content, author, timestamp
- `agents`: Agent configurations with roles and status
- `tasks`: Task tracking with GitHub integration

## 🔄 Agent Workflow

1. **Human** sends a message/task request
2. **Scrum Master** acknowledges and assigns task
3. **Junior Dev** implements feature and creates PR
4. **Senior Dev** reviews code and approves/rejects
5. **Scrum Master** reports completion status

## 🌟 Example Interactions

**Human**: "Can you build a user authentication system?"

**Scrum Master**: "I'll create a user story for authentication. Junior Dev, please implement login/register functionality with proper validation."

**Junior Dev**: "I'll work on this right away! Creating a branch and implementing the auth system... [Creates PR with generated code]"

**Senior Dev**: "Reviewing the authentication PR. The implementation looks good, but I'd suggest adding rate limiting for login attempts. Overall approved!"

**Scrum Master**: "Authentication feature completed and merged! The system now supports user login/register with validation. Ready for testing."

## 🔮 Future Enhancements

- [ ] Async messaging (agents can respond independently)
- [ ] Visual GitHub PR/merge simulation
- [ ] Custom agent personalities and specializations
- [ ] Integration with real development tools
- [ ] Voice chat capabilities
- [ ] Advanced workflow templates (CI/CD, testing, deployment)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🙋‍♂️ Support

For questions or issues:
1. Check existing GitHub issues
2. Create a new issue with detailed description
3. Join our Discord community [link]

---

**Built with ❤️ for the AI development community**

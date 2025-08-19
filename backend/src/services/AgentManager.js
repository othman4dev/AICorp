import { AIClient } from './AIClient.js';
import { GitHubService } from './GitHubService.js';
import { v4 as uuidv4 } from 'uuid';

export class AgentManager {
  constructor(dbService) {
    this.dbService = dbService;
    this.aiClient = new AIClient();
    this.githubService = new GitHubService();
    this.agents = new Map();
    this.currentTurn = 0;
    this.turnOrder = ['scrum-master', 'junior-dev', 'senior-dev'];
    this.processingMessage = false;
  }

  async initialize() {
    // Load agents from database
    const agentsData = await this.dbService.getAllAgents();
    agentsData.forEach(agent => {
      this.agents.set(agent.id, {
        id: agent.id,
        role: agent.role,
        active: agent.active === 1,
        systemPrompt: agent.system_prompt,
        lastResponse: null
      });
    });
    
    console.log('✅ AgentManager initialized with', this.agents.size, 'agents');
  }

  async processHumanMessage(message, callback) {
    if (this.processingMessage) {
      console.log('⏳ Already processing a message, ignoring duplicate request');
      // Send immediate feedback to user
      const queueMessage = {
        id: Date.now().toString(),
        content: "I'm still processing the previous message. Please wait a moment... ⏳",
        sender: 'System',
        timestamp: new Date().toISOString(),
        type: 'system'
      };
      callback(queueMessage);
      return;
    }

    this.processingMessage = true;
    console.log('🔒 Message processing locked');

    try {
      // Get conversation history for context
      const history = await this.dbService.getChatHistory(50); // More history for better context
      
      // Check for agent tags (@PO, @SENIOR, @JUNIOR, etc.)
      const taggedAgents = this.extractTaggedAgents(message);
      const shouldProcessAll = taggedAgents.length === 0;
      
      console.log(`Processing message. Tagged agents: [${taggedAgents.join(', ')}]`);
      
      // Define project context
      const projectContext = "We are a development team working on various software projects including web applications, APIs, and user interfaces. We follow agile methodology with proper code review processes.";
      
      // Process responses from agents
      let respondingAgents = [];
      
      if (shouldProcessAll) {
        // Normal turn-based flow
        respondingAgents = this.turnOrder.map(id => this.agents.get(id)).filter(agent => agent && agent.active);
      } else {
        // Prioritize tagged agents, but let others respond too after
        const taggedActiveAgents = taggedAgents.map(id => this.agents.get(id)).filter(agent => agent && agent.active);
        const otherActiveAgents = this.turnOrder
          .map(id => this.agents.get(id))
          .filter(agent => agent && agent.active && !taggedAgents.includes(agent.id));
        
        respondingAgents = [...taggedActiveAgents, ...otherActiveAgents];
      }
      
      // Generate responses
      for (let i = 0; i < respondingAgents.length; i++) {
        const agent = respondingAgents[i];
        
        if (!agent || !agent.active) {
          continue;
        }

        // Add delay between responses for natural feel
        if (i > 0) {
          await this.delay(2500);
        }

        const isTagged = taggedAgents.includes(agent.id);
        const response = await this.generateAgentResponse(agent, message, history, projectContext, isTagged);
        
        if (response) {
          const messageData = {
            id: uuidv4(),
            content: response.content,
            author: agent.role,
            timestamp: new Date().toISOString(),
            type: 'ai',
            tagged: isTagged
          };

          // Save to database
          await this.dbService.saveMessage(messageData);
          
          // Send to clients
          callback(messageData);

          // Handle special actions (like creating PRs, reviews, etc.)
          if (response.action) {
            await this.handleAgentAction(agent, response.action, callback);
          }

          // Update history for next agent
          history.push(messageData);
          
          // If this was a tagged response and it's comprehensive, maybe stop here
          if (isTagged && response.content.length > 200) {
            // Tagged agent gave a substantial response, let one more agent respond then stop
            if (i < respondingAgents.length - 1 && !taggedAgents.includes(respondingAgents[i + 1].id)) {
              continue; // Let one more respond
            }
          }
        }
      }
    } catch (error) {
      console.error('Error processing human message:', error);
      
      // Send error message to user
      const errorMessage = {
        id: uuidv4(),
        content: `❌ I'm having trouble processing that message. The error was: ${error.message}`,
        author: 'System',
        timestamp: new Date().toISOString(),
        type: 'system'
      };
      
      callback(errorMessage);
    } finally {
      this.processingMessage = false;
      console.log('🔓 Message processing unlocked');
    }
  }

  extractTaggedAgents(message) {
    const tags = {
      '@PO': 'scrum-master',
      '@SCRUM': 'scrum-master',
      '@SM': 'scrum-master',
      '@SENIOR': 'senior-dev',
      '@SR': 'senior-dev',
      '@JUNIOR': 'junior-dev',
      '@JR': 'junior-dev',
      '@DEV': ['senior-dev', 'junior-dev'], // Tag both developers
      '@ALL': ['scrum-master', 'senior-dev', 'junior-dev'] // Tag everyone
    };
    
    const taggedAgents = [];
    const upperMessage = message.toUpperCase();
    
    for (const [tag, agentIds] of Object.entries(tags)) {
      if (upperMessage.includes(tag)) {
        if (Array.isArray(agentIds)) {
          taggedAgents.push(...agentIds);
        } else {
          taggedAgents.push(agentIds);
        }
      }
    }
    
    return [...new Set(taggedAgents)]; // Remove duplicates
  }

  async generateAgentResponse(agent, humanMessage, history, projectContext, isTagged = false) {
    try {
      let enhancedPrompt = agent.systemPrompt;
      let actionData = null;

      // Add role-specific behavior and actions
      switch (agent.id) {
        case 'scrum-master':
          enhancedPrompt += `\n\nAs a Scrum Master/PO, you should:
- Assign tasks and create user stories
- Check on progress and testing
- Manage the team workflow and sprint planning
- If the human asks for a new feature, create a task and assign it
- If a PR has been merged, provide a brief status report
- Keep track of project milestones and deliverables
${isTagged ? '\n- You were specifically mentioned (@PO/@SCRUM/@SM), so prioritize this response!' : ''}`;
          break;

        case 'junior-dev':
          enhancedPrompt += `\n\nAs a Junior Developer, you should:
- Implement features when assigned
- Ask questions if requirements are unclear
- Create pull requests for your work
- Learn from code reviews and feedback
- Be enthusiastic about learning new technologies
- If assigned a task, offer to implement it and create a PR
${isTagged ? '\n- You were specifically mentioned (@JUNIOR/@JR), so prioritize this response!' : ''}`;
          actionData = this.shouldCreatePR(humanMessage, history);
          break;

        case 'senior-dev':
          enhancedPrompt += `\n\nAs a Senior Developer, you should:
- Review pull requests thoroughly
- Provide technical guidance and mentorship
- Merge approved PRs after careful review
- Focus on code quality, architecture, and best practices
- Help junior developers improve their skills
- Make architectural decisions
${isTagged ? '\n- You were specifically mentioned (@SENIOR/@SR), so prioritize this response!' : ''}`;
          actionData = this.shouldReviewPR(history);
          break;
      }

      const responseText = await this.aiClient.generateResponse(
        enhancedPrompt,
        humanMessage,
        history,
        projectContext
      );

      return {
        content: responseText,
        action: actionData
      };

    } catch (error) {
      console.error(`Error generating response for ${agent.id}:`, error);
      return {
        content: `I'm having trouble responding right now (${error.message}). Please try again.`,
        action: null
      };
    }
  }

  shouldCreatePR(message, history) {
    // Check if this looks like a task assignment or feature request
    const taskKeywords = ['implement', 'create', 'build', 'add', 'feature', 'task'];
    const messageWords = message.toLowerCase().split(' ');
    
    const hasTaskKeyword = taskKeywords.some(keyword => 
      messageWords.some(word => word.includes(keyword))
    );

    if (hasTaskKeyword) {
      return {
        type: 'create_pr',
        task: message
      };
    }

    return null;
  }

  shouldReviewPR(history) {
    // Check if there are recent PR creation messages
    const recentPRMessage = history
      .slice(-5)
      .find(msg => 
        msg.type === 'ai' && 
        msg.author === 'Junior Developer' &&
        (msg.content.includes('pull request') || msg.content.includes('PR'))
      );

    if (recentPRMessage) {
      return {
        type: 'review_pr',
        context: recentPRMessage.content
      };
    }

    return null;
  }

  async handleAgentAction(agent, action, callback) {
    try {
      switch (action.type) {
        case 'create_pr':
          await this.handleCreatePR(action.task, callback);
          break;
        case 'review_pr':
          await this.handleReviewPR(action.context, callback);
          break;
      }
    } catch (error) {
      console.error('Error handling agent action:', error);
    }
  }

  async handleCreatePR(taskDescription, callback) {
    try {
      // Generate code for the task
      const generatedCode = await this.aiClient.generateCode(taskDescription);
      
      // Create a branch name
      const branchName = `feature/${taskDescription.toLowerCase().replace(/[^a-z0-9]+/g, '-').substring(0, 30)}`;
      
      // Create branch
      await this.githubService.createBranch(branchName);
      
      // Create a simple file with the generated code
      const fileName = `src/feature-${Date.now()}.js`;
      await this.githubService.createOrUpdateFile(
        fileName,
        generatedCode,
        `Add feature: ${taskDescription}`,
        branchName
      );
      
      // Create PR
      const pr = await this.githubService.createPullRequest(
        `Feature: ${taskDescription}`,
        `This PR implements: ${taskDescription}\n\n${generatedCode}`,
        branchName
      );
      
      // Save task to database
      await this.dbService.saveTask({
        id: uuidv4(),
        title: taskDescription,
        description: `Generated by Junior Developer AI`,
        status: 'in_review',
        assigned_to: 'junior-dev',
        github_pr_url: this.githubService.getPullRequestUrl(pr.number)
      });

      // Send update message
      const updateMessage = {
        id: uuidv4(),
        content: `🔧 I've created a pull request for this task: ${this.githubService.getPullRequestUrl(pr.number)}\n\nThe implementation includes:\n${generatedCode.substring(0, 200)}...`,
        author: 'Junior Developer',
        timestamp: new Date().toISOString(),
        type: 'ai'
      };

      await this.dbService.saveMessage(updateMessage);
      callback(updateMessage);

    } catch (error) {
      console.error('Error creating PR:', error);
      
      const errorMessage = {
        id: uuidv4(),
        content: `❌ I encountered an error while creating the pull request. Please check the GitHub configuration.`,
        author: 'Junior Developer',
        timestamp: new Date().toISOString(),
        type: 'ai'
      };

      await this.dbService.saveMessage(errorMessage);
      callback(errorMessage);
    }
  }

  async handleReviewPR(prContext, callback) {
    try {
      // For demo purposes, we'll simulate reviewing the most recent PR
      // In a real implementation, you'd extract PR number from context
      const tasks = await this.dbService.getTasks('in_review');
      
      if (tasks.length === 0) {
        return;
      }

      const latestTask = tasks[0];
      
      // Generate code review
      const review = await this.aiClient.generateCodeReview(
        "// Simulated code content for demo",
        latestTask.title
      );
      
      // Simulate adding review (in real scenario, extract PR number)
      const reviewMessage = {
        id: uuidv4(),
        content: `📋 Code Review for "${latestTask.title}":\n\n${review.review}\n\n${review.approved ? '✅ APPROVED - Ready to merge!' : '🔄 Changes requested'}`,
        author: 'Senior Developer',
        timestamp: new Date().toISOString(),
        type: 'ai'
      };

      await this.dbService.saveMessage(reviewMessage);
      callback(reviewMessage);

      // If approved, simulate merge
      if (review.approved) {
        await this.delay(3000);
        
        // Update task status
        await this.dbService.updateTask(latestTask.id, {
          status: 'completed'
        });

        const mergeMessage = {
          id: uuidv4(),
          content: `🚀 Pull request merged successfully! The feature "${latestTask.title}" is now live.`,
          author: 'Senior Developer',
          timestamp: new Date().toISOString(),
          type: 'ai'
        };

        await this.dbService.saveMessage(mergeMessage);
        callback(mergeMessage);
      }

    } catch (error) {
      console.error('Error reviewing PR:', error);
    }
  }

  async toggleAgent(agentId, active) {
    const agent = this.agents.get(agentId);
    if (agent) {
      agent.active = active;
      await this.dbService.updateAgent(agentId, { active: active ? 1 : 0 });
      console.log(`${active ? 'Activated' : 'Deactivated'} agent: ${agentId}`);
    }
  }

  async changeAgentRole(agentId, newRole) {
    const agent = this.agents.get(agentId);
    if (agent) {
      agent.role = newRole;
      // You could update system prompt based on new role
      await this.dbService.updateAgent(agentId, { role: newRole });
      console.log(`Changed role of ${agentId} to: ${newRole}`);
    }
  }

  async getAgentsStatus() {
    await this.initialize(); // Refresh from DB
    return Array.from(this.agents.values()).map(agent => ({
      id: agent.id,
      role: agent.role,
      active: agent.active,
      lastResponse: agent.lastResponse
    }));
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

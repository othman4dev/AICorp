import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export class DatabaseService {
  constructor() {
    this.dbPath = process.env.DB_PATH || './database.json';
    this.data = {
      messages: [],
      agents: [],
      tasks: []
    };
  }

  async init() {
    try {
      // Try to load existing database
      const data = await fs.readFile(this.dbPath, 'utf8');
      this.data = JSON.parse(data);
      console.log('✅ Database loaded from file');
    } catch (error) {
      // File doesn't exist, create new database
      console.log('🆕 Creating new database');
      await this.seedInitialData();
      await this.save();
    }
  }

  async save() {
    try {
      await fs.writeFile(this.dbPath, JSON.stringify(this.data, null, 2));
    } catch (error) {
      console.error('Error saving database:', error);
    }
  }

  async seedInitialData() {
    const agents = [
      {
        id: 'scrum-master',
        role: 'Scrum Master/PO',
        system_prompt: 'You are a Scrum Master and Product Owner. You assign tasks, manage the development process, run tests, and ensure quality. You are organized, detail-oriented, and focus on project delivery.',
        active: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'senior-dev',
        role: 'Senior Developer',
        system_prompt: 'You are a Senior Developer. You review code, provide technical guidance, merge pull requests when approved, and mentor junior developers. You focus on code quality, best practices, and architecture.',
        active: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'junior-dev',
        role: 'Junior Developer',
        system_prompt: 'You are a Junior Developer. You write code, create pull requests, ask questions, and learn from feedback. You are eager to learn and implement features assigned by the team.',
        active: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    this.data.agents = agents;
    console.log('✅ Initial agents seeded');
  }

  async saveMessage(message) {
    const messageWithId = {
      id: message.id || uuidv4(),
      content: message.content,
      author: message.author,
      timestamp: message.timestamp,
      type: message.type || 'human'
    };

    this.data.messages.push(messageWithId);
    await this.save();
    return { id: messageWithId.id };
  }

  async getChatHistory(limit = 100) {
    return this.data.messages
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
      .slice(-limit);
  }

  async getAgent(agentId) {
    return this.data.agents.find(agent => agent.id === agentId);
  }

  async getAllAgents() {
    return this.data.agents.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  }

  async updateAgent(agentId, updates) {
    const agentIndex = this.data.agents.findIndex(agent => agent.id === agentId);
    
    if (agentIndex === -1) {
      throw new Error(`Agent ${agentId} not found`);
    }

    const agent = this.data.agents[agentIndex];
    
    if (updates.active !== undefined) {
      agent.active = updates.active;
    }
    
    if (updates.role !== undefined) {
      agent.role = updates.role;
    }
    
    if (updates.system_prompt !== undefined) {
      agent.system_prompt = updates.system_prompt;
    }
    
    agent.updated_at = new Date().toISOString();
    
    await this.save();
    return { changes: 1 };
  }

  async saveTask(task) {
    const taskWithDefaults = {
      id: task.id || uuidv4(),
      title: task.title,
      description: task.description || '',
      status: task.status || 'pending',
      assigned_to: task.assigned_to || null,
      github_pr_url: task.github_pr_url || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.data.tasks.push(taskWithDefaults);
    await this.save();
    return { id: taskWithDefaults.id };
  }

  async updateTask(taskId, updates) {
    const taskIndex = this.data.tasks.findIndex(task => task.id === taskId);
    
    if (taskIndex === -1) {
      throw new Error(`Task ${taskId} not found`);
    }

    const task = this.data.tasks[taskIndex];
    
    ['title', 'description', 'status', 'assigned_to', 'github_pr_url'].forEach(field => {
      if (updates[field] !== undefined) {
        task[field] = updates[field];
      }
    });
    
    task.updated_at = new Date().toISOString();
    
    await this.save();
    return { changes: 1 };
  }

  async getTasks(status = null) {
    let tasks = this.data.tasks;
    
    if (status) {
      tasks = tasks.filter(task => task.status === status);
    }
    
    return tasks.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  close() {
    // No cleanup needed for JSON file storage
    console.log('Database connection closed.');
  }
}

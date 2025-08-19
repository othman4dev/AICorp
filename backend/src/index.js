import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { AgentManager } from './services/AgentManager.js';
import { DatabaseService } from './services/DatabaseService.js';

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",        // Local development
      "http://localhost:3001",        // Alternative local port
      "http://167.71.242.221:5173",       // Replace with your VM's actual IP
      "http://167.71.242.221:3001",       // Alternative VM port
      "*"                             // Allow all origins (temporary for testing)
    ],
    methods: ["GET", "POST"],
    credentials: true
  },
  allowEIO3: true
});

// Update Express CORS as well
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:3001", 
    "http://167.71.242.221:5173",
    "http://167.71.242.221:3001",
    "*"  // Allow all origins (temporary for testing)
  ],
  credentials: true
}));

app.use(express.json());

// Initialize services
const dbService = new DatabaseService();
const agentManager = new AgentManager(dbService);

// Initialize database
await dbService.init();
await agentManager.initialize();

// Initialize agent manager
await agentManager.initialize();

// Socket.IO connection handling
io.on('connection', async (socket) => {
  console.log('Client connected:', socket.id);

  // Join the main room
  socket.join('dev-team');

  // Send initial data to the newly connected client
  try {
    // Send agents status
    const agentsStatus = await agentManager.getAgentsStatus();
    socket.emit('agentsUpdate', agentsStatus);

    // Send chat history using a different event to avoid confusion
    const chatHistory = await dbService.getChatHistory();
    socket.emit('chatHistory', chatHistory);
  } catch (error) {
    console.error('Error sending initial data:', error);
  }

  // Legacy handler - now disabled to prevent duplicates
  // socket.on('human-message', async (data) => { ... });

  // Handle messages (new format for ChatInterface)
  socket.on('message', async (data) => {
    try {
      const { content, sender } = data;
      const messageId = Date.now().toString();
      
      console.log('📨 Processing new message:', { content, sender, messageId });
      
      // Store human message
      const humanMessage = {
        id: messageId,
        content,
        sender: sender || 'Client',
        timestamp: new Date().toISOString(),
        type: 'human'
      };
      
      await dbService.saveMessage(humanMessage);

      // Broadcast human message to all clients immediately
      io.to('dev-team').emit('newMessage', humanMessage);
      console.log('📤 Human message broadcasted');

      // Trigger AI responses with enhanced callback
      console.log('🤖 Triggering AI responses...');
      agentManager.processHumanMessage(content, (aiResponse) => {
        console.log('🎯 AI response received:', { 
          agent: aiResponse.sender, 
          content: aiResponse.content?.substring(0, 50) + '...' 
        });
        io.to('dev-team').emit('newMessage', aiResponse);
        console.log('📤 AI response broadcasted');
      });

    } catch (error) {
      console.error('❌ Error handling message:', error);
      socket.emit('error', { message: 'Failed to process message' });
    }
  });

  // Handle agent control
  socket.on('toggle-agent', async (data) => {
    try {
      const { agentId, active } = data;
      await agentManager.toggleAgent(agentId, active);
      
      // Broadcast agent status update
      io.to('dev-team').emit('agent-status-update', {
        agentId,
        active,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error toggling agent:', error);
      socket.emit('error', { message: 'Failed to toggle agent' });
    }
  });

  // Handle role change
  socket.on('change-agent-role', async (data) => {
    try {
      const { agentId, newRole } = data;
      await agentManager.changeAgentRole(agentId, newRole);
      
      // Broadcast role change
      io.to('dev-team').emit('agent-role-change', {
        agentId,
        newRole,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error changing agent role:', error);
      socket.emit('error', { message: 'Failed to change agent role' });
    }
  });

  // Send chat history on connection
  socket.on('request-chat-history', async () => {
    try {
      const history = await dbService.getChatHistory();
      socket.emit('chat-history', history);
    } catch (error) {
      console.error('Error fetching chat history:', error);
      socket.emit('error', { message: 'Failed to fetch chat history' });
    }
  });

  // Send agent status on connection
  socket.on('request-agent-status', async () => {
    try {
      const status = await agentManager.getAgentsStatus();
      socket.emit('agents-status', status);
    } catch (error) {
      console.error('Error fetching agent status:', error);
      socket.emit('error', { message: 'Failed to fetch agent status' });
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// REST API endpoints
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.get('/api/agents/status', async (req, res) => {
  try {
    const status = await agentManager.getAgentsStatus();
    res.json(status);
  } catch (error) {
    console.error('Error getting agents status:', error);
    res.status(500).json({ error: 'Failed to get agents status' });
  }
});

app.get('/api/chat/history', async (req, res) => {
  try {
    const history = await dbService.getChatHistory();
    res.json(history);
  } catch (error) {
    console.error('Error getting chat history:', error);
    res.status(500).json({ error: 'Failed to get chat history' });
  }
});


const PORT = process.env.PORT || 3001;

server.listen(PORT, '0.0.0.0', () => {  // Add '0.0.0.0' here
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
  console.log(`🌐 Access via: http://167.71.242.221:${PORT}`);
  console.log(`📡 Socket.IO server ready`);
});

io.engine.on("connection_error", (err) => {
  console.log('❌ Socket.IO Connection Error:');
  console.log('- Error Code:', err.code);
  console.log('- Error Message:', err.message);
  console.log('- Request URL:', err.req?.url);
});

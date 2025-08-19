import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
  }

  connect(serverUrl = 'http://localhost:3001') {
    console.log('🔄 SocketService: Attempting to connect to', serverUrl);
    
    if (this.socket) {
      console.log('🔗 SocketService: Socket already exists, checking connection status...');
      console.log('📊 SocketService: Connected:', this.socket.connected);
      console.log('📊 SocketService: ID:', this.socket.id);
      return this.socket;
    }

    this.socket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      timeout: 20000,
      forceNew: true
    });

    this.socket.on('connect', () => {
      console.log('✅ SocketService: Connected to server with ID:', this.socket.id);
      this.isConnected = true;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ SocketService: Disconnected from server. Reason:', reason);
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('🚫 SocketService: Connection error:', error);
      this.isConnected = false;
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('� SocketService: Reconnected after', attemptNumber, 'attempts');
      this.isConnected = true;
    });

    this.socket.on('reconnect_attempt', (attemptNumber) => {
      console.log('🔄 SocketService: Reconnection attempt', attemptNumber);
    });

    this.socket.on('reconnect_error', (error) => {
      console.error('🚫 SocketService: Reconnection error:', error);
    });

    this.socket.on('reconnect_failed', () => {
      console.error('💥 SocketService: Reconnection failed');
      this.isConnected = false;
    });

    console.log('�🚀 SocketService: Socket instance created, attempting connection...');
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Message handling
  sendHumanMessage(message, author = 'Human') {
    if (this.socket) {
      this.socket.emit('human-message', { message, author });
    }
  }

  onNewMessage(callback) {
    if (this.socket) {
      this.socket.on('new-message', callback);
    }
  }

  onChatHistory(callback) {
    if (this.socket) {
      this.socket.on('chat-history', callback);
    }
  }

  requestChatHistory() {
    if (this.socket) {
      this.socket.emit('request-chat-history');
    }
  }

  // Agent control
  toggleAgent(agentId, active) {
    if (this.socket) {
      this.socket.emit('toggle-agent', { agentId, active });
    }
  }

  changeAgentRole(agentId, newRole) {
    if (this.socket) {
      this.socket.emit('change-agent-role', { agentId, newRole });
    }
  }

  onAgentStatusUpdate(callback) {
    if (this.socket) {
      this.socket.on('agent-status-update', callback);
    }
  }

  onAgentRoleChange(callback) {
    if (this.socket) {
      this.socket.on('agent-role-change', callback);
    }
  }

  onAgentsStatus(callback) {
    if (this.socket) {
      this.socket.on('agents-status', callback);
    }
  }

  requestAgentStatus() {
    if (this.socket) {
      this.socket.emit('request-agent-status');
    }
  }

  // Error handling
  onError(callback) {
    if (this.socket) {
      this.socket.on('error', callback);
    }
  }

  // Generic event handling
  on(eventName, callback) {
    console.log(`🎧 SocketService: Registering listener for '${eventName}'`);
    if (this.socket) {
      this.socket.on(eventName, callback);
      console.log(`✅ SocketService: Listener registered for '${eventName}'`);
    } else {
      console.warn(`⚠️ SocketService: No socket connection available for '${eventName}' listener`);
    }
  }

  // Remove listeners
  off(eventName, callback) {
    if (this.socket) {
      this.socket.off(eventName, callback);
    }
  }

  // Send message (generic)
  sendMessage(message) {
    console.log('📨 SocketService: Attempting to send message:', message);
    console.log('🔗 SocketService: Socket exists:', !!this.socket);
    console.log('🔗 SocketService: Socket connected:', this.socket?.connected);
    
    if (this.socket) {
      try {
        this.socket.emit('message', { content: message, sender: 'Client' });
        console.log('✅ SocketService: Message emitted successfully');
      } catch (error) {
        console.error('❌ SocketService: Error emitting message:', error);
      }
    } else {
      console.error('❌ SocketService: No socket connection available');
    }
  }
}

export const socketService = new SocketService();

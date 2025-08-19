import React, { useState, useEffect, useRef } from 'react';
import { socketService } from '../services/socketService';

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [agents, setAgents] = useState({});
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    let reconnectTimer = null;
    
    const initializeConnection = () => {
      try {
        console.log('🚀 ChatInterface: Initializing socket connection...');
        
        // Connect to socket server
        const socket = socketService.connect();
        
        if (!socket) {
          console.error('❌ ChatInterface: Failed to get socket instance');
          setIsConnected(false);
          return;
        }

        console.log('✅ ChatInterface: Socket instance obtained');

        const handleConnect = () => {
          console.log('🎉 ChatInterface: Connected to server successfully');
          setIsConnected(true);
          if (reconnectTimer) {
            clearTimeout(reconnectTimer);
            reconnectTimer = null;
          }
        };

        const handleDisconnect = () => {
          console.log('⚠️ ChatInterface: Disconnected from server');
          setIsConnected(false);
          
          // Try to reconnect after 3 seconds
          if (!reconnectTimer) {
            reconnectTimer = setTimeout(() => {
              console.log('🔄 ChatInterface: Attempting to reconnect...');
              initializeConnection();
            }, 3000);
          }
        };

        const handleNewMessage = (message) => {
          console.log('📨 ChatInterface: New message received:', message);
          
          // Prevent duplicate messages by checking if message already exists
          setMessages(prev => {
            const exists = prev.find(m => m.id === message.id && m.timestamp === message.timestamp);
            if (exists) {
              console.log('⚠️ ChatInterface: Duplicate message ignored:', message.id);
              return prev;
            }
            console.log('✅ ChatInterface: Adding new message to chat');
            return [...prev, message];
          });
          scrollToBottom();
        };

        const handleChatHistory = (history) => {
          console.log('📚 ChatInterface: Chat history received:', history.length, 'messages');
          setMessages(history || []);
          scrollToBottom();
        };

        const handleAgentUpdate = (agentData) => {
          console.log('🤖 ChatInterface: Agent update received:', agentData);
          setAgents(prev => ({
            ...prev,
            [agentData.id]: agentData
          }));
        };

        const handleAgentsUpdate = (agentsData) => {
          console.log('👥 ChatInterface: Agents update received:', agentsData);
          setAgents(agentsData);
        };

        const handleError = (error) => {
          console.error('❌ ChatInterface: Socket error:', error);
        };

        // Set up event listeners immediately
        socketService.on('connect', handleConnect);
        socketService.on('disconnect', handleDisconnect);
        socketService.on('newMessage', handleNewMessage);
        socketService.on('chatHistory', handleChatHistory);
        socketService.on('agentUpdate', handleAgentUpdate);
        socketService.on('agentsUpdate', handleAgentsUpdate);
        socketService.on('error', handleError);

        // Check connection status periodically
        const checkConnection = () => {
          const connected = socket?.connected;
          console.log('🔍 ChatInterface: Connection check - connected:', connected, 'socket ID:', socket?.id, 'current isConnected:', isConnected);
          
          if (connected && !isConnected) {
            console.log('🎉 ChatInterface: Socket is connected but state not updated, fixing...');
            setIsConnected(true);
          } else if (!connected && isConnected) {
            console.log('⚠️ ChatInterface: Socket is disconnected but state not updated, fixing...');
            setIsConnected(false);
          }
        };

        // Check immediately
        setTimeout(() => {
          checkConnection();
          // If still not connected after 2 seconds, force it
          if (!isConnected && socket?.connected) {
            console.log('� ChatInterface: Force-setting connection state to true');
            setIsConnected(true);
          }
        }, 2000);

        // Set up periodic checking every 3 seconds (less frequent)
        const connectionChecker = setInterval(checkConnection, 3000);

        return () => {
          console.log('🧹 ChatInterface: Cleaning up event listeners');
          if (reconnectTimer) {
            clearTimeout(reconnectTimer);
          }
          if (connectionChecker) {
            clearInterval(connectionChecker);
          }
          try {
            socketService.off('connect', handleConnect);
            socketService.off('disconnect', handleDisconnect);
            socketService.off('newMessage', handleNewMessage);
            socketService.off('chatHistory', handleChatHistory);
            socketService.off('agentUpdate', handleAgentUpdate);
            socketService.off('agentsUpdate', handleAgentsUpdate);
            socketService.off('error', handleError);
          } catch (error) {
            console.warn('⚠️ ChatInterface: Error during cleanup:', error);
          }
        };
      } catch (error) {
        console.error('💥 ChatInterface: Failed to initialize socket connection:', error);
        setIsConnected(false);
      }
    };

    const cleanup = initializeConnection();
    
    return cleanup;
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = () => {
    if (inputMessage.trim()) {
      console.log('📤 ChatInterface: Sending message:', inputMessage);
      console.log('📊 ChatInterface: Socket connected:', socketService.isConnected);
      
      try {
        socketService.sendMessage(inputMessage);
        console.log('✅ ChatInterface: Message sent successfully');
        setInputMessage('');
      } catch (error) {
        console.error('❌ ChatInterface: Error sending message:', error);
      }
    } else {
      console.log('⚠️ ChatInterface: Empty message not sent');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const insertQuickTag = (tag) => {
    setInputMessage(prev => prev + tag + ' ');
  };

  const isTaggedMessage = (content) => {
    return /@(PO|SENIOR|JUNIOR|DEV|ALL)\b/i.test(content);
  };

  const extractTags = (content) => {
    const matches = content.match(/@(PO|SENIOR|JUNIOR|DEV|ALL)\b/gi);
    return matches || [];
  };

  const formatMessage = (content) => {
    return content.replace(/@(PO|SENIOR|JUNIOR|DEV|ALL)\b/gi, '<span class="bg-blue-200 px-1 rounded font-semibold">@$1</span>');
  };

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h3 className="text-lg font-medium mb-2">Connecting to Dev Team...</h3>
          <p className="text-gray-600 mb-4">Please wait while we establish connection with your AI development team.</p>
          <div className="text-sm text-gray-500">
            <p>Backend: http://localhost:3001</p>
            <p>Frontend: http://localhost:5173</p>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors mr-2"
          >
            Reload Page
          </button>
          <button 
            onClick={() => {
              console.log('🔧 Manual override: Setting connected to true');
              setIsConnected(true);
            }}
            className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
          >
            Force Connect
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b p-4 flex-shrink-0">
        <h2 className="text-xl font-semibold">Dev Team Chat</h2>
        <p className="text-sm text-gray-600">
          Connected • {Object.keys(agents).length} agents online
        </p>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-lg font-medium mb-2">Welcome to the Dev Team Chat!</h3>
            <p className="text-gray-600">Start a conversation with your AI development team.</p>
            <div className="mt-4 space-x-2">
              <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                Try: @PO Create a login system
              </span>
              <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">
                Try: @SENIOR Review this code
              </span>
            </div>
          </div>
        ) : (
          messages.map((message) => {
            if (!message || !message.content) {
              return null; // Skip invalid messages
            }
            
            // Handle both 'sender' and 'author' fields for backward compatibility
            const messageSender = message.sender || message.author || 'Unknown';
            const isClient = messageSender === 'Client' || messageSender === 'Human';
            
            const isTagged = isTaggedMessage(message.content);
            const tags = extractTags(message.content);
            
            return (
              <div
                key={message.id ? `${message.id}-${message.timestamp}` : `msg-${Math.random()}-${Date.now()}`}
                className={`p-3 rounded-lg ${
                  isClient 
                    ? 'bg-blue-100 ml-12' 
                    : isTagged
                    ? 'bg-yellow-50 border-2 border-yellow-200'
                    : 'bg-gray-100 mr-12'
                }`}
              >
                <div className="flex items-center mb-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                    isClient 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-500 text-white'
                  }`}>
                    {isClient ? 'C' : (messageSender ? messageSender.charAt(0) : '?')}
                  </div>
                  <div className="ml-3">
                    <div className="font-semibold">{messageSender}</div>
                    <div className="text-xs text-gray-500">
                      {message.timestamp ? new Date(message.timestamp).toLocaleTimeString() : 'No timestamp'}
                      {tags.length > 0 && (
                        <span className="ml-2 text-blue-600">
                          {tags.join(' ')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div 
                  className="text-gray-800 whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{ __html: formatMessage(message.content || '') }}
                />
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white border-t p-4 flex-shrink-0">
        {/* Quick Tag Buttons */}
        <div className="mb-3 flex flex-wrap gap-2">
          <button
            onClick={() => insertQuickTag('@PO')}
            className="px-3 py-1 bg-purple-100 hover:bg-purple-200 text-purple-800 rounded-full text-sm font-medium transition-colors"
          >
            @PO
          </button>
          <button
            onClick={() => insertQuickTag('@SENIOR')}
            className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-full text-sm font-medium transition-colors"
          >
            @SENIOR
          </button>
          <button
            onClick={() => insertQuickTag('@JUNIOR')}
            className="px-3 py-1 bg-green-100 hover:bg-green-200 text-green-800 rounded-full text-sm font-medium transition-colors"
          >
            @JUNIOR
          </button>
          <button
            onClick={() => insertQuickTag('@ALL')}
            className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-800 rounded-full text-sm font-medium transition-colors"
          >
            @ALL
          </button>
        </div>

        <div className="flex items-end space-x-2">
          <div className="flex-1">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message... Use @PO, @SENIOR, @JUNIOR to tag specific agents"
              className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
            />
          </div>
          <button
            onClick={sendMessage}
            disabled={!inputMessage.trim()}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;

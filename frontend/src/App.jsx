import React, { useState } from 'react';
import ChatInterface from './components/ChatInterface';
import AgentControlPanel from './components/AgentControlPanel';

const App = () => {
  const [activeTab, setActiveTab] = useState('chat');

  const tabs = [
    { id: 'chat', name: 'Team Chat', icon: '💬' },
    { id: 'agents', name: 'Agent Control', icon: '🤖' },
  ];

  return (
    <div className="h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="text-2xl">🏢</div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">AICorp Dev Team</h1>
                <p className="text-sm text-gray-500">Multi-Agent Development Simulator</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-500">
                v1.0.0
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-80 bg-white shadow-sm border-r border-gray-200 flex flex-col">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span>{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {activeTab === 'agents' && <AgentControlPanel />}
            {activeTab === 'chat' && (
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-4 text-white">
                  <h3 className="font-semibold mb-2">👋 Welcome!</h3>
                  <p className="text-sm opacity-90">
                    Chat with your AI development team. They'll collaborate to help you build features, review code, and manage tasks.
                  </p>
                </div>
                
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">🚀 Try these commands:</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="bg-gray-50 p-2 rounded">
                      "Build a simple calculator component"
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      "@PO Create a user authentication system"
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      "@SENIOR Review my React component code"
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      "@JUNIOR Implement a shopping cart feature"
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-lg p-4 text-white">
                  <h4 className="font-semibold mb-2">🏷️ Agent Tagging System</h4>
                  <p className="text-sm opacity-90 mb-2">
                    Tag specific agents to get focused responses:
                  </p>
                  <div className="grid grid-cols-2 gap-1 text-xs">
                    <div>@PO, @SCRUM → Scrum Master</div>
                    <div>@SENIOR → Senior Dev</div>
                    <div>@JUNIOR → Junior Dev</div>
                    <div>@DEV → Both Devs</div>
                    <div>@ALL → Everyone</div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-medium text-yellow-900 mb-2">⚠️ Setup Required</h4>
                  <p className="text-sm text-yellow-700">
                    Make sure to configure your <code className="bg-yellow-100 px-1 rounded">.env</code> file with:
                  </p>
                  <ul className="text-xs text-yellow-600 mt-2 space-y-1">
                    <li>• GEMINI_API_KEY</li>
                    <li>• GITHUB_TOKEN</li>
                    <li>• GITHUB_REPO_OWNER</li>
                    <li>• GITHUB_REPO_NAME</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          <ChatInterface />
        </div>
      </div>

      {/* Status Bar */}
      <footer className="bg-gray-50 border-t border-gray-200 px-4 py-2">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div>
            Multi-Agent Development Team Simulator | Built with React + Node.js + Socket.IO
          </div>
          <div>
            Powered by Google Gemini AI & GitHub API
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;

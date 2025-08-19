import React, { useState, useEffect } from 'react';
import { socketService } from '../services/socketService';

const AgentCard = ({ agent, onToggle, onRoleChange }) => {
  const [isChangingRole, setIsChangingRole] = useState(false);
  const [newRole, setNewRole] = useState(agent.role);

  const availableRoles = [
    'Scrum Master/PO',
    'Senior Developer', 
    'Junior Developer',
    'DevOps Engineer',
    'QA Tester',
    'UI/UX Designer'
  ];

  const getStatusColor = (active) => {
    return active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
  };

  const getAgentIcon = (role) => {
    const icons = {
      'Scrum Master/PO': '📋',
      'Senior Developer': '👨‍💻',
      'Junior Developer': '👩‍💻',
      'DevOps Engineer': '⚙️',
      'QA Tester': '🧪',
      'UI/UX Designer': '🎨'
    };
    return icons[role] || '🤖';
  };

  const handleRoleSubmit = (e) => {
    e.preventDefault();
    if (newRole !== agent.role) {
      onRoleChange(agent.id, newRole);
    }
    setIsChangingRole(false);
  };

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{getAgentIcon(agent.role)}</span>
          <div>
            <h3 className="font-medium text-gray-900">{agent.role}</h3>
            <p className="text-sm text-gray-500">ID: {agent.id}</p>
          </div>
        </div>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(agent.active)}`}>
          {agent.active ? 'Active' : 'Inactive'}
        </span>
      </div>

      {/* Role Change Form */}
      {isChangingRole ? (
        <form onSubmit={handleRoleSubmit} className="mb-3">
          <select
            value={newRole}
            onChange={(e) => setNewRole(e.target.value)}
            className="w-full px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-2"
          >
            {availableRoles.map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => {
                setIsChangingRole(false);
                setNewRole(agent.role);
              }}
              className="flex-1 px-3 py-1 text-xs bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setIsChangingRole(true)}
          className="w-full px-3 py-1 text-xs text-blue-600 border border-blue-600 rounded hover:bg-blue-50 mb-3"
        >
          Change Role
        </button>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => onToggle(agent.id, !agent.active)}
        className={`w-full px-3 py-2 text-sm font-medium rounded transition-colors ${
          agent.active
            ? 'bg-red-100 text-red-700 hover:bg-red-200'
            : 'bg-green-100 text-green-700 hover:bg-green-200'
        }`}
      >
        {agent.active ? 'Pause Agent' : 'Activate Agent'}
      </button>

      {agent.lastResponse && (
        <div className="mt-3 text-xs text-gray-500">
          <p className="font-medium">Last Response:</p>
          <p className="truncate">{agent.lastResponse.substring(0, 50)}...</p>
        </div>
      )}
    </div>
  );
};

const AgentControlPanel = () => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up event listeners
    socketService.onAgentsStatus((agentsStatus) => {
      setAgents(agentsStatus);
      setLoading(false);
    });

    socketService.onAgentStatusUpdate((update) => {
      setAgents(prev => 
        prev.map(agent => 
          agent.id === update.agentId 
            ? { ...agent, active: update.active }
            : agent
        )
      );
    });

    socketService.onAgentRoleChange((update) => {
      setAgents(prev =>
        prev.map(agent =>
          agent.id === update.agentId
            ? { ...agent, role: update.newRole }
            : agent
        )
      );
    });

    // Request initial agent status
    socketService.requestAgentStatus();

    return () => {
      // Clean up listeners if needed
    };
  }, []);

  const handleToggleAgent = (agentId, active) => {
    socketService.toggleAgent(agentId, active);
  };

  const handleRoleChange = (agentId, newRole) => {
    socketService.changeAgentRole(agentId, newRole);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-gray-500">Loading agents...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">AI Agent Control</h2>
        <div className="text-sm text-gray-500">
          {agents.filter(a => a.active).length}/{agents.length} active
        </div>
      </div>

      {agents.map((agent) => (
        <AgentCard
          key={agent.id}
          agent={agent}
          onToggle={handleToggleAgent}
          onRoleChange={handleRoleChange}
        />
      ))}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">💡 Tips:</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Pause agents to control conversation flow</li>
          <li>• Change roles to experiment with different team dynamics</li>
          <li>• All agents work together in the chat interface</li>
        </ul>
      </div>
    </div>
  );
};

export default AgentControlPanel;

import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import StatisticsCards from './StatisticsCards';
import AddTask from './AddTask';
import TaskList from './TaskList';
import AddProject from './AddProject';
import ProjectList from './ProjectList';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('tasks');

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-700">
              Welcome, {user?.name}! 
              {user?.role === 'Admin' && <span className="ml-2 text-xs bg-purple-500 text-white px-2 py-1 rounded-full">Admin</span>}
            </span>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 transition duration-200"
            >
              Logout
            </button>
          </div>
        </div>
        
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('tasks')}
            className={`px-6 py-2 rounded-lg font-semibold transition duration-200 ${activeTab === 'tasks' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
          >
            Tasks
          </button>
          <button
            onClick={() => setActiveTab('projects')}
            className={`px-6 py-2 rounded-lg font-semibold transition duration-200 ${activeTab === 'projects' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
          >
            Projects
          </button>
        </div>

        {activeTab === 'tasks' && (
          <>
            <StatisticsCards />
            <AddTask />
            <TaskList />
          </>
        )}

        {activeTab === 'projects' && (
          <>
            <AddProject />
            <ProjectList />
          </>
        )}
      </div>
    </div>
  );
}

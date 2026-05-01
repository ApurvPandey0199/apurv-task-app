import { useState } from 'react';
import { useProjects } from '../contexts/ProjectContext';
import { useAuth } from '../contexts/AuthContext';

export default function AddProject() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const { addProject } = useProjects();
  const { user } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    await addProject({ name, description });
    setName('');
    setDescription('');
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">Create New Project</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">Project Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter project name"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter project description"
            rows="3"
          ></textarea>
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 transition duration-200"
        >
          Create Project
        </button>
      </form>
    </div>
  );
}

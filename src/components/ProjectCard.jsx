import { useState } from 'react';
import { useProjects } from '../contexts/ProjectContext';
import { useAuth } from '../contexts/AuthContext';

export default function ProjectCard({ project }) {
  const { updateProject, deleteProject, addProjectMember, removeProjectMember } = useProjects();
  const { user, getAllUsers } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(project.name);
  const [editDescription, setEditDescription] = useState(project.description);
  const [selectedMember, setSelectedMember] = useState('');

  const isAdmin = user?.role === 'Admin';
  const allUsers = getAllUsers();
  const projectMemberIds = (project.project_members || []).map(pm => pm.user_id);
  const availableMembers = allUsers.filter(u => !projectMemberIds.includes(u.id) && u.id !== project.created_by);

  const handleSave = async () => {
    await updateProject(project.id, { name: editName, description: editDescription });
    setIsEditing(false);
  };

  const handleAssignMember = async () => {
    if (selectedMember) {
      await addProjectMember(project.id, selectedMember);
      setSelectedMember('');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      {isEditing ? (
        <div className="space-y-4">
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <textarea
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="2"
          ></textarea>
          <div className="flex gap-2">
            <button onClick={handleSave} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">Save</button>
            <button onClick={() => setIsEditing(false)} className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700">Cancel</button>
          </div>
        </div>
      ) : (
        <div>
          <div className="flex justify-between items-start mb-3">
            <h4 className="text-lg font-semibold text-gray-800">{project.name}</h4>
            {(isAdmin || project.created_by === user.id) && (
              <div className="flex gap-2">
                <button onClick={() => setIsEditing(true)} className="text-blue-500 hover:text-blue-700">Edit</button>
                {isAdmin && (
                  <button onClick={() => deleteProject(project.id)} className="text-red-500 hover:text-red-700">Delete</button>
                )}
              </div>
            )}
          </div>
          {project.description && (
            <p className="text-gray-600 mb-3">{project.description}</p>
          )}
          <div className="text-sm text-gray-500 mb-3">
            Created by: {allUsers.find(u => u.id === project.created_by)?.name || project.created_by}
          </div>
          {project.project_members && project.project_members.length > 0 && (
            <div className="mb-3">
              <p className="text-sm font-semibold text-gray-700 mb-1">Team Members:</p>
              <div className="flex flex-wrap gap-2">
                {project.project_members.map(member => {
                  const memberUser = allUsers.find(u => u.id === member.user_id);
                  return (
                    <div key={member.id} className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                      {memberUser?.name || member.user_id}
                      {isAdmin && (
                        <button onClick={() => removeProjectMember(project.id, member.user_id)} className="text-blue-600 hover:text-blue-800 ml-1">✕</button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {isAdmin && availableMembers.length > 0 && (
            <div className="flex gap-2">
              <select
                value={selectedMember}
                onChange={(e) => setSelectedMember(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="">Assign team member...</option>
                {availableMembers.map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                ))}
              </select>
              <button onClick={handleAssignMember} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm">Assign</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

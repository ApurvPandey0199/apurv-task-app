import { useTasks } from '../contexts/TaskContext';
import { useProjects } from '../contexts/ProjectContext';
import { useAuth } from '../contexts/AuthContext';

export default function TaskCard({ task }) {
  const { updateTask, deleteTask } = useTasks();
  const { projects } = useProjects();
  const { getAllUsers } = useAuth();
  const allUsers = getAllUsers();
  const now = new Date();
  const isOverdue = task.status !== 'Completed' && task.due_date && new Date(task.due_date) < now;

  const statusColors = {
    'Todo': 'bg-yellow-100 text-yellow-800',
    'In Progress': 'bg-purple-100 text-purple-800',
    'Completed': 'bg-green-100 text-green-800',
  };

  const priorityColors = {
    'Low': 'bg-green-100 text-green-800',
    'Medium': 'bg-yellow-100 text-yellow-800',
    'High': 'bg-red-100 text-red-800',
  };

  const project = projects.find((p) => p.id === task.project_id);
  const assignedUser = allUsers.find((u) => u.id === task.assigned_to);

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${isOverdue ? 'border-red-500' : 'border-gray-200'} transition duration-200 hover:shadow-lg`}>
      <div className="flex justify-between items-start mb-3">
        <h4 className="text-lg font-semibold text-gray-800">{task.title}</h4>
        <div className="flex gap-2">
          <button
            onClick={() => updateTask(task.id, { status: 'Completed' })}
            className={`text-sm px-3 py-1 rounded-lg transition duration-200 ${
              task.status === 'Completed' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            ✓ Complete
          </button>
          <button onClick={() => deleteTask(task.id)} className="text-red-500 hover:text-red-700 text-sm">
            🗑️
          </button>
        </div>
      </div>
      {task.description && <p className="text-gray-600 mb-3">{task.description}</p>}
      <div className="flex flex-wrap items-center gap-3 mb-3">
        <span className={`text-xs px-2 py-1 rounded-full ${statusColors[task.status]}`}>{task.status}</span>
        <span className={`text-xs px-2 py-1 rounded-full ${priorityColors[task.priority || 'Medium']}`}>
          {task.priority || 'Medium'} priority
        </span>
        {assignedUser && (
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
            Assigned to: {assignedUser.name}
          </span>
        )}
        {project && (
          <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
            Project: {project.name}
          </span>
        )}
      </div>
      <div className="flex items-center justify-between">
        {task.due_date && (
          <span className={`text-sm ${isOverdue ? 'text-red-600 font-semibold' : 'text-gray-500'}`}>
            Due: {new Date(task.due_date).toLocaleDateString()}
            {isOverdue && ' (Overdue)'}
          </span>
        )}
        <select
          value={task.status}
          onChange={(e) => updateTask(task.id, { status: e.target.value })}
          className="text-xs px-2 py-1 rounded border border-gray-300"
        >
          <option value="Todo">Todo</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>
      </div>
    </div>
  );
}

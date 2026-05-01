import { useState } from 'react';
import { useTasks } from '../contexts/TaskContext';
import TaskCard from './TaskCard';
import TaskFilters from './TaskFilters';

export default function TaskList() {
  const { tasks, loading, getTasksByStatus, getOverdueTasks, filterTasks } = useTasks();
  const [filters, setFilters] = useState({ status: '', assignee: '', projectId: '' });

  if (loading) {
    return (
      <div className="space-y-8">
        <h3 className="text-xl font-semibold text-gray-800">Tasks</h3>
        <p className="text-gray-500">Loading tasks...</p>
      </div>
    );
  }

  const filteredTasks = filterTasks(filters);
  const todoTasks = filteredTasks.filter((t) => t.status === 'Todo');
  const inProgressTasks = filteredTasks.filter((t) => t.status === 'In Progress');
  const completedTasks = filteredTasks.filter((t) => t.status === 'Completed');
  const overdueTasks = getOverdueTasks().filter((t) => {
    if (filters.status && t.status !== filters.status) return false;
    if (filters.assignee && t.assigned_to !== filters.assignee) return false;
    if (filters.projectId && t.project_id !== filters.projectId) return false;
    return true;
  });

  const statusGroups = [
    { label: 'Todo', tasks: todoTasks, color: 'border-yellow-500' },
    { label: 'In Progress', tasks: inProgressTasks, color: 'border-purple-500' },
    { label: 'Completed', tasks: completedTasks, color: 'border-green-500' },
  ];

  return (
    <div className="space-y-8">
      <TaskFilters filters={filters} setFilters={setFilters} />

      {overdueTasks.length > 0 && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-red-800 mb-3">Overdue Tasks ({overdueTasks.length})</h3>
          <div className="space-y-3">
            {overdueTasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {statusGroups.map((group) => (
          <div key={group.label} className="bg-gray-50 rounded-lg p-4">
            <h3 className={`text-lg font-semibold mb-4 text-gray-800 border-l-4 pl-3 ${group.color}`}>
              {group.label} ({group.tasks.length})
            </h3>
            <div className="space-y-3">
              {group.tasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
              {group.tasks.length === 0 && (
                <p className="text-gray-500 text-center py-4">No tasks</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

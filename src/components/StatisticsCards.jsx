import { useTasks } from '../contexts/TaskContext';

export default function StatisticsCards() {
  const { getStatistics } = useTasks();
  const stats = getStatistics();

  const cards = [
    { label: 'Total Tasks', value: stats.total, color: 'bg-blue-500' },
    { label: 'Todo', value: stats.todo, color: 'bg-yellow-500' },
    { label: 'In Progress', value: stats.inProgress, color: 'bg-purple-500' },
    { label: 'Completed', value: stats.completed, color: 'bg-green-500' },
    { label: 'Overdue', value: stats.overdue, color: 'bg-red-500' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
      {cards.map((card, index) => (
        <div key={index} className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className={`${card.color} p-3 rounded-full`}>
              <div className="w-6 h-6 text-white"></div>
            </div>
            <div className="ml-4">
              <p className="text-gray-500 text-sm">{card.label}</p>
              <p className="text-2xl font-bold text-gray-800">{card.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

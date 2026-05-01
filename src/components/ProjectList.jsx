import { useProjects } from '../contexts/ProjectContext';
import ProjectCard from './ProjectCard';

export default function ProjectList() {
  const { projects, loading } = useProjects();

  if (loading) {
    return (
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4 text-gray-800">All Projects</h3>
        <p className="text-gray-500">Loading projects...</p>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">All Projects ({projects.length})</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map(project => (
          <ProjectCard key={project.id} project={project} />
        ))}
        {projects.length === 0 && (
          <div className="col-span-full text-center py-8 bg-white rounded-lg shadow-md">
            <p className="text-gray-500">No projects yet</p>
          </div>
        )}
      </div>
    </div>
  );
}

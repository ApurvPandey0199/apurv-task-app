import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { projectsAPI, projectMembersAPI } from '../lib/api';
import { useAuth } from './AuthContext';

const ProjectContext = createContext();

export const ProjectProvider = ({ children }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchProjects();
      subscribeToProjects();
    } else {
      setProjects([]);
      setLoading(false);
    }
  }, [user]);

  const fetchProjects = async () => {
    try {
      const data = await projectsAPI.getAll();
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToProjects = () => {
    const subscription = supabase
      .channel('projects')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects',
        },
        () => {
          fetchProjects();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const addProject = async (project) => {
    try {
      return await projectsAPI.create({
        name: project.name,
        description: project.description,
        created_by: user.id,
      });
    } catch (error) {
      console.error('Error adding project:', error);
    }
  };

  const updateProject = async (id, updatedProject) => {
    try {
      await projectsAPI.update(id, updatedProject);
    } catch (error) {
      console.error('Error updating project:', error);
    }
  };

  const deleteProject = async (id) => {
    try {
      await projectsAPI.delete(id);
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  const addProjectMember = async (projectId, userId, role = 'Member') => {
    try {
      await projectMembersAPI.add(projectId, userId, role);
    } catch (error) {
      console.error('Error adding project member:', error);
    }
  };

  const removeProjectMember = async (projectId, userId) => {
    try {
      await projectMembersAPI.remove(projectId, userId);
    } catch (error) {
      console.error('Error removing project member:', error);
    }
  };

  return (
    <ProjectContext.Provider
      value={{
        projects,
        loading,
        addProject,
        updateProject,
        deleteProject,
        addProjectMember,
        removeProjectMember,
        fetchProjects,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjects = () => useContext(ProjectContext);

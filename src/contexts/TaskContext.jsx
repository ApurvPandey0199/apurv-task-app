import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { tasksAPI } from '../lib/api';
import { useAuth } from './AuthContext';

const TaskContext = createContext();

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchTasks();
      subscribeToTasks();
    } else {
      setTasks([]);
      setLoading(false);
    }
  }, [user]);

  const fetchTasks = async () => {
    try {
      const data = await tasksAPI.getAll();
      setTasks(data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToTasks = () => {
    const subscription = supabase
      .channel('tasks')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
        },
        () => {
          fetchTasks();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const addTask = async (task) => {
    try {
      return await tasksAPI.create({
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        due_date: task.dueDate,
        project_id: task.projectId,
        assigned_to: task.assignee,
        created_by: user.id,
      });
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const updateTask = async (id, updatedTask) => {
    try {
      await tasksAPI.update(id, updatedTask);
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const deleteTask = async (id) => {
    try {
      await tasksAPI.delete(id);
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const assignTask = async (id, userId) => {
    try {
      return await tasksAPI.assign(id, userId);
    } catch (error) {
      console.error('Error assigning task:', error);
    }
  };

  const getTasksByStatus = (status) => {
    return tasks.filter((task) => task.status === status);
  };

  const getOverdueTasks = () => {
    const now = new Date();
    return tasks.filter((task) => {
      if (task.status === 'Completed') return false;
      if (!task.due_date) return false;
      return new Date(task.due_date) < now;
    });
  };

  const getStatistics = () => {
    const todo = getTasksByStatus('Todo').length;
    const inProgress = getTasksByStatus('In Progress').length;
    const completed = getTasksByStatus('Completed').length;
    const overdue = getOverdueTasks().length;
    return { total: tasks.length, todo, inProgress, completed, overdue };
  };

  const filterTasks = (filters) => {
    return tasks.filter((task) => {
      if (filters.status && task.status !== filters.status) return false;
      if (filters.assignee && task.assigned_to !== filters.assignee) return false;
      if (filters.projectId && task.project_id !== filters.projectId) return false;
      return true;
    });
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        loading,
        addTask,
        updateTask,
        deleteTask,
        assignTask,
        getTasksByStatus,
        getOverdueTasks,
        getStatistics,
        filterTasks,
        fetchTasks,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => useContext(TaskContext);

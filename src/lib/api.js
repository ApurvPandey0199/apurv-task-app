import { supabase } from './supabase';

// Projects API
export const projectsAPI = {
  async getAll() {
    const { data, error } = await supabase
      .from('projects')
      .select('*, project_members(*)');
    if (error) throw error;
    return data;
  },

  async create(project) {
    const { data, error } = await supabase
      .from('projects')
      .insert([project])
      .select();
    if (error) throw error;
    return data[0];
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', id)
      .select();
    if (error) throw error;
    return data[0];
  },

  async delete(id) {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
};

// Project Members API
export const projectMembersAPI = {
  async add(projectId, userId, role = 'Member') {
    const { data, error } = await supabase
      .from('project_members')
      .insert([{ project_id: projectId, user_id: userId, role }])
      .select();
    if (error) throw error;
    return data[0];
  },

  async remove(projectId, userId) {
    const { error } = await supabase
      .from('project_members')
      .delete()
      .eq('project_id', projectId)
      .eq('user_id', userId);
    if (error) throw error;
  },

  async getByProject(projectId) {
    const { data, error } = await supabase
      .from('project_members')
      .select('*, users(*)')
      .eq('project_id', projectId);
    if (error) throw error;
    return data;
  }
};

// Tasks API
export const tasksAPI = {
  async getAll() {
    const { data, error } = await supabase
      .from('tasks')
      .select('*, projects(*), assigned_user:users!tasks_assigned_to_fkey(*), created_user:users!tasks_created_by_fkey(*)');
    if (error) throw error;
    return data;
  },

  async create(task) {
    const { data, error } = await supabase
      .from('tasks')
      .insert([task])
      .select();
    if (error) throw error;
    return data[0];
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select();
    if (error) throw error;
    return data[0];
  },

  async delete(id) {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  async assign(id, userId) {
    const { data, error } = await supabase
      .from('tasks')
      .update({ assigned_to: userId })
      .eq('id', id)
      .select();
    if (error) throw error;
    return data[0];
  }
};

// Users API
export const usersAPI = {
  async getAll() {
    const { data, error } = await supabase
      .from('users')
      .select('*');
    if (error) throw error;
    return data;
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  }
};

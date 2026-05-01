-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('Admin', 'Member')) DEFAULT 'Member',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create project_members table (junction table for many-to-many relationship)
CREATE TABLE IF NOT EXISTS project_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('Admin', 'Member')) DEFAULT 'Member',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(project_id, user_id)
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL CHECK (status IN ('Todo', 'In Progress', 'Completed')) DEFAULT 'Todo',
    priority TEXT NOT NULL CHECK (priority IN ('Low', 'Medium', 'High')) DEFAULT 'Medium',
    due_date DATE,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to read all users
CREATE POLICY "Allow authenticated users to read all users"
    ON users
    FOR SELECT
    TO authenticated
    USING (true);

-- Create policy to allow users to update their own record
CREATE POLICY "Allow users to update their own record"
    ON users
    FOR UPDATE
    TO authenticated
    USING (auth.uid()::text = id::text);

-- Create policy to allow admins to insert, update, delete any user
CREATE POLICY "Allow admins full access to users"
    ON users
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role = 'Admin'
        )
    );

-- Create policies for projects table
-- Allow authenticated users to read projects they created or are assigned to
CREATE POLICY "Allow users to read their projects"
    ON projects
    FOR SELECT
    TO authenticated
    USING (
        created_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM project_members 
            WHERE project_id = projects.id 
            AND user_id = auth.uid()
        )
    );

-- Allow users to create projects
CREATE POLICY "Allow users to create projects"
    ON projects
    FOR INSERT
    TO authenticated
    WITH CHECK (created_by = auth.uid());

-- Allow users to update projects they created
CREATE POLICY "Allow users to update their own projects"
    ON projects
    FOR UPDATE
    TO authenticated
    USING (created_by = auth.uid())
    WITH CHECK (created_by = auth.uid());

-- Allow admins to delete any project
CREATE POLICY "Allow admins to delete any project"
    ON projects
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role = 'Admin'
        )
    );

-- Create policies for project_members table
-- Allow users to read project members for projects they have access to
CREATE POLICY "Allow users to read project members"
    ON project_members
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE id = project_members.project_id 
            AND (created_by = auth.uid() OR 
                 EXISTS (
                     SELECT 1 FROM project_members pm 
                     WHERE pm.project_id = projects.id 
                     AND pm.user_id = auth.uid()
                 )
            )
        )
    );

-- Allow project creators and admins to add/remove project members
CREATE POLICY "Allow project creators and admins to manage members"
    ON project_members
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE id = project_members.project_id 
            AND created_by = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role = 'Admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE id = project_members.project_id 
            AND created_by = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role = 'Admin'
        )
    );

-- Create policies for tasks table
-- Allow users to read tasks they created, are assigned to, or are in the same project
CREATE POLICY "Allow users to read their tasks"
    ON tasks
    FOR SELECT
    TO authenticated
    USING (
        created_by = auth.uid() OR
        assigned_to = auth.uid() OR
        (project_id IS NOT NULL AND EXISTS (
            SELECT 1 FROM projects 
            WHERE id = tasks.project_id 
            AND (created_by = auth.uid() OR 
                 EXISTS (
                     SELECT 1 FROM project_members pm 
                     WHERE pm.project_id = projects.id 
                     AND pm.user_id = auth.uid()
                 )
            )
        )
    );

-- Allow users to create tasks
CREATE POLICY "Allow users to create tasks"
    ON tasks
    FOR INSERT
    TO authenticated
    WITH CHECK (created_by = auth.uid());

-- Allow users to update tasks they created or are assigned to
CREATE POLICY "Allow users to update their tasks"
    ON tasks
    FOR UPDATE
    TO authenticated
    USING (created_by = auth.uid() OR assigned_to = auth.uid())
    WITH CHECK (created_by = auth.uid() OR assigned_to = auth.uid());

-- Allow admins and task creators to delete tasks
CREATE POLICY "Allow admins and creators to delete tasks"
    ON tasks
    FOR DELETE
    TO authenticated
    USING (
        created_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role = 'Admin'
        )
    );

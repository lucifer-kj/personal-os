-- Migration: 0001_tasks.sql
-- Description: Creates the canonical tasks table with ownership constraints, indexes, and RLS policies.

-- 1. Tasks Table
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid, -- Foreign key to projects(id) when projects table exists
  task_list_id uuid, -- Foreign key to task_lists(id) when task_lists table exists
  parent_task_id uuid references public.tasks(id) on delete cascade,
  title text not null,
  description text,
  status text not null default 'todo' check (status in ('inbox', 'todo', 'in_progress', 'blocked', 'completed', 'cancelled')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high', 'urgent')),
  due_at timestamptz,
  due_date date,
  scheduled_start_at timestamptz,
  scheduled_end_at timestamptz,
  estimated_minutes integer check (estimated_minutes is null or estimated_minutes >= 0),
  actual_minutes integer check (actual_minutes is null or actual_minutes >= 0),
  completed_at timestamptz,
  is_recurring boolean not null default false,
  recurrence_rule text,
  source_type text check (source_type is null or source_type in ('manual', 'inbox', 'meeting', 'automation', 'ai')),
  source_id uuid,
  sort_order numeric not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,

  -- Constraints
  constraint chk_tasks_scheduled_range check (
    scheduled_end_at is null or scheduled_start_at is null or scheduled_end_at > scheduled_start_at
  ),
  constraint chk_tasks_no_self_parent check (
    parent_task_id is null or parent_task_id <> id
  )
);

-- 2. Indexes for access patterns
create index if not exists idx_tasks_user_id on public.tasks (user_id);
create index if not exists idx_tasks_user_status on public.tasks (user_id, status) where deleted_at is null;
create index if not exists idx_tasks_user_due on public.tasks (user_id, due_at) where deleted_at is null;
create index if not exists idx_tasks_user_sort on public.tasks (user_id, sort_order) where deleted_at is null;
create index if not exists idx_tasks_parent on public.tasks (parent_task_id) where parent_task_id is not null;

-- 3. Row Level Security (RLS)
alter table public.tasks enable row level security;

-- Drop existing policies if re-running
drop policy if exists "Users can select their own tasks" on public.tasks;
drop policy if exists "Users can insert their own tasks" on public.tasks;
drop policy if exists "Users can update their own tasks" on public.tasks;
drop policy if exists "Users can delete their own tasks" on public.tasks;

create policy "Users can select their own tasks"
  on public.tasks
  for select
  to authenticated
  using (user_id = (select auth.uid()));

create policy "Users can insert their own tasks"
  on public.tasks
  for insert
  to authenticated
  with check (user_id = (select auth.uid()));

create policy "Users can update their own tasks"
  on public.tasks
  for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "Users can delete their own tasks"
  on public.tasks
  for delete
  to authenticated
  using (user_id = (select auth.uid()));

-- Migration: 0002_projects.sql
-- Description: Creates projects and project_milestones tables, foreign key link with tasks, and RLS policies.

-- 1. Projects Table
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  status text not null default 'active' check (status in ('planned', 'active', 'on_hold', 'completed', 'archived')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high', 'urgent')),
  start_date date,
  due_date date,
  completed_at timestamptz,
  color text,
  icon text,
  sort_order numeric not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,

  -- Constraints
  constraint chk_projects_date_range check (
    due_date is null or start_date is null or due_date >= start_date
  )
);

-- 2. Project Milestones Table
create table if not exists public.project_milestones (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  description text,
  due_date date,
  status text not null default 'pending' check (status in ('pending', 'completed')),
  completed_at timestamptz,
  sort_order numeric not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. Link Tasks to Projects Foreign Key (if not already added)
do $$
begin
  if not exists (
    select 1 from information_schema.table_constraints
    where constraint_name = 'fk_tasks_project' and table_name = 'tasks'
  ) then
    alter table public.tasks
      add constraint fk_tasks_project
      foreign key (project_id) references public.projects(id)
      on delete set null;
  end if;
end $$;

-- 4. Indexes
create index if not exists idx_projects_user_id on public.projects (user_id);
create index if not exists idx_projects_user_status on public.projects (user_id, status) where deleted_at is null;
create index if not exists idx_projects_user_due on public.projects (user_id, due_date) where deleted_at is null;
create index if not exists idx_project_milestones_project on public.project_milestones (project_id, sort_order);

-- 5. Row Level Security (RLS)
alter table public.projects enable row level security;
alter table public.project_milestones enable row level security;

-- Projects RLS Policies
drop policy if exists "Users can select their own projects" on public.projects;
drop policy if exists "Users can insert their own projects" on public.projects;
drop policy if exists "Users can update their own projects" on public.projects;
drop policy if exists "Users can delete their own projects" on public.projects;

create policy "Users can select their own projects"
  on public.projects for select to authenticated
  using (user_id = (select auth.uid()));

create policy "Users can insert their own projects"
  on public.projects for insert to authenticated
  with check (user_id = (select auth.uid()));

create policy "Users can update their own projects"
  on public.projects for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "Users can delete their own projects"
  on public.projects for delete to authenticated
  using (user_id = (select auth.uid()));

-- Project Milestones RLS Policies
drop policy if exists "Users can select their own project milestones" on public.project_milestones;
drop policy if exists "Users can insert their own project milestones" on public.project_milestones;
drop policy if exists "Users can update their own project milestones" on public.project_milestones;
drop policy if exists "Users can delete their own project milestones" on public.project_milestones;

create policy "Users can select their own project milestones"
  on public.project_milestones for select to authenticated
  using (user_id = (select auth.uid()));

create policy "Users can insert their own project milestones"
  on public.project_milestones for insert to authenticated
  with check (user_id = (select auth.uid()));

create policy "Users can update their own project milestones"
  on public.project_milestones for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "Users can delete their own project milestones"
  on public.project_milestones for delete to authenticated
  using (user_id = (select auth.uid()));

-- Migration: 0003_daily_plans.sql
-- Description: Creates daily_plans table for daily intentions, plan reflections, and day-level notes with RLS policies.

-- 1. Daily Plans Table
create table if not exists public.daily_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_date date not null,
  intention text,
  shutdown_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- Constraints
  constraint uq_daily_plans_user_date unique (user_id, plan_date)
);

-- 2. Indexes
create index if not exists idx_daily_plans_user_date on public.daily_plans (user_id, plan_date);

-- 3. Row Level Security (RLS)
alter table public.daily_plans enable row level security;

drop policy if exists "Users can select their own daily plans" on public.daily_plans;
drop policy if exists "Users can insert their own daily plans" on public.daily_plans;
drop policy if exists "Users can update their own daily plans" on public.daily_plans;
drop policy if exists "Users can delete their own daily plans" on public.daily_plans;

create policy "Users can select their own daily plans"
  on public.daily_plans for select to authenticated
  using (user_id = (select auth.uid()));

create policy "Users can insert their own daily plans"
  on public.daily_plans for insert to authenticated
  with check (user_id = (select auth.uid()));

create policy "Users can update their own daily plans"
  on public.daily_plans for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "Users can delete their own daily plans"
  on public.daily_plans for delete to authenticated
  using (user_id = (select auth.uid()));

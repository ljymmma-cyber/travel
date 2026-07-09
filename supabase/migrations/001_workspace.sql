create table if not exists public.trips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  destination text not null,
  cover_gradient text not null default 'from-sky-200 via-cyan-100 to-emerald-100',
  status text not null default 'draft' check (status in ('draft', 'planned', 'in_progress', 'completed', 'archived')),
  tags text[] not null default '{}',
  is_favorite boolean not null default false,
  start_date date,
  end_date date,
  budget_min numeric not null default 0,
  budget_max numeric not null default 0,
  currency text not null default 'USD',
  current_plan jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.trip_versions (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  version_number integer not null,
  label text not null,
  created_by text not null check (created_by in ('ai_generate', 'manual_edit', 'partial_replan', 'restore')),
  summary text not null,
  plan_snapshot jsonb not null,
  created_at timestamptz not null default now(),
  unique (trip_id, version_number)
);

create table if not exists public.user_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  home_currency text not null default 'USD',
  preferred_pace text not null default 'balanced',
  interests text[] not null default '{}',
  accessibility text not null default 'none',
  updated_at timestamptz not null default now()
);

create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  trip_id uuid references public.trips(id) on delete cascade,
  activity_id text,
  created_at timestamptz not null default now()
);

create table if not exists public.trip_history (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  event_type text not null,
  payload jsonb not null default '{}',
  created_at timestamptz not null default now()
);

alter table public.trips enable row level security;
alter table public.trip_versions enable row level security;
alter table public.user_preferences enable row level security;
alter table public.favorites enable row level security;
alter table public.trip_history enable row level security;

create policy "Users can manage own trips" on public.trips
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can manage own trip versions" on public.trip_versions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can manage own preferences" on public.user_preferences
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can manage own favorites" on public.favorites
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can manage own trip history" on public.trip_history
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

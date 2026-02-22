-- EduLite: progress and school_profiles tables with RLS
-- Run in Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

-- Progress: per-user, per-packet progress (synced from client)
create table if not exists progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  packet_id text not null,
  status text not null check (status in ('in_progress', 'completed')),
  content_tier text check (content_tier in ('textOnly', 'textAndImages', 'full')),
  answers jsonb default '{}',
  completed_at timestamptz,
  retry_count int default 0,
  updated_at timestamptz default now(),
  primary key (user_id, packet_id)
);

create index if not exists idx_progress_user_id on progress(user_id);

create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger progress_updated_at
  before update on progress
  for each row execute function update_updated_at();

alter table progress enable row level security;

create policy "Users can manage own progress"
  on progress for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- School profiles: links Supabase auth user to gr_no / teacher_id, school
create table if not exists school_profiles (
  user_id uuid not null references auth.users(id) on delete cascade primary key,
  school_id text not null,
  gr_no text,
  teacher_id text,
  role text not null check (role in ('student', 'teacher')),
  name text not null,
  created_at timestamptz default now()
);

alter table school_profiles enable row level security;

create policy "Users can read own profile"
  on school_profiles for select
  using (auth.uid() = user_id);

-- Seed: After creating auth users in Dashboard > Authentication > Users:
-- 1. Add user: email gr_student1@school-1.edulite.local, password: pass
-- 2. Copy user id (UUID), then:
-- insert into school_profiles (user_id, school_id, gr_no, role, name)
-- values ('<paste-uuid>', 'school-1', 'student1', 'student', 'Student student1');
-- 3. For teacher: email teacher_teacher1@school-1.edulite.local, password: pass
-- insert into school_profiles (user_id, school_id, teacher_id, role, name)
-- values ('<paste-uuid>', 'school-1', 'teacher1', 'teacher', 'Teacher teacher1');

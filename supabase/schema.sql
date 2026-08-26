-- All-in-One Math Help — Supabase schema
-- Run this in the Supabase SQL editor.

-- Extensions
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Users (extends auth.users)
-- ---------------------------------------------------------------------------
create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null check (role in ('teacher', 'student')),
  full_name text not null,
  email text not null,
  created_at timestamptz not null default now()
);

create index if not exists users_role_idx on public.users (role);
create index if not exists users_email_idx on public.users (email);

-- ---------------------------------------------------------------------------
-- Classes
-- ---------------------------------------------------------------------------
create table if not exists public.classes (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.users (id) on delete cascade,
  name text not null,
  class_code text not null unique,
  created_at timestamptz not null default now(),
  constraint class_code_format check (class_code ~ '^[A-Z0-9]{6}$')
);

create index if not exists classes_teacher_id_idx on public.classes (teacher_id);
create index if not exists classes_class_code_idx on public.classes (class_code);

-- ---------------------------------------------------------------------------
-- Enrollments
-- ---------------------------------------------------------------------------
create table if not exists public.enrollments (
  class_id uuid not null references public.classes (id) on delete cascade,
  student_id uuid not null references public.users (id) on delete cascade,
  enrolled_at timestamptz not null default now(),
  primary key (class_id, student_id)
);

create index if not exists enrollments_student_id_idx on public.enrollments (student_id);

-- ---------------------------------------------------------------------------
-- Assignments
-- ---------------------------------------------------------------------------
create table if not exists public.assignments (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes (id) on delete cascade,
  topic text not null,
  content jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists assignments_class_id_idx on public.assignments (class_id);

-- ---------------------------------------------------------------------------
-- Submissions
-- ---------------------------------------------------------------------------
create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.assignments (id) on delete cascade,
  student_id uuid not null references public.users (id) on delete cascade,
  answers jsonb not null default '{}'::jsonb,
  ai_feedback text,
  created_at timestamptz not null default now(),
  unique (assignment_id, student_id)
);

create index if not exists submissions_student_id_idx on public.submissions (student_id);
create index if not exists submissions_assignment_id_idx on public.submissions (assignment_id);

-- ---------------------------------------------------------------------------
-- Auto-create public.users row when a user signs up
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, role, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'role', 'student'),
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.users enable row level security;
alter table public.classes enable row level security;
alter table public.enrollments enable row level security;
alter table public.assignments enable row level security;
alter table public.submissions enable row level security;

-- Users: read own profile; teachers can read enrolled students
create policy "Users can read own profile"
  on public.users for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.users for update
  using (auth.uid() = id);

-- Classes: teachers manage their own; students see enrolled
create policy "Teachers manage own classes"
  on public.classes for all
  using (auth.uid() = teacher_id)
  with check (auth.uid() = teacher_id);

create policy "Students view enrolled classes"
  on public.classes for select
  using (
    exists (
      select 1 from public.enrollments e
      where e.class_id = classes.id and e.student_id = auth.uid()
    )
  );

-- Enrollments
create policy "Teachers view enrollments for their classes"
  on public.enrollments for select
  using (
    exists (
      select 1 from public.classes c
      where c.id = enrollments.class_id and c.teacher_id = auth.uid()
    )
  );

create policy "Students manage own enrollment"
  on public.enrollments for all
  using (auth.uid() = student_id)
  with check (auth.uid() = student_id);

-- Assignments
create policy "Teachers manage assignments in their classes"
  on public.assignments for all
  using (
    exists (
      select 1 from public.classes c
      where c.id = assignments.class_id and c.teacher_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.classes c
      where c.id = assignments.class_id and c.teacher_id = auth.uid()
    )
  );

create policy "Students view assignments in enrolled classes"
  on public.assignments for select
  using (
    exists (
      select 1 from public.enrollments e
      where e.class_id = assignments.class_id and e.student_id = auth.uid()
    )
  );

-- Submissions
create policy "Students manage own submissions"
  on public.submissions for all
  using (auth.uid() = student_id)
  with check (auth.uid() = student_id);

create policy "Teachers view submissions for their classes"
  on public.submissions for select
  using (
    exists (
      select 1
      from public.assignments a
      join public.classes c on c.id = a.class_id
      where a.id = submissions.assignment_id and c.teacher_id = auth.uid()
    )
  );

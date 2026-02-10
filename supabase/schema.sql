-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- PROFILES (Extends Supabase Auth)
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  full_name text,
  phone text,
  role text check (role in ('student', 'teacher', 'admin')) default 'student',
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- COURSES
create table public.courses (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  image_url text,
  teacher_id uuid references public.profiles(id),
  schedule text, -- e.g., "Mon-Wed-Fri 14:00"
  price decimal(10, 2),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ENROLLMENTS (Student -> Course)
create table public.enrollments (
  id uuid default uuid_generate_v4() primary key,
  student_id uuid references public.profiles(id) not null,
  course_id uuid references public.courses(id) not null,
  status text check (status in ('active', 'completed', 'dropped')) default 'active',
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(student_id, course_id)
);

-- EXAMS (Mock Exams, Quizzes)
create table public.exams (
  id uuid default uuid_generate_v4() primary key,
  course_id uuid references public.courses(id),
  title text not null, -- e.g., "IELTS Mock #4"
  date date not null,
  max_score integer default 100,
  type text check (type in ('mock', 'quiz', 'midterm', 'final')) default 'mock',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RESULTS (Student Scores)
create table public.results (
  id uuid default uuid_generate_v4() primary key,
  exam_id uuid references public.exams(id) not null,
  student_id uuid references public.profiles(id) not null,
  score decimal(5, 2) not null,
  feedback text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(exam_id, student_id)
);

-- RLS POLICIES (Security)
alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.enrollments enable row level security;
alter table public.exams enable row level security;
alter table public.results enable row level security;

-- Profiles: Public read, User update own
create policy "Public profiles are viewable by everyone." on public.profiles for select using (true);
create policy "Users can insert their own profile." on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." on public.profiles for update using (auth.uid() = id);

-- Courses: Public read, Admin/Teacher write
create policy "Courses are viewable by everyone." on public.courses for select using (true);

-- Functions
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, new.raw_user_meta_data->>'full_name', coalesce(new.raw_user_meta_data->>'role', 'student'));
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user creation
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

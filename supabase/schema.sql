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

-- SUBJECTS (e.g., Matematika, Fizika, Ona tili)
create table public.subjects (
  id uuid default uuid_generate_v4() primary key,
  name text not null unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- DIRECTIONS (Yo'nalishlar - e.g., Axborot tizimlari)
create table public.directions (
  id uuid default uuid_generate_v4() primary key,
  code text not null unique, -- 60610400
  title text not null,
  subject_1_id uuid references public.subjects(id),
  subject_2_id uuid references public.subjects(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- EXAMS (Mock Exams, Quizzes)
create table public.exams (
  id uuid default uuid_generate_v4() primary key,
  title text not null, -- e.g., "DTM Mock #1"
  date date not null,
  max_score decimal(5, 2) default 189.0,
  type text check (type in ('dtm', 'quiz', 'topic')) default 'dtm',
  status text check (status in ('upcoming', 'active', 'finished')) default 'upcoming',
  correct_answers jsonb, -- e.g. {"1": "A", "2": "B", ...}
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RESULTS (Detailed Scores)
create table public.results (
  id uuid default uuid_generate_v4() primary key,
  exam_id uuid references public.exams(id) not null,
  student_id uuid references public.profiles(id) not null,
  direction_id uuid references public.directions(id), -- Specific direction for this result
  
  -- Scores Breakdown (DTM 2025)
  total_score decimal(5, 2) not null,
  
  compulsory_math_score decimal(4, 2), -- Majburiy Matematika (max 11)
  compulsory_history_score decimal(4, 2), -- Majburiy Tarix (max 11)
  compulsory_lang_score decimal(4, 2), -- Majburiy Ona tili (max 11)
  
  subject_1_score decimal(5, 2), -- Fan 1 (max 93)
  subject_2_score decimal(5, 2), -- Fan 2 (max 63)
  
  student_answers jsonb, -- e.g. {"1": "A", "2": "C", ...}
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(exam_id, student_id)
);

-- RLS POLICIES (Security)
alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.enrollments enable row level security;
alter table public.subjects enable row level security;
alter table public.directions enable row level security;
alter table public.exams enable row level security;
alter table public.results enable row level security;

-- Public Read Policies
create policy "Public read" on public.subjects for select using (true);
create policy "Public read" on public.directions for select using (true);
create policy "Public read" on public.exams for select using (true);

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
  insert into public.profiles (id, full_name, phone, role)
  values (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'phone',
    coalesce(new.raw_user_meta_data->>'role', 'student')
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user creation
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

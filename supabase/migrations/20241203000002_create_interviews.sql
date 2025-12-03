create table if not exists interviews (
  id uuid primary key default gen_random_uuid(),
  application_id uuid references user_progress(application_id) on delete cascade,
  transcript jsonb,
  analysis text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table interviews enable row level security;

-- Policies
create policy "Public access to interviews"
  on interviews for all
  using (true)
  with check (true);

-- Add interview_id to learning_modules
alter table learning_modules 
add column if not exists interview_id uuid references interviews(id) on delete set null;

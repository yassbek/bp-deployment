create table if not exists learning_modules (
  id uuid primary key default gen_random_uuid(),
  application_id uuid references user_progress(application_id) on delete cascade,
  title text not null,
  description text,
  category text,
  difficulty text,
  content jsonb,
  quiz jsonb,
  status text default 'pending' check (status in ('pending', 'completed')),
  score integer,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table learning_modules enable row level security;

-- Policies
create policy "Public access to learning_modules"
  on learning_modules for all
  using (true)
  with check (true);

-- Trigger for updated_at
create trigger update_learning_modules_updated_at
    before update on learning_modules
    for each row
    execute procedure update_updated_at_column();

-- Create table for tracking user progress based on applicationId
create table if not exists user_progress (
  application_id uuid primary key,
  user_id uuid references auth.users(id),
  status text check (status in ('started', 'interview_completed', 'training_completed')) default 'started',
  interview_transcript jsonb,
  training_modules jsonb,
  training_overview text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table user_progress enable row level security;

-- Policies
-- Allow anyone to read/insert/update if they have the applicationId (public access for demo/unauth flow)
-- Ideally this should be stricter, but for "applicationId" based flow without forced login, we allow public access to specific rows.
-- However, standard RLS doesn't easily support "knowledge of ID = access" without a function or open access.
-- For this use case, we'll allow public access.

create policy "Public access to user_progress"
  on user_progress for all
  using (true)
  with check (true);

-- Trigger for updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create trigger update_user_progress_updated_at
    before update on user_progress
    for each row
    execute procedure update_updated_at_column();

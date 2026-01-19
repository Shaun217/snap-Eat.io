-- Enable Row Level Security (RLS) is good practice
-- Create a table for public profiles
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  updated_at timestamp with time zone,
  username text unique,
  full_name text,
  avatar_url text,
  website text,
  default_language text,
  chef_card_language text default 'English',
  allergens text[] default '{}',
  dietary_notes text default '',

  constraint username_length check (char_length(username) >= 3)
);

-- Set up Row Level Security (RLS)
alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

create policy "Users can insert their own profile." on profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on profiles
  for update using (auth.uid() = id);

-- Create a table for scans (history/saved)
create table scans (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  original_name text,
  description text,
  image_url text,
  tags text[],
  allergens text[],
  spice_level text,
  category text,
  bounding_box jsonb, -- Stores [ymin, xmin, ymax, xmax]
  is_menu boolean default false,
  is_saved boolean default false,
  saved_at timestamp with time zone
);

-- Set up RLS for scans
alter table scans enable row level security;

create policy "Users can view their own scans." on scans
  for select using (auth.uid() = user_id);

create policy "Users can insert their own scans." on scans
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own scans." on scans
  for update using (auth.uid() = user_id);

create policy "Users can delete their own scans." on scans
  for delete using (auth.uid() = user_id);

-- Create a trigger to automatically create a profile entry when a new user signs up
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

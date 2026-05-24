
-- Motors table
create table public.motors (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  location text,
  health_score integer not null default 100,
  status text not null default 'safe',
  mode text not null default 'healthy',
  created_at timestamptz not null default now()
);
alter table public.motors enable row level security;
create policy "own motors select" on public.motors for select using (auth.uid() = user_id);
create policy "own motors insert" on public.motors for insert with check (auth.uid() = user_id);
create policy "own motors update" on public.motors for update using (auth.uid() = user_id);
create policy "own motors delete" on public.motors for delete using (auth.uid() = user_id);

-- Sensor readings
create table public.sensor_readings (
  id uuid primary key default gen_random_uuid(),
  motor_id uuid not null references public.motors(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  temperature numeric not null,
  current numeric not null,
  vibration numeric not null,
  status text not null default 'safe',
  created_at timestamptz not null default now()
);
alter table public.sensor_readings enable row level security;
create policy "own readings select" on public.sensor_readings for select using (auth.uid() = user_id);
create policy "own readings insert" on public.sensor_readings for insert with check (auth.uid() = user_id);
create index sensor_readings_motor_created_idx on public.sensor_readings(motor_id, created_at desc);

-- Alerts
create table public.alerts (
  id uuid primary key default gen_random_uuid(),
  motor_id uuid not null references public.motors(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  severity text not null default 'warning',
  message_en text not null,
  message_ar text not null,
  created_at timestamptz not null default now()
);
alter table public.alerts enable row level security;
create policy "own alerts select" on public.alerts for select using (auth.uid() = user_id);
create policy "own alerts insert" on public.alerts for insert with check (auth.uid() = user_id);
create policy "own alerts delete" on public.alerts for delete using (auth.uid() = user_id);

-- Realtime
alter publication supabase_realtime add table public.motors;
alter publication supabase_realtime add table public.sensor_readings;
alter publication supabase_realtime add table public.alerts;

-- Auto-seed a default motor for each new user
create or replace function public.handle_new_user_motors()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.motors (user_id, name, location)
  values
    (new.id, 'Motor #1', 'Line A'),
    (new.id, 'Motor #2', 'Line B');
  return new;
end;
$$;

create trigger on_auth_user_created_motors
  after insert on auth.users
  for each row execute function public.handle_new_user_motors();

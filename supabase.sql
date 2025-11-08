-- Extensões
create extension if not exists pgcrypto;

-- PERFIS
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  altura_cm integer,
  peso_kg numeric,
  data_nascimento date,
  created_at timestamp with time zone default now()
);

-- add sexo column if not exists
alter table public.profiles add column if not exists sexo text check (sexo in ('M','F'));

alter table public.profiles enable row level security;

-- ensure idempotency: drop existing policies before creating
drop policy if exists profiles_select_own on public.profiles;
drop policy if exists profiles_insert_own on public.profiles;
drop policy if exists profiles_update_own on public.profiles;

create policy profiles_select_own on public.profiles
  for select using (auth.uid() = id);
create policy profiles_insert_own on public.profiles
  for insert with check (auth.uid() = id);
create policy profiles_update_own on public.profiles
  for update using (auth.uid() = id);

-- EXAMES
create table if not exists public.health_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  tipo_exame text not null,
  valor numeric,
  unidade text,
  data_exame date not null,
  arquivo_url text,
  created_at timestamp with time zone default now()
);

alter table public.health_records enable row level security;

-- ensure idempotency for health_records policies
drop policy if exists health_records_select_own on public.health_records;
drop policy if exists health_records_insert_own on public.health_records;
drop policy if exists health_records_update_own on public.health_records;
drop policy if exists health_records_delete_own on public.health_records;

create policy health_records_select_own on public.health_records
  for select using (auth.uid() = user_id);
create policy health_records_insert_own on public.health_records
  for insert with check (auth.uid() = user_id);
create policy health_records_update_own on public.health_records
  for update using (auth.uid() = user_id);
create policy health_records_delete_own on public.health_records
  for delete using (auth.uid() = user_id);


create table if not exists public.daily_tracking (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  data date not null,
  passos integer,
  horas_sono numeric,
  freq_cardiaca integer,
  created_at timestamp with time zone default now(),
  unique (user_id, data)
);

alter table public.daily_tracking enable row level security;

-- ensure idempotency for daily_tracking policies
drop policy if exists daily_tracking_select_own on public.daily_tracking;
drop policy if exists daily_tracking_insert_own on public.daily_tracking;
drop policy if exists daily_tracking_update_own on public.daily_tracking;
drop policy if exists daily_tracking_delete_own on public.daily_tracking;

create policy daily_tracking_select_own on public.daily_tracking
  for select using (auth.uid() = user_id);
create policy daily_tracking_insert_own on public.daily_tracking
  for insert with check (auth.uid() = user_id);
create policy daily_tracking_update_own on public.daily_tracking
  for update using (auth.uid() = user_id);
create policy daily_tracking_delete_own on public.daily_tracking
  for delete using (auth.uid() = user_id);

-- STORAGE BUCKET
-- Executar no editor SQL do Supabase
-- Cria bucket público para laudos
insert into storage.buckets (id, name, public) values ('health-reports', 'health-reports', true) on conflict (id) do update set public = excluded.public, name = excluded.name;
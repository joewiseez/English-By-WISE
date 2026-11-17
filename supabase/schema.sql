-- Jalankan di Supabase: SQL Editor, lalu Run.
create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  display_name text,
  xp int not null default 0,
  streak int not null default 0,
  last_active date,
  daily_xp int not null default 0,
  daily_date date,
  created_at timestamptz not null default now()
);
create table public.lesson_progress (
  user_id uuid not null references auth.users on delete cascade,
  lesson_id text not null,
  best_score int not null check (best_score between 0 and 100),
  updated_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);
alter table public.profiles enable row level security;
alter table public.lesson_progress enable row level security;
create policy "profil: baca milik sendiri" on public.profiles for select using (auth.uid() = id);
create policy "profil: ubah milik sendiri" on public.profiles for update using (auth.uid() = id);
create policy "progres: baca milik sendiri" on public.lesson_progress for select using (auth.uid() = user_id);
create policy "progres: tambah milik sendiri" on public.lesson_progress for insert with check (auth.uid() = user_id);
create policy "progres: ubah milik sendiri" on public.lesson_progress for update using (auth.uid() = user_id);
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name) values (new.id, split_part(new.email, '@', 1));
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- AROGYA — Supabase Migration
-- Run this SQL in Supabase Dashboard → SQL Editor
-- ============================================================

-- ── 1. profiles ──
-- Used by: admin/users (role management), admin/doctors (auto-profile)
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text not null,
  name       text not null default '',
  role       text not null default 'patient' check (role in ('patient', 'doctor', 'admin')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Profiles are viewable by everyone"
  on public.profiles for select using (true);

create policy "Users can update their own profile"
  on public.profiles for update using (auth.uid() = id);

create policy "Profiles can be inserted by authenticated users"
  on public.profiles for insert with check (auth.uid() = id);

-- Allow admins to manage all profiles (upsert from admin panel)
create policy "Service role full access on profiles"
  on public.profiles for all using (true);

-- ── 2. doctors ──
-- Used by: admin/doctors, admin/users (auto-create doctor on role change)
create table if not exists public.doctors (
  id         uuid primary key default gen_random_uuid(),
  doctor_id  integer not null unique,
  name       text not null,
  specialty  text not null,
  email      text,
  created_at timestamptz not null default now()
);

alter table public.doctors enable row level security;

create policy "Doctors are viewable by everyone"
  on public.doctors for select using (true);

create policy "Doctors can be managed by authenticated users"
  on public.doctors for all using (auth.role() = 'authenticated');

-- ── 3. patients ──
-- Used by: admin/patients, admin/reports (patient lookup)
create table if not exists public.patients (
  id         uuid primary key default gen_random_uuid(),
  patient_id integer not null unique,
  name       text not null,
  details    jsonb,
  created_at timestamptz not null default now()
);

alter table public.patients enable row level security;

create policy "Patients are viewable by everyone"
  on public.patients for select using (true);

create policy "Patients can be managed by authenticated users"
  on public.patients for all using (auth.role() = 'authenticated');

-- ── 4. donors ──
-- Used by: admin/donors, emergency page (DonorList, DonorForm)
create table if not exists public.donors (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  blood_group text not null,
  phone       text not null,
  location    text not null,
  created_at  timestamptz not null default now()
);

alter table public.donors enable row level security;

create policy "Donors are viewable by everyone"
  on public.donors for select using (true);

create policy "Donors can be managed by authenticated users"
  on public.donors for all using (auth.role() = 'authenticated');

-- ── 5. hospitals ──
-- Used by: admin/hospitals
create table if not exists public.hospitals (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  location   text not null,
  created_at timestamptz not null default now()
);

alter table public.hospitals enable row level security;

create policy "Hospitals are viewable by everyone"
  on public.hospitals for select using (true);

create policy "Hospitals can be managed by authenticated users"
  on public.hospitals for all using (auth.role() = 'authenticated');

-- ── 6. records ──
-- Used by: admin/reports (medical record lookup)
-- References doctors for doctor join
create table if not exists public.records (
  id              uuid primary key default gen_random_uuid(),
  patient_id      uuid not null references public.patients(id) on delete cascade,
  doctor_id       uuid references public.doctors(id) on delete set null,
  record_date     date not null default current_date,
  blood_pressure  text,
  blood_sugar     text,
  description     text,
  created_at      timestamptz not null default now()
);

alter table public.records enable row level security;

create policy "Records are viewable by everyone"
  on public.records for select using (true);

create policy "Records can be managed by authenticated users"
  on public.records for all using (auth.role() = 'authenticated');

-- ── 7. prescriptions ──
-- Used by: dashboard (PrescriptionForm, PrescriptionCard)
create table if not exists public.prescriptions (
  id           uuid primary key default gen_random_uuid(),
  patient_id   uuid not null references auth.users(id) on delete cascade,
  doctor_name  text,
  medicines    jsonb not null default '[]'::jsonb,
  instructions text,
  created_at   timestamptz not null default now()
);

alter table public.prescriptions enable row level security;

create policy "Users can view own prescriptions"
  on public.prescriptions for select using (auth.uid() = patient_id);

create policy "Users can insert own prescriptions"
  on public.prescriptions for insert with check (auth.uid() = patient_id);

-- ── 8. reports (user-uploaded files) ──
-- Used by: dashboard (ReportUpload, ReportList)
create table if not exists public.reports (
  id          uuid primary key default gen_random_uuid(),
  patient_id  uuid not null references auth.users(id) on delete cascade,
  file_name   text not null,
  file_url    text not null,
  created_at  timestamptz not null default now()
);

alter table public.reports enable row level security;

create policy "Users can view own reports"
  on public.reports for select using (auth.uid() = patient_id);

create policy "Users can upload own reports"
  on public.reports for insert with check (auth.uid() = patient_id);

-- ── 9. Storage bucket for report files ──
-- Run this separately or via the Supabase dashboard:
-- Go to Storage → Create new bucket → Name: "reports" → Public: true
insert into storage.buckets (id, name, public)
values ('reports', 'reports', true)
on conflict (id) do nothing;

-- Storage policy: authenticated users can upload to their own folder
create policy "Users can upload reports"
  on storage.objects for insert
  with check (
    bucket_id = 'reports'
    and auth.role() = 'authenticated'
  );

create policy "Reports are publicly readable"
  on storage.objects for select
  using (bucket_id = 'reports');

-- ── 10. user_prescriptions (E-Commerce Store Orders) ──
create table if not exists public.user_prescriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    medication_name TEXT NOT NULL,
    dosage TEXT,
    price NUMERIC NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending',
    ordered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

alter table public.user_prescriptions enable row level security;

create policy "Users can view own prescriptions"
  on public.user_prescriptions for select using (auth.uid() = user_id);

create policy "Users can insert own prescriptions"
  on public.user_prescriptions for insert with check (auth.uid() = user_id);

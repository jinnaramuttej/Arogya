-- ==========================================
-- AROGYA COMPLETE DATABASE INITIALIZATION
-- ==========================================

-- 1. PROFILES (Extends auth.users for biometrics, roles, settings)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'patient' CHECK (role IN ('patient', 'doctor', 'admin')),
  face_descriptor JSONB,
  avatar_url TEXT,
  age INTEGER,
  gender TEXT,
  blood_group TEXT,
  conditions TEXT,
  allergies TEXT,
  face_verification_disabled BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Profiles can be inserted by authenticated users" ON public.profiles;
CREATE POLICY "Profiles can be inserted by authenticated users" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Service role full access on profiles" ON public.profiles;
CREATE POLICY "Service role full access on profiles" ON public.profiles FOR ALL USING (true);

-- 2. PATIENTS
CREATE TABLE IF NOT EXISTS public.patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id SERIAL UNIQUE,
  name TEXT NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Patients are viewable by everyone" ON public.patients;
CREATE POLICY "Patients are viewable by everyone" ON public.patients FOR SELECT USING (true);

DROP POLICY IF EXISTS "Patients can be managed by authenticated users" ON public.patients;
CREATE POLICY "Patients can be managed by authenticated users" ON public.patients FOR ALL USING (auth.role() = 'authenticated');

-- 3. DOCTORS
CREATE TABLE IF NOT EXISTS public.doctors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id SERIAL UNIQUE,
  name TEXT NOT NULL,
  specialty TEXT NOT NULL,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Doctors are viewable by everyone" ON public.doctors;
CREATE POLICY "Doctors are viewable by everyone" ON public.doctors FOR SELECT USING (true);

DROP POLICY IF EXISTS "Doctors can be managed by auth" ON public.doctors;
CREATE POLICY "Doctors can be managed by auth" ON public.doctors FOR ALL USING (auth.role() = 'authenticated');

-- 4. HOSPITALS
CREATE TABLE IF NOT EXISTS public.hospitals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.hospitals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Hospitals are viewable by everyone" ON public.hospitals;
CREATE POLICY "Hospitals are viewable by everyone" ON public.hospitals FOR SELECT USING (true);

DROP POLICY IF EXISTS "Hospitals can be managed by auth" ON public.hospitals;
CREATE POLICY "Hospitals can be managed by auth" ON public.hospitals FOR ALL USING (auth.role() = 'authenticated');

-- 5. MEDICATIONS (Pharmacy)
CREATE TABLE IF NOT EXISTS public.medications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  dosage TEXT NOT NULL,
  price INTEGER NOT NULL,
  img TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Medications are viewable by everyone" ON public.medications;
CREATE POLICY "Medications are viewable by everyone" ON public.medications FOR SELECT USING (true);

DROP POLICY IF EXISTS "Medications can be managed by auth" ON public.medications;
CREATE POLICY "Medications can be managed by auth" ON public.medications FOR ALL USING (auth.role() = 'authenticated');

-- 6. BLOOD DONORS
CREATE TABLE IF NOT EXISTS public.blood_donors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  blood_group TEXT NOT NULL,
  location TEXT NOT NULL,
  distance_km NUMERIC,
  last_donation DATE,
  status TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.blood_donors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Blood Donors viewable by everyone" ON public.blood_donors;
CREATE POLICY "Blood Donors viewable by everyone" ON public.blood_donors FOR SELECT USING (true);

DROP POLICY IF EXISTS "Blood Donors managed by auth" ON public.blood_donors;
CREATE POLICY "Blood Donors managed by auth" ON public.blood_donors FOR ALL USING (auth.role() = 'authenticated');


-- 7. RECORDS
CREATE TABLE IF NOT EXISTS public.records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES public.doctors(id) ON DELETE SET NULL,
  record_date DATE NOT NULL DEFAULT CURRENT_DATE,
  blood_pressure TEXT,
  blood_sugar TEXT,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Records viewable by everyone" ON public.records;
CREATE POLICY "Records viewable by everyone" ON public.records FOR SELECT USING (true);

DROP POLICY IF EXISTS "Records managed by auth" ON public.records;
CREATE POLICY "Records managed by auth" ON public.records FOR ALL USING (auth.role() = 'authenticated');


-- 8. USER PRESCRIPTIONS (E-commerce / Prescriptions)
CREATE TABLE IF NOT EXISTS public.user_prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  doctor_name TEXT,
  medicines JSONB NOT NULL DEFAULT '[]'::jsonb,
  instructions TEXT,
  total_price INTEGER DEFAULT 0,
  ordered_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.user_prescriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own user_prescriptions" ON public.user_prescriptions;
CREATE POLICY "Users view own user_prescriptions" ON public.user_prescriptions FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users insert own user_prescriptions" ON public.user_prescriptions;
CREATE POLICY "Users insert own user_prescriptions" ON public.user_prescriptions FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role full access on user_prescriptions" ON public.user_prescriptions;
CREATE POLICY "Service role full access on user_prescriptions" ON public.user_prescriptions FOR ALL USING (true);

-- ==========================================
-- SEED DATA
-- ==========================================

INSERT INTO public.hospitals (name, location) VALUES 
('Apollo General Hospital', 'https://maps.google.com/?q=Apollo+Hospital'),
('KIMS Emergency Care', 'https://maps.google.com/?q=KIMS+Hospital'),
('Yashoda Medical Center', 'https://maps.google.com/?q=Yashoda+Hospital')
ON CONFLICT DO NOTHING;

INSERT INTO public.doctors (name, specialty) VALUES 
('Rajesh Kumar', 'Cardiologist'),
('Sneha Reddy', 'Dermatologist'),
('Anil Sharma', 'General Physician'),
('Priya Desai', 'Pediatrician')
ON CONFLICT DO NOTHING;

INSERT INTO public.patients (name, details) VALUES 
('Aarav Mehta', '{"age": 34, "bloodGroup": "O+"}'),
('Kavya Singh', '{"age": 28, "bloodGroup": "B-"}'),
('Rahul Verma', '{"age": 45, "bloodGroup": "A+"}')
ON CONFLICT DO NOTHING;

INSERT INTO public.medications (name, category, dosage, price, img) VALUES 
('Omron Blood Pressure Monitor', 'Devices', 'N/A', 2499, '/images/products/bp_monitor.png'),
('Electrolytes Powder', 'Supplements', '1 Sachet/day', 350, '/images/products/electrolytes.png'),
('Comprehensive First Aid Kit', 'Devices', 'N/A', 1200, '/images/products/first_aid_kit.png'),
('Insulin Glargine Pen', 'Prescription', 'As prescribed', 850, '/images/products/insulin.png'),
('Metformin XR 500mg', 'Prescription', '500mg tablet', 120, '/images/products/metformin.png'),
('Lidocaine Pain Relief Patch', 'Supplements', '1 patch/12 hrs', 450, '/images/products/pain_patch.png'),
('Sterile Insulin Syringes', 'Devices', 'N/A', 299, '/images/products/syringes.png'),
('Vitamin D3 60K IU', 'Supplements', '1 cap/week', 180, '/images/products/vitamin_d3.png')
ON CONFLICT DO NOTHING;

INSERT INTO public.blood_donors (name, blood_group, location, distance_km, last_donation, status, phone) VALUES 
('Ananya Rao', 'O+', 'Indiranagar, Bengaluru', 2.1, '2025-12-18', 'Available', '+91 98765 43210'),
('Karthik Mehta', 'A-', 'Koramangala, Bengaluru', 3.6, '2026-02-02', 'Recently Donated', '+91 99887 11223'),
('Priya Menon', 'B+', 'HSR Layout, Bengaluru', 1.4, '2025-10-01', 'Available', '+91 99001 22445'),
('Rohit Singh', 'O-', 'Whitefield, Bengaluru', 6.8, '2026-01-10', 'Unavailable', '+91 90123 45789'),
('Neha Kapoor', 'AB+', 'Jayanagar, Bengaluru', 4.2, '2025-11-12', 'Available', '+91 97654 31987'),
('Sanya Malhotra', 'B+', 'Lucknow', 5.2, '2025-11-20', 'Available', 'Hidden'),
('Kabir Joshi', 'O+', 'Jaipur', 8.4, '2025-12-05', 'Available', 'Hidden'),
('Meera Iyer', 'AB-', 'Ahmedabad', 12.1, '2026-01-15', 'Available', 'Hidden'),
('Ishita Verma', 'A-', 'Pune', 4.8, '2026-02-20', 'Available', 'Hidden'),
('Rohan Kumar', 'O-', 'Chennai', 22.3, '2025-09-05', 'Available', 'Hidden'),
('KOMAL .V', 'A+', 'Dubai', 2500, '2026-03-10', 'Available', 'Hidden')
ON CONFLICT DO NOTHING;

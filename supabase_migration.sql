-- ==============================================================================
-- AROGYA FULL SCHEMA MIGRATION: BIOMETRICS & E-COMMERCE
-- Instructions: Copy all of this code and run it in your Supabase SQL Editor.
-- ==============================================================================

-- 1. Profiles Table (Biometrics & User Info)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name text,
  email text,
  face_descriptor jsonb,
  avatar_base64 text,
  age integer,
  gender text,
  blood_group text,
  conditions text,
  allergies text,
  face_verification_disabled boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can view completely their own profile') THEN
    CREATE POLICY "Users can view completely their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can update their own profile') THEN
    CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can insert their own profile') THEN
    CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
  END IF;
END $$;

-- CRITICAL: Auto-create a profiles row whenever a new user signs up (via /auth OR /verify)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach the trigger (drop first to avoid duplicate)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Medications Table (E-Commerce Pharmacy Store)
CREATE TABLE IF NOT EXISTS public.medications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  category text NOT NULL,
  dosage text NOT NULL,
  price integer NOT NULL,
  img text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'medications' AND policyname = 'Anyone can view medications') THEN
    CREATE POLICY "Anyone can view medications" ON public.medications FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'medications' AND policyname = 'Authenticated users can insert medications') THEN
    CREATE POLICY "Authenticated users can insert medications" ON public.medications FOR INSERT TO authenticated WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'medications' AND policyname = 'Authenticated users can update medications') THEN
    CREATE POLICY "Authenticated users can update medications" ON public.medications FOR UPDATE TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'medications' AND policyname = 'Authenticated users can delete medications') THEN
    CREATE POLICY "Authenticated users can delete medications" ON public.medications FOR DELETE TO authenticated USING (true);
  END IF;
END $$;

-- 3. User Prescriptions (E-Commerce Orders)
CREATE TABLE IF NOT EXISTS public.user_prescriptions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  medication_name text NOT NULL,
  dosage text,
  price integer,
  status text DEFAULT 'Processing',
  ordered_at timestamp with time zone DEFAULT now()
);

-- Patch: Add missing columns if the table already existed without them
ALTER TABLE public.user_prescriptions ADD COLUMN IF NOT EXISTS dosage text;
ALTER TABLE public.user_prescriptions ADD COLUMN IF NOT EXISTS price integer;

ALTER TABLE public.user_prescriptions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_prescriptions' AND policyname = 'Users can view their own prescriptions') THEN
    CREATE POLICY "Users can view their own prescriptions" ON public.user_prescriptions FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_prescriptions' AND policyname = 'Users can insert their own prescriptions') THEN
    CREATE POLICY "Users can insert their own prescriptions" ON public.user_prescriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_prescriptions' AND policyname = 'Users can update their own prescriptions') THEN
    CREATE POLICY "Users can update their own prescriptions" ON public.user_prescriptions FOR UPDATE USING (auth.uid() = user_id);
  END IF;
END $$;

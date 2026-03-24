-- Arogya Full Database Schema & Seed Migration

-- 1. Patients Table
CREATE TABLE IF NOT EXISTS patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id SERIAL UNIQUE,
  name TEXT NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 2. Hospitals Table
CREATE TABLE IF NOT EXISTS hospitals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 3. Doctors Table
CREATE TABLE IF NOT EXISTS doctors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  specialty TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 4. Medications (Pharmacy Tablets) Table
CREATE TABLE IF NOT EXISTS medications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  dosage TEXT NOT NULL,
  price INTEGER NOT NULL,
  img TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Turn on Row Level Security (RLS) but allow public reads
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on patients" ON patients FOR SELECT USING (true);
CREATE POLICY "Allow public read access on hospitals" ON hospitals FOR SELECT USING (true);
CREATE POLICY "Allow public read access on doctors" ON doctors FOR SELECT USING (true);
CREATE POLICY "Allow public read access on medications" ON medications FOR SELECT USING (true);

-- Allow authenticated admins (or all authenticated for showcase) to insert/update/delete
CREATE POLICY "Allow auth all on patients" ON patients FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow auth all on hospitals" ON hospitals FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow auth all on doctors" ON doctors FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow auth all on medications" ON medications FOR ALL USING (auth.role() = 'authenticated');

-- SEED DATA
-- Seed Hospitals
INSERT INTO hospitals (name, location) VALUES 
('Apollo General Hospital', 'https://maps.google.com/?q=Apollo+Hospital'),
('KIMS Emergency Care', 'https://maps.google.com/?q=KIMS+Hospital'),
('Yashoda Medical Center', 'https://maps.google.com/?q=Yashoda+Hospital')
ON CONFLICT DO NOTHING;

-- Seed Doctors
INSERT INTO doctors (name, specialty) VALUES 
('Rajesh Kumar', 'Cardiologist'),
('Sneha Reddy', 'Dermatologist'),
('Anil Sharma', 'General Physician'),
('Priya Desai', 'Pediatrician')
ON CONFLICT DO NOTHING;

-- Seed Patients (Mocked)
INSERT INTO patients (name, details) VALUES 
('Aarav Mehta', '{"age": 34, "bloodGroup": "O+"}'),
('Kavya Singh', '{"age": 28, "bloodGroup": "B-"}'),
('Rahul Verma', '{"age": 45, "bloodGroup": "A+"}')
ON CONFLICT DO NOTHING;

-- Seed Medications (From E-Prescription Page)
INSERT INTO medications (name, category, dosage, price, img) VALUES 
('Omron Blood Pressure Monitor', 'Devices', 'N/A', 2499, '/images/products/bp_monitor.png'),
('Electrolytes Powder', 'Supplements', '1 Sachet/day', 350, '/images/products/electrolytes.png'),
('Comprehensive First Aid Kit', 'Devices', 'N/A', 1200, '/images/products/first_aid_kit.png'),
('Insulin Glargine Pen', 'Prescription', 'As prescribed', 850, '/images/products/insulin.png'),
('Metformin XR 500mg', 'Prescription', '500mg tablet', 120, '/images/products/metformin.png'),
('Lidocaine Pain Relief Patch', 'Supplements', '1 patch/12 hrs', 450, '/images/products/pain_patch.png'),
('Sterile Insulin Syringes', 'Devices', 'N/A', 299, '/images/products/syringes.png'),
('Vitamin D3 60K IU', 'Supplements', '1 cap/week', 180, '/images/products/vitamin_d3.png')
ON CONFLICT DO NOTHING;

-- Healthcare Center Management System Database Schema

-- ============================================
-- 1. CLINICS TABLE
-- ============================================
CREATE TABLE public.clinics (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    name_en TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.clinics ENABLE ROW LEVEL SECURITY;

-- Allow public read access for clinics (needed for dropdowns)
CREATE POLICY "Clinics are viewable by everyone" 
ON public.clinics FOR SELECT 
USING (true);

-- ============================================
-- 2. DOCTORS TABLE
-- ============================================
CREATE TABLE public.doctors (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    specialty TEXT NOT NULL,
    clinic_id UUID REFERENCES public.clinics(id) ON DELETE SET NULL,
    phone TEXT NOT NULL,
    email TEXT,
    experience_years INTEGER NOT NULL DEFAULT 0,
    qualifications TEXT,
    bio TEXT,
    status TEXT NOT NULL DEFAULT 'نشط' CHECK (status IN ('نشط', 'في إجازة', 'غير نشط')),
    icon_color TEXT DEFAULT 'bg-blue-100 text-blue-600',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;

-- Allow public read access for doctors (needed for dropdowns and listings)
CREATE POLICY "Doctors are viewable by everyone" 
ON public.doctors FOR SELECT 
USING (true);

CREATE POLICY "Doctors can be created" 
ON public.doctors FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Doctors can be updated" 
ON public.doctors FOR UPDATE 
USING (true);

CREATE POLICY "Doctors can be deleted" 
ON public.doctors FOR DELETE 
USING (true);

-- ============================================
-- 3. DOCTOR SCHEDULES TABLE
-- ============================================
CREATE TABLE public.doctor_schedules (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
    day_of_week TEXT NOT NULL CHECK (day_of_week IN ('saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday')),
    is_working BOOLEAN NOT NULL DEFAULT true,
    start_time TIME NOT NULL DEFAULT '08:00',
    end_time TIME NOT NULL DEFAULT '16:00',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(doctor_id, day_of_week)
);

ALTER TABLE public.doctor_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Doctor schedules are viewable by everyone" 
ON public.doctor_schedules FOR SELECT 
USING (true);

CREATE POLICY "Doctor schedules can be managed" 
ON public.doctor_schedules FOR ALL 
USING (true);

-- ============================================
-- 4. PATIENTS TABLE
-- ============================================
CREATE TABLE public.patients (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    full_name TEXT NOT NULL,
    gender TEXT NOT NULL CHECK (gender IN ('male', 'female')),
    birth_date DATE NOT NULL,
    national_id TEXT NOT NULL UNIQUE,
    phone TEXT NOT NULL,
    alt_phone TEXT,
    email TEXT,
    address TEXT,
    blood_type TEXT,
    chronic_diseases TEXT,
    allergies TEXT,
    emergency_contact_name TEXT NOT NULL,
    emergency_contact_phone TEXT NOT NULL,
    emergency_contact_relation TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients are viewable by everyone" 
ON public.patients FOR SELECT 
USING (true);

CREATE POLICY "Patients can be created" 
ON public.patients FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Patients can be updated" 
ON public.patients FOR UPDATE 
USING (true);

CREATE POLICY "Patients can be deleted" 
ON public.patients FOR DELETE 
USING (true);

-- ============================================
-- 5. APPOINTMENTS TABLE
-- ============================================
CREATE TABLE public.appointments (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
    clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    appointment_type TEXT NOT NULL CHECK (appointment_type IN ('general', 'followup', 'consultation', 'emergency')),
    reason TEXT NOT NULL,
    notes TEXT,
    send_reminder BOOLEAN NOT NULL DEFAULT true,
    status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Appointments are viewable by everyone" 
ON public.appointments FOR SELECT 
USING (true);

CREATE POLICY "Appointments can be created" 
ON public.appointments FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Appointments can be updated" 
ON public.appointments FOR UPDATE 
USING (true);

CREATE POLICY "Appointments can be deleted" 
ON public.appointments FOR DELETE 
USING (true);

-- ============================================
-- 6. CENTER SETTINGS TABLE
-- ============================================
CREATE TABLE public.center_settings (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name_ar TEXT NOT NULL DEFAULT 'مركز الرعاية الصحية',
    name_en TEXT DEFAULT 'Healthcare Center',
    logo_url TEXT,
    phone TEXT,
    alt_phone TEXT,
    email TEXT,
    website TEXT,
    address TEXT,
    city TEXT DEFAULT 'الرياض',
    postal_code TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.center_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Center settings are viewable by everyone" 
ON public.center_settings FOR SELECT 
USING (true);

CREATE POLICY "Center settings can be updated" 
ON public.center_settings FOR UPDATE 
USING (true);

-- ============================================
-- 7. CENTER WORKING HOURS TABLE
-- ============================================
CREATE TABLE public.center_working_hours (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    day_of_week TEXT NOT NULL UNIQUE CHECK (day_of_week IN ('saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday')),
    is_open BOOLEAN NOT NULL DEFAULT true,
    open_time TIME NOT NULL DEFAULT '08:00',
    close_time TIME NOT NULL DEFAULT '17:00'
);

ALTER TABLE public.center_working_hours ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Working hours are viewable by everyone" 
ON public.center_working_hours FOR SELECT 
USING (true);

CREATE POLICY "Working hours can be updated" 
ON public.center_working_hours FOR UPDATE 
USING (true);

-- ============================================
-- 8. SYSTEM SETTINGS TABLE
-- ============================================
CREATE TABLE public.system_settings (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    language TEXT NOT NULL DEFAULT 'ar',
    date_format TEXT NOT NULL DEFAULT 'gregorian',
    time_format TEXT NOT NULL DEFAULT '12',
    timezone TEXT NOT NULL DEFAULT 'Asia/Riyadh',
    default_appointment_duration INTEGER NOT NULL DEFAULT 30,
    same_day_booking BOOLEAN NOT NULL DEFAULT true,
    min_notice_hours INTEGER NOT NULL DEFAULT 2,
    sms_enabled BOOLEAN NOT NULL DEFAULT true,
    first_reminder_hours INTEGER NOT NULL DEFAULT 24,
    second_reminder_hours INTEGER NOT NULL DEFAULT 2,
    email_enabled BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "System settings are viewable by everyone" 
ON public.system_settings FOR SELECT 
USING (true);

CREATE POLICY "System settings can be updated" 
ON public.system_settings FOR UPDATE 
USING (true);

-- ============================================
-- 9. INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX idx_doctors_clinic ON public.doctors(clinic_id);
CREATE INDEX idx_doctors_status ON public.doctors(status);
CREATE INDEX idx_appointments_patient ON public.appointments(patient_id);
CREATE INDEX idx_appointments_doctor ON public.appointments(doctor_id);
CREATE INDEX idx_appointments_date ON public.appointments(appointment_date);
CREATE INDEX idx_appointments_status ON public.appointments(status);
CREATE INDEX idx_patients_phone ON public.patients(phone);
CREATE INDEX idx_patients_national_id ON public.patients(national_id);

-- ============================================
-- 10. UPDATE TIMESTAMP FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_clinics_updated_at
    BEFORE UPDATE ON public.clinics
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_doctors_updated_at
    BEFORE UPDATE ON public.doctors
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_patients_updated_at
    BEFORE UPDATE ON public.patients
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at
    BEFORE UPDATE ON public.appointments
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_center_settings_updated_at
    BEFORE UPDATE ON public.center_settings
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_system_settings_updated_at
    BEFORE UPDATE ON public.system_settings
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 11. SEED INITIAL DATA
-- ============================================

-- Insert default clinics
INSERT INTO public.clinics (name, name_en, status) VALUES
    ('عيادة الأسنان', 'Dental Clinic', 'active'),
    ('عيادة العظام', 'Orthopedics Clinic', 'active'),
    ('عيادة الجلدية', 'Dermatology Clinic', 'active'),
    ('عيادة الأطفال', 'Pediatrics Clinic', 'active'),
    ('عيادة الباطنة', 'Internal Medicine Clinic', 'active'),
    ('عيادة الجراحة', 'Surgery Clinic', 'active');

-- Insert default center settings
INSERT INTO public.center_settings (name_ar, name_en, phone, email, city) VALUES
    ('مركز الرعاية الصحية', 'Healthcare Center', '0112345678', 'info@healthcare.sa', 'الرياض');

-- Insert default system settings
INSERT INTO public.system_settings (language, date_format, time_format, timezone) VALUES
    ('ar', 'gregorian', '12', 'Asia/Riyadh');

-- Insert default working hours
INSERT INTO public.center_working_hours (day_of_week, is_open, open_time, close_time) VALUES
    ('saturday', true, '08:00', '17:00'),
    ('sunday', true, '08:00', '17:00'),
    ('monday', true, '08:00', '17:00'),
    ('tuesday', true, '08:00', '17:00'),
    ('wednesday', true, '08:00', '17:00'),
    ('thursday', true, '08:00', '17:00'),
    ('friday', false, '08:00', '17:00');
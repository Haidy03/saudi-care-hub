ALTER TABLE public.patients
ADD COLUMN IF NOT EXISTS name_en TEXT;

COMMENT ON COLUMN public.patients.name_en IS 'Patient full name in English';
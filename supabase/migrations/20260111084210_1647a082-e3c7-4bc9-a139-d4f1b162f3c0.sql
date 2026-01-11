ALTER TABLE public.patients
ADD COLUMN IF NOT EXISTS marital_status TEXT,
ADD COLUMN IF NOT EXISTS occupation TEXT,
ADD COLUMN IF NOT EXISTS nationality TEXT DEFAULT 'سعودي',
ADD COLUMN IF NOT EXISTS insurance_provider TEXT,
ADD COLUMN IF NOT EXISTS insurance_number TEXT,
ADD COLUMN IF NOT EXISTS historical_medical_conditions TEXT,
ADD COLUMN IF NOT EXISTS current_medications TEXT,
ADD COLUMN IF NOT EXISTS is_smoker BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS has_insurance BOOLEAN DEFAULT false;

-- Add comments to document the changes
COMMENT ON COLUMN public.patients.marital_status IS 'Marital status of the patient (single, married, divorced, widowed)';
COMMENT ON COLUMN public.patients.occupation IS 'Current occupation of the patient';
COMMENT ON COLUMN public.patients.nationality IS 'Nationality of the patient';
COMMENT ON COLUMN public.patients.insurance_provider IS 'Insurance company name';
COMMENT ON COLUMN public.patients.insurance_number IS 'Insurance policy number';
COMMENT ON COLUMN public.patients.historical_medical_conditions IS 'Historical medical conditions and past medical history';
COMMENT ON COLUMN public.patients.current_medications IS 'Current medications being taken by the patient';
COMMENT ON COLUMN public.patients.is_smoker IS 'Indicates if the patient is a smoker';
COMMENT ON COLUMN public.patients.has_insurance IS 'Indicates if the patient has medical insurance';
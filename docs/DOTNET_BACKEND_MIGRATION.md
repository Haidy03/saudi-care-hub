# .NET Backend Migration Guide

## Complete Documentation for Migrating from Lovable Cloud to ASP.NET Core Web API

This document provides everything you need to build your own .NET backend and integrate it with your Lovable frontend.

---

## Table of Contents

1. [API Endpoints Documentation](#1-api-endpoints-documentation)
2. [Database Schema](#2-database-schema)
3. [.NET Backend Structure](#3-net-backend-structure)
4. [Frontend Integration Guide](#4-frontend-integration-guide)
5. [Step-by-Step Migration Plan](#5-step-by-step-migration-plan)

---

## 1. API Endpoints Documentation

### 1.1 Patients API

#### GET /api/patients
- **Description**: Get all patients
- **Query Parameters**: None
- **Response**: `Patient[]`
```json
[
  {
    "id": "uuid",
    "fullName": "string",
    "gender": "male|female",
    "birthDate": "2000-01-01",
    "nationalId": "1234567890",
    "phone": "0512345678",
    "altPhone": "string|null",
    "email": "string|null",
    "address": "string|null",
    "bloodType": "A+|A-|B+|B-|AB+|AB-|O+|O-|unknown|null",
    "chronicDiseases": "string|null",
    "allergies": "string|null",
    "emergencyContactName": "string",
    "emergencyContactPhone": "string",
    "emergencyContactRelation": "string",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
]
```

#### GET /api/patients/search
- **Description**: Search patients by name or phone
- **Query Parameters**: 
  - `query` (required): Search term
  - `limit` (optional, default: 10): Max results
- **Response**: `Patient[]`

#### POST /api/patients
- **Description**: Create a new patient
- **Request Body**:
```json
{
  "fullName": "string (required, min 3 chars)",
  "gender": "male|female (required)",
  "birthDate": "YYYY-MM-DD (required)",
  "nationalId": "string (required, exactly 10 digits)",
  "phone": "string (required, format: 05XXXXXXXX)",
  "altPhone": "string|null (optional, format: 05XXXXXXXX)",
  "email": "string|null (optional, valid email)",
  "address": "string|null",
  "bloodType": "string|null",
  "chronicDiseases": "string|null",
  "allergies": "string|null",
  "emergencyContactName": "string (required)",
  "emergencyContactPhone": "string (required, format: 05XXXXXXXX)",
  "emergencyContactRelation": "string (required)"
}
```
- **Response**: `Patient` (created object)
- **Validation Rules**:
  - `nationalId`: Unique, exactly 10 digits
  - `phone`, `altPhone`, `emergencyContactPhone`: Saudi format (05XXXXXXXX)
  - `email`: Valid email format if provided

#### PUT /api/patients/{id}
- **Description**: Update a patient
- **Path Parameters**: `id` (UUID)
- **Request Body**: Same as POST (all fields optional)
- **Response**: `Patient` (updated object)

#### DELETE /api/patients/{id}
- **Description**: Delete a patient
- **Path Parameters**: `id` (UUID)
- **Response**: `204 No Content`

---

### 1.2 Doctors API

#### GET /api/doctors
- **Description**: Get all doctors with clinic information
- **Response**: `DoctorWithClinic[]`
```json
[
  {
    "id": "uuid",
    "name": "string",
    "specialty": "string",
    "phone": "string",
    "email": "string|null",
    "bio": "string|null",
    "qualifications": "string|null",
    "experienceYears": 5,
    "status": "نشط|غير نشط",
    "iconColor": "bg-blue-100 text-blue-600",
    "clinicId": "uuid|null",
    "clinic": {
      "id": "uuid",
      "name": "string"
    },
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
]
```

#### GET /api/doctors/by-clinic/{clinicId}
- **Description**: Get active doctors by clinic
- **Path Parameters**: `clinicId` (UUID)
- **Query Parameters**: None
- **Response**: `Doctor[]` (only status = "نشط")

#### GET /api/doctors/{id}/schedule
- **Description**: Get doctor's weekly schedule
- **Path Parameters**: `id` (UUID)
- **Response**: `DoctorSchedule[]`
```json
[
  {
    "id": "uuid",
    "doctorId": "uuid",
    "dayOfWeek": "saturday|sunday|monday|tuesday|wednesday|thursday|friday",
    "isWorking": true,
    "startTime": "08:00:00",
    "endTime": "16:00:00",
    "createdAt": "2024-01-01T00:00:00Z"
  }
]
```

#### POST /api/doctors
- **Description**: Create a new doctor with schedule
- **Request Body**:
```json
{
  "doctor": {
    "name": "string (required)",
    "specialty": "string (required)",
    "phone": "string (required, format: 05XXXXXXXX)",
    "email": "string|null",
    "bio": "string|null",
    "qualifications": "string|null",
    "experienceYears": 0,
    "status": "نشط",
    "clinicId": "uuid|null"
  },
  "schedule": [
    {
      "dayOfWeek": "saturday",
      "isWorking": true,
      "startTime": "08:00",
      "endTime": "16:00"
    }
  ]
}
```
- **Response**: `Doctor` (created object)
- **Note**: `iconColor` is auto-assigned based on doctor count

#### PUT /api/doctors/{id}
- **Description**: Update doctor and schedule
- **Path Parameters**: `id` (UUID)
- **Request Body**: Same structure as POST
- **Response**: `Doctor` (updated object)
- **Note**: Schedule is replaced entirely (delete old, insert new)

#### DELETE /api/doctors/{id}
- **Description**: Delete a doctor (cascades to schedules)
- **Path Parameters**: `id` (UUID)
- **Response**: `204 No Content`

---

### 1.3 Clinics API

#### GET /api/clinics
- **Description**: Get all clinics
- **Response**: `Clinic[]`
```json
[
  {
    "id": "uuid",
    "name": "string",
    "nameEn": "string|null",
    "status": "active|inactive",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
]
```

#### GET /api/clinics/with-doctor-count
- **Description**: Get all clinics with doctor counts
- **Response**: `ClinicWithDoctorCount[]`
```json
[
  {
    "id": "uuid",
    "name": "string",
    "nameEn": "string|null",
    "status": "active|inactive",
    "doctorCount": 5,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
]
```

#### POST /api/clinics
- **Description**: Create a new clinic
- **Request Body**:
```json
{
  "name": "string (required)",
  "nameEn": "string|null",
  "status": "active"
}
```
- **Response**: `Clinic`

#### PUT /api/clinics/{id}
- **Description**: Update a clinic
- **Response**: `Clinic`

#### DELETE /api/clinics/{id}
- **Description**: Delete a clinic
- **Response**: `204 No Content`
- **Note**: May fail if doctors are assigned

---

### 1.4 Appointments API

#### GET /api/appointments
- **Description**: Get all appointments with details
- **Response**: `AppointmentWithDetails[]`
```json
[
  {
    "id": "uuid",
    "patientId": "uuid",
    "doctorId": "uuid",
    "clinicId": "uuid",
    "appointmentDate": "2024-01-01",
    "appointmentTime": "09:00:00",
    "appointmentType": "general|followup|consultation|emergency",
    "reason": "string",
    "notes": "string|null",
    "status": "upcoming|completed|cancelled",
    "sendReminder": true,
    "patient": { "id": "uuid", "fullName": "string" },
    "doctor": { "id": "uuid", "name": "string" },
    "clinic": { "id": "uuid", "name": "string" },
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
]
```

#### GET /api/appointments/by-date/{date}
- **Description**: Get appointments for a specific date
- **Path Parameters**: `date` (YYYY-MM-DD)
- **Response**: `AppointmentWithDetails[]`

#### GET /api/appointments/booked-slots
- **Description**: Get booked time slots for a doctor on a date
- **Query Parameters**:
  - `doctorId` (required): UUID
  - `date` (required): YYYY-MM-DD
- **Response**: `string[]` (array of times like "09:00:00")
- **Note**: Excludes cancelled appointments

#### POST /api/appointments
- **Description**: Create a new appointment
- **Request Body**:
```json
{
  "patientId": "uuid (required)",
  "doctorId": "uuid (required)",
  "clinicId": "uuid (required)",
  "appointmentDate": "YYYY-MM-DD (required)",
  "appointmentTime": "HH:mm:ss (required)",
  "appointmentType": "string (required)",
  "reason": "string (required)",
  "notes": "string|null",
  "sendReminder": true
}
```
- **Response**: `AppointmentWithDetails`

#### PUT /api/appointments/{id}
- **Description**: Update an appointment
- **Response**: `AppointmentWithDetails`

#### PUT /api/appointments/{id}/cancel
- **Description**: Cancel an appointment
- **Response**: `Appointment` (with status: "cancelled")

---

### 1.5 Settings API

#### GET /api/settings/center
- **Description**: Get center settings
- **Response**: `CenterSettings`
```json
{
  "id": "uuid",
  "nameAr": "string",
  "nameEn": "string|null",
  "phone": "string|null",
  "altPhone": "string|null",
  "email": "string|null",
  "website": "string|null",
  "address": "string|null",
  "city": "string|null",
  "postalCode": "string|null",
  "logoUrl": "string|null",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

#### PUT /api/settings/center/{id}
- **Description**: Update center settings
- **Request Body**: Partial `CenterSettings`
- **Response**: `CenterSettings`

#### GET /api/settings/system
- **Description**: Get system settings
- **Response**: `SystemSettings`
```json
{
  "id": "uuid",
  "language": "ar|en",
  "timezone": "Asia/Riyadh",
  "dateFormat": "gregorian|hijri",
  "timeFormat": "12|24",
  "defaultAppointmentDuration": 30,
  "sameDayBooking": true,
  "minNoticeHours": 2,
  "smsEnabled": true,
  "emailEnabled": false,
  "firstReminderHours": 24,
  "secondReminderHours": 2,
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

#### PUT /api/settings/system/{id}
- **Description**: Update system settings
- **Response**: `SystemSettings`

#### GET /api/settings/working-hours
- **Description**: Get center working hours
- **Response**: `CenterWorkingHours[]`
```json
[
  {
    "id": "uuid",
    "dayOfWeek": "saturday",
    "isOpen": true,
    "openTime": "08:00:00",
    "closeTime": "17:00:00"
  }
]
```

#### PUT /api/settings/working-hours
- **Description**: Update working hours (batch)
- **Request Body**:
```json
[
  {
    "id": "uuid",
    "isOpen": true,
    "openTime": "08:00",
    "closeTime": "17:00"
  }
]
```
- **Response**: `204 No Content`

---

## 2. Database Schema

### SQL Server Script

```sql
-- Create Database
CREATE DATABASE HealthcareClinic;
GO

USE HealthcareClinic;
GO

-- Clinics Table
CREATE TABLE Clinics (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Name NVARCHAR(100) NOT NULL,
    NameEn NVARCHAR(100) NULL,
    Status NVARCHAR(20) NOT NULL DEFAULT 'active',
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- Doctors Table
CREATE TABLE Doctors (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Name NVARCHAR(100) NOT NULL,
    Specialty NVARCHAR(100) NOT NULL,
    Phone NVARCHAR(20) NOT NULL,
    Email NVARCHAR(255) NULL,
    Bio NVARCHAR(MAX) NULL,
    Qualifications NVARCHAR(MAX) NULL,
    ExperienceYears INT NOT NULL DEFAULT 0,
    Status NVARCHAR(20) NOT NULL DEFAULT N'نشط',
    IconColor NVARCHAR(100) NULL DEFAULT 'bg-blue-100 text-blue-600',
    ClinicId UNIQUEIDENTIFIER NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT FK_Doctors_Clinics FOREIGN KEY (ClinicId) REFERENCES Clinics(Id) ON DELETE SET NULL
);

-- Doctor Schedules Table
CREATE TABLE DoctorSchedules (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    DoctorId UNIQUEIDENTIFIER NOT NULL,
    DayOfWeek NVARCHAR(20) NOT NULL, -- saturday, sunday, monday, etc.
    IsWorking BIT NOT NULL DEFAULT 1,
    StartTime TIME NOT NULL DEFAULT '08:00:00',
    EndTime TIME NOT NULL DEFAULT '16:00:00',
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT FK_DoctorSchedules_Doctors FOREIGN KEY (DoctorId) REFERENCES Doctors(Id) ON DELETE CASCADE
);

-- Patients Table
CREATE TABLE Patients (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    FullName NVARCHAR(100) NOT NULL,
    Gender NVARCHAR(10) NOT NULL, -- male, female
    BirthDate DATE NOT NULL,
    NationalId NVARCHAR(10) NOT NULL UNIQUE,
    Phone NVARCHAR(20) NOT NULL,
    AltPhone NVARCHAR(20) NULL,
    Email NVARCHAR(255) NULL,
    Address NVARCHAR(MAX) NULL,
    BloodType NVARCHAR(10) NULL, -- A+, A-, B+, B-, AB+, AB-, O+, O-, unknown
    ChronicDiseases NVARCHAR(MAX) NULL,
    Allergies NVARCHAR(MAX) NULL,
    EmergencyContactName NVARCHAR(100) NOT NULL,
    EmergencyContactPhone NVARCHAR(20) NOT NULL,
    EmergencyContactRelation NVARCHAR(50) NOT NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- Appointments Table
CREATE TABLE Appointments (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    PatientId UNIQUEIDENTIFIER NOT NULL,
    DoctorId UNIQUEIDENTIFIER NOT NULL,
    ClinicId UNIQUEIDENTIFIER NOT NULL,
    AppointmentDate DATE NOT NULL,
    AppointmentTime TIME NOT NULL,
    AppointmentType NVARCHAR(50) NOT NULL, -- general, followup, consultation, emergency
    Reason NVARCHAR(MAX) NOT NULL,
    Notes NVARCHAR(MAX) NULL,
    Status NVARCHAR(20) NOT NULL DEFAULT 'upcoming', -- upcoming, completed, cancelled
    SendReminder BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT FK_Appointments_Patients FOREIGN KEY (PatientId) REFERENCES Patients(Id) ON DELETE CASCADE,
    CONSTRAINT FK_Appointments_Doctors FOREIGN KEY (DoctorId) REFERENCES Doctors(Id) ON DELETE CASCADE,
    CONSTRAINT FK_Appointments_Clinics FOREIGN KEY (ClinicId) REFERENCES Clinics(Id) ON DELETE CASCADE
);

-- Center Settings Table (Single row)
CREATE TABLE CenterSettings (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    NameAr NVARCHAR(100) NOT NULL DEFAULT N'مركز الرعاية الصحية',
    NameEn NVARCHAR(100) NULL DEFAULT 'Healthcare Center',
    Phone NVARCHAR(20) NULL,
    AltPhone NVARCHAR(20) NULL,
    Email NVARCHAR(255) NULL,
    Website NVARCHAR(255) NULL,
    Address NVARCHAR(MAX) NULL,
    City NVARCHAR(100) NULL DEFAULT N'الرياض',
    PostalCode NVARCHAR(20) NULL,
    LogoUrl NVARCHAR(500) NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- System Settings Table (Single row)
CREATE TABLE SystemSettings (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Language NVARCHAR(10) NOT NULL DEFAULT 'ar',
    Timezone NVARCHAR(50) NOT NULL DEFAULT 'Asia/Riyadh',
    DateFormat NVARCHAR(20) NOT NULL DEFAULT 'gregorian',
    TimeFormat NVARCHAR(10) NOT NULL DEFAULT '12',
    DefaultAppointmentDuration INT NOT NULL DEFAULT 30,
    SameDayBooking BIT NOT NULL DEFAULT 1,
    MinNoticeHours INT NOT NULL DEFAULT 2,
    SmsEnabled BIT NOT NULL DEFAULT 1,
    EmailEnabled BIT NOT NULL DEFAULT 0,
    FirstReminderHours INT NOT NULL DEFAULT 24,
    SecondReminderHours INT NOT NULL DEFAULT 2,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- Center Working Hours Table
CREATE TABLE CenterWorkingHours (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    DayOfWeek NVARCHAR(20) NOT NULL, -- saturday, sunday, monday, etc.
    IsOpen BIT NOT NULL DEFAULT 1,
    OpenTime TIME NOT NULL DEFAULT '08:00:00',
    CloseTime TIME NOT NULL DEFAULT '17:00:00'
);

-- Create Indexes
CREATE INDEX IX_Doctors_ClinicId ON Doctors(ClinicId);
CREATE INDEX IX_DoctorSchedules_DoctorId ON DoctorSchedules(DoctorId);
CREATE INDEX IX_Appointments_PatientId ON Appointments(PatientId);
CREATE INDEX IX_Appointments_DoctorId ON Appointments(DoctorId);
CREATE INDEX IX_Appointments_ClinicId ON Appointments(ClinicId);
CREATE INDEX IX_Appointments_Date ON Appointments(AppointmentDate);
CREATE INDEX IX_Patients_NationalId ON Patients(NationalId);
CREATE INDEX IX_Patients_Phone ON Patients(Phone);

-- Insert Default Working Hours
INSERT INTO CenterWorkingHours (DayOfWeek, IsOpen, OpenTime, CloseTime) VALUES
('saturday', 1, '08:00:00', '17:00:00'),
('sunday', 1, '08:00:00', '17:00:00'),
('monday', 1, '08:00:00', '17:00:00'),
('tuesday', 1, '08:00:00', '17:00:00'),
('wednesday', 1, '08:00:00', '17:00:00'),
('thursday', 1, '08:00:00', '17:00:00'),
('friday', 0, '08:00:00', '17:00:00');

-- Insert Default Center Settings
INSERT INTO CenterSettings (NameAr, NameEn) VALUES (N'مركز الرعاية الصحية', 'Healthcare Center');

-- Insert Default System Settings
INSERT INTO SystemSettings DEFAULT VALUES;
GO

-- Auto-update UpdatedAt trigger
CREATE TRIGGER TR_Patients_UpdatedAt ON Patients
AFTER UPDATE AS
BEGIN
    UPDATE Patients SET UpdatedAt = GETUTCDATE() 
    WHERE Id IN (SELECT Id FROM inserted);
END;
GO

CREATE TRIGGER TR_Doctors_UpdatedAt ON Doctors
AFTER UPDATE AS
BEGIN
    UPDATE Doctors SET UpdatedAt = GETUTCDATE() 
    WHERE Id IN (SELECT Id FROM inserted);
END;
GO

CREATE TRIGGER TR_Appointments_UpdatedAt ON Appointments
AFTER UPDATE AS
BEGIN
    UPDATE Appointments SET UpdatedAt = GETUTCDATE() 
    WHERE Id IN (SELECT Id FROM inserted);
END;
GO

CREATE TRIGGER TR_Clinics_UpdatedAt ON Clinics
AFTER UPDATE AS
BEGIN
    UPDATE Clinics SET UpdatedAt = GETUTCDATE() 
    WHERE Id IN (SELECT Id FROM inserted);
END;
GO
```

### PostgreSQL Script

```sql
-- Create Extension for UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Clinics Table
CREATE TABLE clinics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    name_en TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Doctors Table
CREATE TABLE doctors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    specialty TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    bio TEXT,
    qualifications TEXT,
    experience_years INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'نشط',
    icon_color TEXT DEFAULT 'bg-blue-100 text-blue-600',
    clinic_id UUID REFERENCES clinics(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Doctor Schedules Table
CREATE TABLE doctor_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    day_of_week TEXT NOT NULL,
    is_working BOOLEAN NOT NULL DEFAULT TRUE,
    start_time TIME NOT NULL DEFAULT '08:00:00',
    end_time TIME NOT NULL DEFAULT '16:00:00',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Patients Table
CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name TEXT NOT NULL,
    gender TEXT NOT NULL,
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
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Appointments Table
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    appointment_type TEXT NOT NULL,
    reason TEXT NOT NULL,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'upcoming',
    send_reminder BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Center Settings Table
CREATE TABLE center_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name_ar TEXT NOT NULL DEFAULT 'مركز الرعاية الصحية',
    name_en TEXT DEFAULT 'Healthcare Center',
    phone TEXT,
    alt_phone TEXT,
    email TEXT,
    website TEXT,
    address TEXT,
    city TEXT DEFAULT 'الرياض',
    postal_code TEXT,
    logo_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- System Settings Table
CREATE TABLE system_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    language TEXT NOT NULL DEFAULT 'ar',
    timezone TEXT NOT NULL DEFAULT 'Asia/Riyadh',
    date_format TEXT NOT NULL DEFAULT 'gregorian',
    time_format TEXT NOT NULL DEFAULT '12',
    default_appointment_duration INTEGER NOT NULL DEFAULT 30,
    same_day_booking BOOLEAN NOT NULL DEFAULT TRUE,
    min_notice_hours INTEGER NOT NULL DEFAULT 2,
    sms_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    email_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    first_reminder_hours INTEGER NOT NULL DEFAULT 24,
    second_reminder_hours INTEGER NOT NULL DEFAULT 2,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Center Working Hours Table
CREATE TABLE center_working_hours (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    day_of_week TEXT NOT NULL,
    is_open BOOLEAN NOT NULL DEFAULT TRUE,
    open_time TIME NOT NULL DEFAULT '08:00:00',
    close_time TIME NOT NULL DEFAULT '17:00:00'
);

-- Create Indexes
CREATE INDEX idx_doctors_clinic_id ON doctors(clinic_id);
CREATE INDEX idx_doctor_schedules_doctor_id ON doctor_schedules(doctor_id);
CREATE INDEX idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX idx_appointments_doctor_id ON appointments(doctor_id);
CREATE INDEX idx_appointments_clinic_id ON appointments(clinic_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_patients_national_id ON patients(national_id);
CREATE INDEX idx_patients_phone ON patients(phone);

-- Auto-update trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers
CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_doctors_updated_at BEFORE UPDATE ON doctors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clinics_updated_at BEFORE UPDATE ON clinics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert Default Data
INSERT INTO center_working_hours (day_of_week, is_open, open_time, close_time) VALUES
('saturday', true, '08:00:00', '17:00:00'),
('sunday', true, '08:00:00', '17:00:00'),
('monday', true, '08:00:00', '17:00:00'),
('tuesday', true, '08:00:00', '17:00:00'),
('wednesday', true, '08:00:00', '17:00:00'),
('thursday', true, '08:00:00', '17:00:00'),
('friday', false, '08:00:00', '17:00:00');

INSERT INTO center_settings (name_ar, name_en) VALUES ('مركز الرعاية الصحية', 'Healthcare Center');
INSERT INTO system_settings DEFAULT VALUES;
```

---

## 3. .NET Backend Structure

### Project Structure

```
HealthcareClinic.API/
├── Controllers/
│   ├── PatientsController.cs
│   ├── DoctorsController.cs
│   ├── ClinicsController.cs
│   ├── AppointmentsController.cs
│   └── SettingsController.cs
├── DTOs/
│   ├── Patients/
│   │   ├── PatientDto.cs
│   │   ├── CreatePatientDto.cs
│   │   └── UpdatePatientDto.cs
│   ├── Doctors/
│   │   ├── DoctorDto.cs
│   │   ├── CreateDoctorDto.cs
│   │   └── DoctorScheduleDto.cs
│   ├── Clinics/
│   │   ├── ClinicDto.cs
│   │   └── CreateClinicDto.cs
│   ├── Appointments/
│   │   ├── AppointmentDto.cs
│   │   └── CreateAppointmentDto.cs
│   └── Settings/
│       ├── CenterSettingsDto.cs
│       ├── SystemSettingsDto.cs
│       └── WorkingHoursDto.cs
├── Entities/
│   ├── Patient.cs
│   ├── Doctor.cs
│   ├── DoctorSchedule.cs
│   ├── Clinic.cs
│   ├── Appointment.cs
│   ├── CenterSettings.cs
│   ├── SystemSettings.cs
│   └── CenterWorkingHours.cs
├── Data/
│   └── ApplicationDbContext.cs
├── Repositories/
│   ├── Interfaces/
│   │   ├── IPatientRepository.cs
│   │   ├── IDoctorRepository.cs
│   │   ├── IClinicRepository.cs
│   │   ├── IAppointmentRepository.cs
│   │   └── ISettingsRepository.cs
│   └── Implementations/
│       ├── PatientRepository.cs
│       ├── DoctorRepository.cs
│       ├── ClinicRepository.cs
│       ├── AppointmentRepository.cs
│       └── SettingsRepository.cs
├── Services/
│   ├── Interfaces/
│   │   ├── IPatientService.cs
│   │   └── ...
│   └── Implementations/
│       ├── PatientService.cs
│       └── ...
├── Validators/
│   ├── CreatePatientValidator.cs
│   ├── CreateDoctorValidator.cs
│   └── CreateAppointmentValidator.cs
├── Middleware/
│   └── ExceptionMiddleware.cs
├── Extensions/
│   └── ServiceExtensions.cs
├── Mappings/
│   └── MappingProfile.cs
├── appsettings.json
└── Program.cs
```

### Key Files Content

See the separate file `DOTNET_CODE_SAMPLES.md` for complete code samples.

---

## 4. Frontend Integration Guide

### 4.1 Create API Client

Create a new file `src/lib/api-client.ts`:

```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://your-api.com/api';

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: unknown;
  headers?: Record<string, string>;
}

class ApiError extends Error {
  constructor(public status: number, message: string, public data?: unknown) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, headers = {} } = options;
  
  const token = localStorage.getItem('auth_token');
  
  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...headers,
    },
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(response.status, errorData.message || 'Request failed', errorData);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

export const api = {
  get: <T>(endpoint: string) => request<T>(endpoint),
  post: <T>(endpoint: string, body: unknown) => request<T>(endpoint, { method: 'POST', body }),
  put: <T>(endpoint: string, body: unknown) => request<T>(endpoint, { method: 'PUT', body }),
  patch: <T>(endpoint: string, body: unknown) => request<T>(endpoint, { method: 'PATCH', body }),
  delete: <T>(endpoint: string) => request<T>(endpoint, { method: 'DELETE' }),
};

export { ApiError };
```

### 4.2 Create Type Definitions

Create `src/types/api.ts`:

```typescript
// Patient Types
export interface Patient {
  id: string;
  fullName: string;
  gender: 'male' | 'female';
  birthDate: string;
  nationalId: string;
  phone: string;
  altPhone: string | null;
  email: string | null;
  address: string | null;
  bloodType: string | null;
  chronicDiseases: string | null;
  allergies: string | null;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelation: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePatientRequest {
  fullName: string;
  gender: 'male' | 'female';
  birthDate: string;
  nationalId: string;
  phone: string;
  altPhone?: string;
  email?: string;
  address?: string;
  bloodType?: string;
  chronicDiseases?: string;
  allergies?: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelation: string;
}

// Doctor Types
export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  phone: string;
  email: string | null;
  bio: string | null;
  qualifications: string | null;
  experienceYears: number;
  status: string;
  iconColor: string | null;
  clinicId: string | null;
  clinic: { id: string; name: string } | null;
  createdAt: string;
  updatedAt: string;
}

export interface DoctorSchedule {
  id: string;
  doctorId: string;
  dayOfWeek: string;
  isWorking: boolean;
  startTime: string;
  endTime: string;
  createdAt: string;
}

export interface CreateDoctorRequest {
  doctor: {
    name: string;
    specialty: string;
    phone: string;
    email?: string;
    bio?: string;
    qualifications?: string;
    experienceYears?: number;
    status?: string;
    clinicId?: string;
  };
  schedule?: {
    dayOfWeek: string;
    isWorking: boolean;
    startTime: string;
    endTime: string;
  }[];
}

// Clinic Types
export interface Clinic {
  id: string;
  name: string;
  nameEn: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClinicWithDoctorCount extends Clinic {
  doctorCount: number;
}

// Appointment Types
export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  clinicId: string;
  appointmentDate: string;
  appointmentTime: string;
  appointmentType: string;
  reason: string;
  notes: string | null;
  status: string;
  sendReminder: boolean;
  patient: { id: string; fullName: string } | null;
  doctor: { id: string; name: string } | null;
  clinic: { id: string; name: string } | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAppointmentRequest {
  patientId: string;
  doctorId: string;
  clinicId: string;
  appointmentDate: string;
  appointmentTime: string;
  appointmentType: string;
  reason: string;
  notes?: string;
  sendReminder?: boolean;
}

// Settings Types
export interface CenterSettings {
  id: string;
  nameAr: string;
  nameEn: string | null;
  phone: string | null;
  altPhone: string | null;
  email: string | null;
  website: string | null;
  address: string | null;
  city: string | null;
  postalCode: string | null;
  logoUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SystemSettings {
  id: string;
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: string;
  defaultAppointmentDuration: number;
  sameDayBooking: boolean;
  minNoticeHours: number;
  smsEnabled: boolean;
  emailEnabled: boolean;
  firstReminderHours: number;
  secondReminderHours: number;
  createdAt: string;
  updatedAt: string;
}

export interface WorkingHours {
  id: string;
  dayOfWeek: string;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}
```

### 4.3 Replace Hooks

Create new hooks that use your API instead of Supabase. Example for patients:

**New `src/hooks/usePatients.ts`:**

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type { Patient, CreatePatientRequest } from '@/types/api';

export type { Patient };

export function usePatients() {
  return useQuery({
    queryKey: ['patients'],
    queryFn: () => api.get<Patient[]>('/patients'),
  });
}

export function useSearchPatients(searchQuery: string) {
  return useQuery({
    queryKey: ['patients', 'search', searchQuery],
    queryFn: () => api.get<Patient[]>(`/patients/search?query=${encodeURIComponent(searchQuery)}`),
    enabled: searchQuery.trim().length > 0,
  });
}

export function useCreatePatient() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (patient: CreatePatientRequest) => 
      api.post<Patient>('/patients', patient),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
  });
}

export function useUpdatePatient() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, ...updates }: Partial<CreatePatientRequest> & { id: string }) =>
      api.put<Patient>(`/patients/${id}`, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
  });
}

export function useDeletePatient() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => api.delete(`/patients/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
  });
}

export function calculateAge(birthDate: string | Date): number {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}
```

### 4.4 Environment Variables

Add to your `.env` file:

```env
VITE_API_URL=https://your-api-domain.com/api
```

### 4.5 Data Mapping Notes

The main differences between Supabase and your new API:

| Supabase (snake_case) | .NET API (camelCase) |
|-----------------------|----------------------|
| `full_name` | `fullName` |
| `birth_date` | `birthDate` |
| `national_id` | `nationalId` |
| `alt_phone` | `altPhone` |
| `blood_type` | `bloodType` |
| `chronic_diseases` | `chronicDiseases` |
| `emergency_contact_name` | `emergencyContactName` |
| `emergency_contact_phone` | `emergencyContactPhone` |
| `emergency_contact_relation` | `emergencyContactRelation` |
| `created_at` | `createdAt` |
| `updated_at` | `updatedAt` |
| `clinic_id` | `clinicId` |
| `doctor_id` | `doctorId` |
| `patient_id` | `patientId` |
| `appointment_date` | `appointmentDate` |
| `appointment_time` | `appointmentTime` |
| `appointment_type` | `appointmentType` |
| `send_reminder` | `sendReminder` |
| `day_of_week` | `dayOfWeek` |
| `is_working` | `isWorking` |
| `start_time` | `startTime` |
| `end_time` | `endTime` |
| `name_ar` | `nameAr` |
| `name_en` | `nameEn` |
| `is_open` | `isOpen` |
| `open_time` | `openTime` |
| `close_time` | `closeTime` |

---

## 5. Step-by-Step Migration Plan

### Phase 1: Build .NET Backend (1-2 weeks)

1. **Create ASP.NET Core Web API project**
   ```bash
   dotnet new webapi -n HealthcareClinic.API
   cd HealthcareClinic.API
   ```

2. **Install required packages**
   ```bash
   dotnet add package Microsoft.EntityFrameworkCore.SqlServer
   dotnet add package Microsoft.EntityFrameworkCore.Tools
   dotnet add package AutoMapper.Extensions.Microsoft.DependencyInjection
   dotnet add package FluentValidation.AspNetCore
   dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer
   dotnet add package Swashbuckle.AspNetCore
   ```

3. **Create Entity classes** from the schema above

4. **Create DbContext** and configure relationships

5. **Run EF migrations**
   ```bash
   dotnet ef migrations add InitialCreate
   dotnet ef database update
   ```

6. **Implement Repository pattern** for each entity

7. **Create DTOs** with AutoMapper profiles

8. **Implement Controllers** with all endpoints

9. **Add FluentValidation** validators

10. **Configure CORS** in Program.cs:
    ```csharp
    builder.Services.AddCors(options =>
    {
        options.AddPolicy("AllowFrontend", policy =>
        {
            policy.WithOrigins("https://your-lovable-app.lovable.app", "http://localhost:5173")
                  .AllowAnyMethod()
                  .AllowAnyHeader()
                  .AllowCredentials();
        });
    });
    ```

11. **Add global exception handling** middleware

12. **Test all endpoints** with Swagger/Postman

### Phase 2: Frontend Migration (3-5 days)

1. **Create API client** (`src/lib/api-client.ts`)

2. **Create new type definitions** (`src/types/api.ts`)

3. **Update hooks one by one**:
   - Start with `usePatients.ts`
   - Then `useDoctors.ts`
   - Then `useClinics.ts`
   - Then `useAppointments.ts`
   - Finally `useSettings.ts`

4. **Update environment variables**

5. **Test each feature** after updating its hook

6. **Remove Supabase dependencies** (optional, can keep for reference)

### Phase 3: Testing & Deployment (3-5 days)

1. **Test all CRUD operations** for each entity

2. **Test search functionality**

3. **Test edge cases** (duplicate national ID, invalid phone, etc.)

4. **Deploy .NET API** to your hosting (Azure, AWS, etc.)

5. **Update frontend environment** to point to production API

6. **Perform end-to-end testing**

### Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| CORS errors | Ensure your Lovable app URL is in CORS policy |
| Date format issues | Use ISO 8601 format (YYYY-MM-DD) |
| Time format issues | Use 24-hour format with seconds (HH:mm:ss) |
| Null handling | Configure JSON serializer to ignore nulls |
| Arabic text encoding | Ensure UTF-8 encoding in database and API |
| Case sensitivity | Use `[JsonPropertyName]` or configure camelCase |

---

## Authentication (Future)

When you're ready to add authentication:

1. **Add JWT configuration** to appsettings.json
2. **Create AuthController** with Login/Register endpoints
3. **Add `[Authorize]` attribute** to protected controllers
4. **Update frontend API client** to include Bearer token
5. **Create login/register pages** in frontend
6. **Store JWT token** in localStorage

---

**Note**: This documentation is based on your current codebase as of January 2026. If you add new features to the frontend, you'll need to extend the API accordingly.

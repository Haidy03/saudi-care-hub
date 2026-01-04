export interface NavItem {
  title: string;
  path: string;
  icon: string;
}

export interface User {
  name: string;
  avatar?: string;
  role: string;
}

export interface Patient {
  id: string;
  name: string;
  nationalId: string;
  phone: string;
  dateOfBirth: string;
  gender: 'male' | 'female';
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  phone: string;
  available: boolean;
}

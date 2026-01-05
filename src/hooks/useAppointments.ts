import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type Appointment = Tables<'appointments'>;
export type AppointmentInsert = TablesInsert<'appointments'>;
export type AppointmentUpdate = TablesUpdate<'appointments'>;

export interface AppointmentWithDetails extends Appointment {
  patients: { id: string; full_name: string } | null;
  doctors: { id: string; name: string } | null;
  clinics: { id: string; name: string } | null;
}

export function useAppointments() {
  return useQuery({
    queryKey: ['appointments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          patients (id, full_name),
          doctors (id, name),
          clinics (id, name)
        `)
        .order('appointment_date', { ascending: false })
        .order('appointment_time', { ascending: false });
      
      if (error) throw error;
      return data as AppointmentWithDetails[];
    },
  });
}

export function useAppointmentsByDate(date: string) {
  return useQuery({
    queryKey: ['appointments', 'by-date', date],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          patients (id, full_name),
          doctors (id, name),
          clinics (id, name)
        `)
        .eq('appointment_date', date)
        .order('appointment_time', { ascending: true });
      
      if (error) throw error;
      return data as AppointmentWithDetails[];
    },
    enabled: !!date,
  });
}

export function useBookedSlots(doctorId: string | null, date: string | null) {
  return useQuery({
    queryKey: ['booked-slots', doctorId, date],
    queryFn: async () => {
      if (!doctorId || !date) return [];
      
      const { data, error } = await supabase
        .from('appointments')
        .select('appointment_time')
        .eq('doctor_id', doctorId)
        .eq('appointment_date', date)
        .neq('status', 'cancelled');
      
      if (error) throw error;
      return data.map(a => a.appointment_time);
    },
    enabled: !!doctorId && !!date,
  });
}

export function useCreateAppointment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (appointment: AppointmentInsert) => {
      const { data, error } = await supabase
        .from('appointments')
        .insert(appointment)
        .select(`
          *,
          patients (id, full_name),
          doctors (id, name),
          clinics (id, name)
        `)
        .single();
      
      if (error) throw error;
      return data as AppointmentWithDetails;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['booked-slots'] });
    },
  });
}

export function useUpdateAppointment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: AppointmentUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('appointments')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          patients (id, full_name),
          doctors (id, name),
          clinics (id, name)
        `)
        .single();
      
      if (error) throw error;
      return data as AppointmentWithDetails;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['booked-slots'] });
    },
  });
}

export function useCancelAppointment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('appointments')
        .update({ status: 'cancelled' })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['booked-slots'] });
    },
  });
}

// Helper function to format time for display
export function formatTimeForDisplay(time: string): string {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours, 10);
  const suffix = hour >= 12 ? 'م' : 'ص';
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return `${displayHour.toString().padStart(2, '0')}:${minutes} ${suffix}`;
}

// Helper function to convert display time to database format
export function formatTimeForDatabase(displayTime: string): string {
  const match = displayTime.match(/(\d{2}):(\d{2})\s*(ص|م)/);
  if (!match) return displayTime;
  
  let [, hours, minutes, period] = match;
  let hour = parseInt(hours, 10);
  
  if (period === 'م' && hour !== 12) {
    hour += 12;
  } else if (period === 'ص' && hour === 12) {
    hour = 0;
  }
  
  return `${hour.toString().padStart(2, '0')}:${minutes}:00`;
}

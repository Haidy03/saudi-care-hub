import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type Doctor = Tables<'doctors'>;
export type DoctorInsert = TablesInsert<'doctors'>;
export type DoctorUpdate = TablesUpdate<'doctors'>;
export type DoctorSchedule = Tables<'doctor_schedules'>;

export interface DoctorWithClinic extends Doctor {
  clinics: { id: string; name: string } | null;
}

export function useDoctors() {
  return useQuery({
    queryKey: ['doctors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('doctors')
        .select(`
          *,
          clinics (id, name)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as DoctorWithClinic[];
    },
  });
}

export function useDoctorsByClinic(clinicId: string | null) {
  return useQuery({
    queryKey: ['doctors', 'by-clinic', clinicId],
    queryFn: async () => {
      if (!clinicId) return [];
      
      const { data, error } = await supabase
        .from('doctors')
        .select('*')
        .eq('clinic_id', clinicId)
        .eq('status', 'نشط')
        .order('name');
      
      if (error) throw error;
      return data;
    },
    enabled: !!clinicId,
  });
}

export function useDoctorSchedule(doctorId: string) {
  return useQuery({
    queryKey: ['doctor-schedule', doctorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('doctor_schedules')
        .select('*')
        .eq('doctor_id', doctorId);
      
      if (error) throw error;
      return data;
    },
    enabled: !!doctorId,
  });
}

const iconColors = [
  'bg-blue-100 text-blue-600',
  'bg-green-100 text-green-600',
  'bg-purple-100 text-purple-600',
  'bg-orange-100 text-orange-600',
  'bg-pink-100 text-pink-600',
  'bg-red-100 text-red-600',
  'bg-cyan-100 text-cyan-600',
  'bg-amber-100 text-amber-600',
];

export function useCreateDoctor() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      doctor, 
      schedule 
    }: { 
      doctor: DoctorInsert; 
      schedule?: { day_of_week: string; is_working: boolean; start_time: string; end_time: string }[] 
    }) => {
      // Get count of existing doctors for color assignment
      const { count } = await supabase
        .from('doctors')
        .select('*', { count: 'exact', head: true });
      
      const doctorWithColor = {
        ...doctor,
        icon_color: iconColors[(count || 0) % iconColors.length],
      };

      const { data, error } = await supabase
        .from('doctors')
        .insert(doctorWithColor)
        .select()
        .single();
      
      if (error) throw error;

      // Insert schedule if provided
      if (schedule && schedule.length > 0) {
        const scheduleWithDoctorId = schedule.map(s => ({
          ...s,
          doctor_id: data.id,
        }));

        const { error: scheduleError } = await supabase
          .from('doctor_schedules')
          .insert(scheduleWithDoctorId);
        
        if (scheduleError) throw scheduleError;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      queryClient.invalidateQueries({ queryKey: ['clinics-with-doctor-count'] });
    },
  });
}

export function useUpdateDoctor() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      id, 
      doctor,
      schedule 
    }: { 
      id: string; 
      doctor: DoctorUpdate;
      schedule?: { day_of_week: string; is_working: boolean; start_time: string; end_time: string }[] 
    }) => {
      const { data, error } = await supabase
        .from('doctors')
        .update(doctor)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;

      // Update schedule if provided
      if (schedule && schedule.length > 0) {
        // Delete existing schedules
        await supabase
          .from('doctor_schedules')
          .delete()
          .eq('doctor_id', id);

        // Insert new schedules
        const scheduleWithDoctorId = schedule.map(s => ({
          ...s,
          doctor_id: id,
        }));

        const { error: scheduleError } = await supabase
          .from('doctor_schedules')
          .insert(scheduleWithDoctorId);
        
        if (scheduleError) throw scheduleError;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      queryClient.invalidateQueries({ queryKey: ['clinics-with-doctor-count'] });
    },
  });
}

export function useDeleteDoctor() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('doctors')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      queryClient.invalidateQueries({ queryKey: ['clinics-with-doctor-count'] });
    },
  });
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type Clinic = Tables<'clinics'>;
export type ClinicInsert = TablesInsert<'clinics'>;
export type ClinicUpdate = TablesUpdate<'clinics'>;

export function useClinics() {
  return useQuery({
    queryKey: ['clinics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clinics')
        .select('*')
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });
}

export function useClinicWithDoctorCount() {
  return useQuery({
    queryKey: ['clinics-with-doctor-count'],
    queryFn: async () => {
      const { data: clinics, error: clinicsError } = await supabase
        .from('clinics')
        .select('*')
        .order('created_at', { ascending: true });
      
      if (clinicsError) throw clinicsError;

      const { data: doctors, error: doctorsError } = await supabase
        .from('doctors')
        .select('clinic_id');
      
      if (doctorsError) throw doctorsError;

      // Count doctors per clinic
      const doctorCounts = doctors.reduce((acc, doctor) => {
        if (doctor.clinic_id) {
          acc[doctor.clinic_id] = (acc[doctor.clinic_id] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);

      return clinics.map(clinic => ({
        ...clinic,
        doctorCount: doctorCounts[clinic.id] || 0,
      }));
    },
  });
}

export function useCreateClinic() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (clinic: ClinicInsert) => {
      const { data, error } = await supabase
        .from('clinics')
        .insert(clinic)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clinics'] });
      queryClient.invalidateQueries({ queryKey: ['clinics-with-doctor-count'] });
    },
  });
}

export function useUpdateClinic() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: ClinicUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('clinics')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clinics'] });
      queryClient.invalidateQueries({ queryKey: ['clinics-with-doctor-count'] });
    },
  });
}

export function useDeleteClinic() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('clinics')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clinics'] });
      queryClient.invalidateQueries({ queryKey: ['clinics-with-doctor-count'] });
    },
  });
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesUpdate } from '@/integrations/supabase/types';

export type CenterSettings = Tables<'center_settings'>;
export type SystemSettings = Tables<'system_settings'>;
export type CenterWorkingHours = Tables<'center_working_hours'>;

export function useCenterSettings() {
  return useQuery({
    queryKey: ['center-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('center_settings')
        .select('*')
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
  });
}

export function useSystemSettings() {
  return useQuery({
    queryKey: ['system-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
  });
}

export function useWorkingHours() {
  return useQuery({
    queryKey: ['working-hours'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('center_working_hours')
        .select('*')
        .order('day_of_week');
      
      if (error) throw error;
      
      // Sort by day order
      const dayOrder = ['saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
      return data.sort((a, b) => dayOrder.indexOf(a.day_of_week) - dayOrder.indexOf(b.day_of_week));
    },
  });
}

export function useUpdateCenterSettings() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: TablesUpdate<'center_settings'> & { id: string }) => {
      const { data, error } = await supabase
        .from('center_settings')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['center-settings'] });
    },
  });
}

export function useUpdateSystemSettings() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: TablesUpdate<'system_settings'> & { id: string }) => {
      const { data, error } = await supabase
        .from('system_settings')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-settings'] });
    },
  });
}

export function useUpdateWorkingHours() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (hours: { id: string; is_open: boolean; open_time: string; close_time: string }[]) => {
      const promises = hours.map(h => 
        supabase
          .from('center_working_hours')
          .update({
            is_open: h.is_open,
            open_time: h.open_time,
            close_time: h.close_time,
          })
          .eq('id', h.id)
      );
      
      await Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['working-hours'] });
    },
  });
}

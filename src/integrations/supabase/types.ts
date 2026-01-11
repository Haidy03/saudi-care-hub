export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      appointments: {
        Row: {
          appointment_date: string
          appointment_time: string
          appointment_type: string
          clinic_id: string
          created_at: string
          doctor_id: string
          id: string
          notes: string | null
          patient_id: string
          reason: string
          send_reminder: boolean
          status: string
          updated_at: string
        }
        Insert: {
          appointment_date: string
          appointment_time: string
          appointment_type: string
          clinic_id: string
          created_at?: string
          doctor_id: string
          id?: string
          notes?: string | null
          patient_id: string
          reason: string
          send_reminder?: boolean
          status?: string
          updated_at?: string
        }
        Update: {
          appointment_date?: string
          appointment_time?: string
          appointment_type?: string
          clinic_id?: string
          created_at?: string
          doctor_id?: string
          id?: string
          notes?: string | null
          patient_id?: string
          reason?: string
          send_reminder?: boolean
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      center_settings: {
        Row: {
          address: string | null
          alt_phone: string | null
          city: string | null
          created_at: string
          email: string | null
          id: string
          logo_url: string | null
          name_ar: string
          name_en: string | null
          phone: string | null
          postal_code: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          alt_phone?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          id?: string
          logo_url?: string | null
          name_ar?: string
          name_en?: string | null
          phone?: string | null
          postal_code?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          alt_phone?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          id?: string
          logo_url?: string | null
          name_ar?: string
          name_en?: string | null
          phone?: string | null
          postal_code?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      center_working_hours: {
        Row: {
          close_time: string
          day_of_week: string
          id: string
          is_open: boolean
          open_time: string
        }
        Insert: {
          close_time?: string
          day_of_week: string
          id?: string
          is_open?: boolean
          open_time?: string
        }
        Update: {
          close_time?: string
          day_of_week?: string
          id?: string
          is_open?: boolean
          open_time?: string
        }
        Relationships: []
      }
      clinics: {
        Row: {
          created_at: string
          id: string
          name: string
          name_en: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          name_en?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          name_en?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      doctor_schedules: {
        Row: {
          created_at: string
          day_of_week: string
          doctor_id: string
          end_time: string
          id: string
          is_working: boolean
          start_time: string
        }
        Insert: {
          created_at?: string
          day_of_week: string
          doctor_id: string
          end_time?: string
          id?: string
          is_working?: boolean
          start_time?: string
        }
        Update: {
          created_at?: string
          day_of_week?: string
          doctor_id?: string
          end_time?: string
          id?: string
          is_working?: boolean
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "doctor_schedules_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
        ]
      }
      doctors: {
        Row: {
          bio: string | null
          clinic_id: string | null
          created_at: string
          email: string | null
          experience_years: number
          icon_color: string | null
          id: string
          name: string
          phone: string
          qualifications: string | null
          specialty: string
          status: string
          updated_at: string
        }
        Insert: {
          bio?: string | null
          clinic_id?: string | null
          created_at?: string
          email?: string | null
          experience_years?: number
          icon_color?: string | null
          id?: string
          name: string
          phone: string
          qualifications?: string | null
          specialty: string
          status?: string
          updated_at?: string
        }
        Update: {
          bio?: string | null
          clinic_id?: string | null
          created_at?: string
          email?: string | null
          experience_years?: number
          icon_color?: string | null
          id?: string
          name?: string
          phone?: string
          qualifications?: string | null
          specialty?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "doctors_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      patients: {
        Row: {
          address: string | null
          allergies: string | null
          alt_phone: string | null
          birth_date: string
          blood_type: string | null
          chronic_diseases: string | null
          created_at: string
          current_medications: string | null
          email: string | null
          emergency_contact_name: string
          emergency_contact_phone: string
          emergency_contact_relation: string
          full_name: string
          gender: string
          has_insurance: boolean | null
          historical_medical_conditions: string | null
          id: string
          insurance_number: string | null
          insurance_provider: string | null
          is_smoker: boolean | null
          marital_status: string | null
          national_id: string
          nationality: string | null
          occupation: string | null
          phone: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          allergies?: string | null
          alt_phone?: string | null
          birth_date: string
          blood_type?: string | null
          chronic_diseases?: string | null
          created_at?: string
          current_medications?: string | null
          email?: string | null
          emergency_contact_name: string
          emergency_contact_phone: string
          emergency_contact_relation: string
          full_name: string
          gender: string
          has_insurance?: boolean | null
          historical_medical_conditions?: string | null
          id?: string
          insurance_number?: string | null
          insurance_provider?: string | null
          is_smoker?: boolean | null
          marital_status?: string | null
          national_id: string
          nationality?: string | null
          occupation?: string | null
          phone: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          allergies?: string | null
          alt_phone?: string | null
          birth_date?: string
          blood_type?: string | null
          chronic_diseases?: string | null
          created_at?: string
          current_medications?: string | null
          email?: string | null
          emergency_contact_name?: string
          emergency_contact_phone?: string
          emergency_contact_relation?: string
          full_name?: string
          gender?: string
          has_insurance?: boolean | null
          historical_medical_conditions?: string | null
          id?: string
          insurance_number?: string | null
          insurance_provider?: string | null
          is_smoker?: boolean | null
          marital_status?: string | null
          national_id?: string
          nationality?: string | null
          occupation?: string | null
          phone?: string
          updated_at?: string
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          created_at: string
          date_format: string
          default_appointment_duration: number
          email_enabled: boolean
          first_reminder_hours: number
          id: string
          language: string
          min_notice_hours: number
          same_day_booking: boolean
          second_reminder_hours: number
          sms_enabled: boolean
          time_format: string
          timezone: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          date_format?: string
          default_appointment_duration?: number
          email_enabled?: boolean
          first_reminder_hours?: number
          id?: string
          language?: string
          min_notice_hours?: number
          same_day_booking?: boolean
          second_reminder_hours?: number
          sms_enabled?: boolean
          time_format?: string
          timezone?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          date_format?: string
          default_appointment_duration?: number
          email_enabled?: boolean
          first_reminder_hours?: number
          id?: string
          language?: string
          min_notice_hours?: number
          same_day_booking?: boolean
          second_reminder_hours?: number
          sms_enabled?: boolean
          time_format?: string
          timezone?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

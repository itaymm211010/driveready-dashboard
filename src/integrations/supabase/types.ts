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
      bug_reports: {
        Row: {
          created_at: string
          description: string
          id: string
          reporter_id: string | null
          resolved_at: string | null
          severity: string
          status: string
          steps_to_reproduce: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          reporter_id?: string | null
          resolved_at?: string | null
          severity?: string
          status?: string
          steps_to_reproduce?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          reporter_id?: string | null
          resolved_at?: string | null
          severity?: string
          status?: string
          steps_to_reproduce?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bug_reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      deployments: {
        Row: {
          created_at: string
          deployed_by: string | null
          environment: string
          error_log: string | null
          git_commit_hash: string | null
          id: string
          notes: string | null
          sprint_id: string | null
          status: string
          updated_at: string
          version: string
        }
        Insert: {
          created_at?: string
          deployed_by?: string | null
          environment?: string
          error_log?: string | null
          git_commit_hash?: string | null
          id?: string
          notes?: string | null
          sprint_id?: string | null
          status?: string
          updated_at?: string
          version: string
        }
        Update: {
          created_at?: string
          deployed_by?: string | null
          environment?: string
          error_log?: string | null
          git_commit_hash?: string | null
          id?: string
          notes?: string | null
          sprint_id?: string | null
          status?: string
          updated_at?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "deployments_deployed_by_fkey"
            columns: ["deployed_by"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deployments_sprint_id_fkey"
            columns: ["sprint_id"]
            isOneToOne: false
            referencedRelation: "sprints"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_planned_skills: {
        Row: {
          added_at: string
          added_before_lesson: boolean
          id: string
          lesson_id: string
          skill_id: string
        }
        Insert: {
          added_at?: string
          added_before_lesson?: boolean
          id?: string
          lesson_id: string
          skill_id: string
        }
        Update: {
          added_at?: string
          added_before_lesson?: boolean
          id?: string
          lesson_id?: string
          skill_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_planned_skills_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_planned_skills_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_time_log: {
        Row: {
          event_type: string
          id: string
          lesson_id: string
          notes: string | null
          timestamp: string
        }
        Insert: {
          event_type: string
          id?: string
          lesson_id: string
          notes?: string | null
          timestamp?: string
        }
        Update: {
          event_type?: string
          id?: string
          lesson_id?: string
          notes?: string | null
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_time_log_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          actual_duration_minutes: number | null
          actual_end_time: string | null
          actual_start_time: string | null
          amount: number
          cancellation_reason: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          created_at: string
          date: string
          duration_variance_minutes: number | null
          id: string
          notes: string | null
          payment_status: string | null
          pickup_address: string | null
          scheduled_duration_minutes: number | null
          skills_practiced: string[] | null
          status: string
          student_id: string
          taught_by_teacher_id: string | null
          teacher_id: string
          time_end: string
          time_start: string
          updated_at: string
        }
        Insert: {
          actual_duration_minutes?: number | null
          actual_end_time?: string | null
          actual_start_time?: string | null
          amount?: number
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          created_at?: string
          date: string
          duration_variance_minutes?: number | null
          id?: string
          notes?: string | null
          payment_status?: string | null
          pickup_address?: string | null
          scheduled_duration_minutes?: number | null
          skills_practiced?: string[] | null
          status?: string
          student_id: string
          taught_by_teacher_id?: string | null
          teacher_id: string
          time_end: string
          time_start: string
          updated_at?: string
        }
        Update: {
          actual_duration_minutes?: number | null
          actual_end_time?: string | null
          actual_start_time?: string | null
          amount?: number
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          created_at?: string
          date?: string
          duration_variance_minutes?: number | null
          id?: string
          notes?: string | null
          payment_status?: string | null
          pickup_address?: string | null
          scheduled_duration_minutes?: number | null
          skills_practiced?: string[] | null
          status?: string
          student_id?: string
          taught_by_teacher_id?: string | null
          teacher_id?: string
          time_end?: string
          time_start?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lessons_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lessons_taught_by_teacher_id_fkey"
            columns: ["taught_by_teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      project_alerts: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          severity: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          severity?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          severity?: string
        }
        Relationships: []
      }
      skill_categories: {
        Row: {
          color: string | null
          created_at: string
          icon: string
          id: string
          name: string
          sort_order: number
          teacher_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          icon?: string
          id?: string
          name: string
          sort_order?: number
          teacher_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          icon?: string
          id?: string
          name?: string
          sort_order?: number
          teacher_id?: string
        }
        Relationships: []
      }
      skill_history: {
        Row: {
          created_at: string
          id: string
          lesson_date: string
          lesson_id: string | null
          lesson_number: number | null
          practice_duration_minutes: number | null
          score: number
          student_skill_id: string
          teacher_note: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          lesson_date: string
          lesson_id?: string | null
          lesson_number?: number | null
          practice_duration_minutes?: number | null
          score: number
          student_skill_id: string
          teacher_note?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          lesson_date?: string
          lesson_id?: string | null
          lesson_number?: number | null
          practice_duration_minutes?: number | null
          score?: number
          student_skill_id?: string
          teacher_note?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "skill_history_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "skill_history_student_skill_id_fkey"
            columns: ["student_skill_id"]
            isOneToOne: false
            referencedRelation: "student_skills"
            referencedColumns: ["id"]
          },
        ]
      }
      skills: {
        Row: {
          category_id: string
          created_at: string
          id: string
          name: string
          sort_order: number
          teacher_id: string
        }
        Insert: {
          category_id: string
          created_at?: string
          id?: string
          name: string
          sort_order?: number
          teacher_id: string
        }
        Update: {
          category_id?: string
          created_at?: string
          id?: string
          name?: string
          sort_order?: number
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "skills_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "skill_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      sprints: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          end_date: string
          id: string
          name: string
          start_date: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date: string
          id?: string
          name: string
          start_date: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string
          id?: string
          name?: string
          start_date?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sprints_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      student_skills: {
        Row: {
          current_score: number
          id: string
          last_note: string | null
          last_practiced_date: string | null
          skill_id: string
          student_id: string
          times_practiced: number
          updated_at: string
        }
        Insert: {
          current_score: number
          id?: string
          last_note?: string | null
          last_practiced_date?: string | null
          skill_id: string
          student_id: string
          times_practiced?: number
          updated_at?: string
        }
        Update: {
          current_score?: number
          id?: string
          last_note?: string | null
          last_practiced_date?: string | null
          skill_id?: string
          student_id?: string
          times_practiced?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_skills_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_skills_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          avatar_url: string | null
          balance: number
          created_at: string
          date_of_birth: string | null
          email: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          external_test_price: number | null
          gender: string | null
          id: string
          id_number: string | null
          internal_test_price: number | null
          lesson_price: number
          license_type: string | null
          name: string
          phone: string | null
          pickup_address: string | null
          readiness_percentage: number
          school_address: string | null
          teacher_id: string
          teacher_notes: string | null
          theory_test_date: string | null
          theory_test_passed: boolean
          total_lessons: number
          updated_at: string
          work_address: string | null
        }
        Insert: {
          avatar_url?: string | null
          balance?: number
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          external_test_price?: number | null
          gender?: string | null
          id?: string
          id_number?: string | null
          internal_test_price?: number | null
          lesson_price?: number
          license_type?: string | null
          name: string
          phone?: string | null
          pickup_address?: string | null
          readiness_percentage?: number
          school_address?: string | null
          teacher_id: string
          teacher_notes?: string | null
          theory_test_date?: string | null
          theory_test_passed?: boolean
          total_lessons?: number
          updated_at?: string
          work_address?: string | null
        }
        Update: {
          avatar_url?: string | null
          balance?: number
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          external_test_price?: number | null
          gender?: string | null
          id?: string
          id_number?: string | null
          internal_test_price?: number | null
          lesson_price?: number
          license_type?: string | null
          name?: string
          phone?: string | null
          pickup_address?: string | null
          readiness_percentage?: number
          school_address?: string | null
          teacher_id?: string
          teacher_notes?: string | null
          theory_test_date?: string | null
          theory_test_passed?: boolean
          total_lessons?: number
          updated_at?: string
          work_address?: string | null
        }
        Relationships: []
      }
      task_logs: {
        Row: {
          created_at: string
          file_path: string | null
          id: string
          level: string
          line_number: number | null
          message: string
        }
        Insert: {
          created_at?: string
          file_path?: string | null
          id?: string
          level?: string
          line_number?: number | null
          message: string
        }
        Update: {
          created_at?: string
          file_path?: string | null
          id?: string
          level?: string
          line_number?: number | null
          message?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          actual_hours: number | null
          created_at: string
          created_by: string | null
          description: string | null
          estimated_hours: number | null
          id: string
          priority: string
          sprint_id: string | null
          status: string
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          actual_hours?: number | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          estimated_hours?: number | null
          id?: string
          priority?: string
          sprint_id?: string | null
          status?: string
          title: string
          type?: string
          updated_at?: string
        }
        Update: {
          actual_hours?: number | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          estimated_hours?: number | null
          id?: string
          priority?: string
          sprint_id?: string | null
          status?: string
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_sprint_id_fkey"
            columns: ["sprint_id"]
            isOneToOne: false
            referencedRelation: "sprints"
            referencedColumns: ["id"]
          },
        ]
      }
      teachers: {
        Row: {
          bank_account: string | null
          bank_branch: string | null
          bank_name: string | null
          created_at: string
          email: string
          id: string
          id_number: string | null
          is_active: boolean
          is_admin: boolean
          lesson_cost: number | null
          name: string
          notes: string | null
          parent_teacher_id: string | null
          phone: string | null
          vehicle_type: string | null
        }
        Insert: {
          bank_account?: string | null
          bank_branch?: string | null
          bank_name?: string | null
          created_at?: string
          email: string
          id: string
          id_number?: string | null
          is_active?: boolean
          is_admin?: boolean
          lesson_cost?: number | null
          name: string
          notes?: string | null
          parent_teacher_id?: string | null
          phone?: string | null
          vehicle_type?: string | null
        }
        Update: {
          bank_account?: string | null
          bank_branch?: string | null
          bank_name?: string | null
          created_at?: string
          email?: string
          id?: string
          id_number?: string | null
          is_active?: boolean
          is_admin?: boolean
          lesson_cost?: number | null
          name?: string
          notes?: string | null
          parent_teacher_id?: string | null
          phone?: string | null
          vehicle_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "teachers_parent_teacher_id_fkey"
            columns: ["parent_teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      seed_default_skills: {
        Args: { p_teacher_id: string }
        Returns: undefined
      }
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

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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      account_requests: {
        Row: {
          created_at: string
          id: string
          kind: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          kind: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          kind?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "account_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_access_state: {
        Row: {
          blocked: boolean
          id: string
          message: string | null
          status: number | null
          updated_at: string
        }
        Insert: {
          blocked?: boolean
          id: string
          message?: string | null
          status?: number | null
          updated_at?: string
        }
        Update: {
          blocked?: boolean
          id?: string
          message?: string | null
          status?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      ai_usage: {
        Row: {
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_usage_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          entity: string
          entity_id: string | null
          id: number
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          entity: string
          entity_id?: string | null
          id?: never
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          entity?: string
          entity_id?: string | null
          id?: never
        }
        Relationships: []
      }
      content_entries: {
        Row: {
          body_en: string
          body_fr: string
          created_by: string
          id: string
          page: string
          status: string
          title_en: string
          title_fr: string
          updated_at: string
        }
        Insert: {
          body_en?: string
          body_fr?: string
          created_by: string
          id?: string
          page: string
          status?: string
          title_en?: string
          title_fr?: string
          updated_at?: string
        }
        Update: {
          body_en?: string
          body_fr?: string
          created_by?: string
          id?: string
          page?: string
          status?: string
          title_en?: string
          title_fr?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_entries_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lending_policy: {
        Row: {
          id: boolean
          require_guarantor: boolean
          require_income: boolean
          updated_at: string
        }
        Insert: {
          id?: boolean
          require_guarantor?: boolean
          require_income?: boolean
          updated_at?: string
        }
        Update: {
          id?: boolean
          require_guarantor?: boolean
          require_income?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      loan_applications: {
        Row: {
          address: string
          amount: number
          created_at: string
          email: string
          employer: string
          guarantor_name: string
          guarantor_phone: string
          guarantor_relationship: string
          id: string
          membership_number: string
          monthly_income: number | null
          occupation: string
          phone: string
          purpose: string
          reviewed_at: string | null
          reviewed_by: string | null
          reviewer_note: string
          status: string
          term_months: number
          user_id: string
        }
        Insert: {
          address?: string
          amount: number
          created_at?: string
          email: string
          employer?: string
          guarantor_name?: string
          guarantor_phone?: string
          guarantor_relationship?: string
          id?: string
          membership_number: string
          monthly_income?: number | null
          occupation?: string
          phone: string
          purpose: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewer_note?: string
          status?: string
          term_months: number
          user_id: string
        }
        Update: {
          address?: string
          amount?: number
          created_at?: string
          email?: string
          employer?: string
          guarantor_name?: string
          guarantor_phone?: string
          guarantor_relationship?: string
          id?: string
          membership_number?: string
          monthly_income?: number | null
          occupation?: string
          phone?: string
          purpose?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewer_note?: string
          status?: string
          term_months?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "loan_applications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      member_documents: {
        Row: {
          category: string
          created_at: string
          file_name: string
          id: string
          mime_type: string
          object_path: string
          size_bytes: number
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string
          file_name: string
          id?: string
          mime_type: string
          object_path: string
          size_bytes: number
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          file_name?: string
          id?: string
          mime_type?: string
          object_path?: string
          size_bytes?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "member_documents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      membership_requests: {
        Row: {
          address: string
          created_at: string
          membership_number: string
          phone: string
          status: string
          user_id: string
        }
        Insert: {
          address: string
          created_at?: string
          membership_number?: string
          phone: string
          status?: string
          user_id: string
        }
        Update: {
          address?: string
          created_at?: string
          membership_number?: string
          phone?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "membership_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_path: string | null
          created_at: string
          full_name: string
          id: string
          preferred_language: string
        }
        Insert: {
          avatar_path?: string | null
          created_at?: string
          full_name?: string
          id: string
          preferred_language?: string
        }
        Update: {
          avatar_path?: string | null
          created_at?: string
          full_name?: string
          id?: string
          preferred_language?: string
        }
        Relationships: []
      }
      role_permissions: {
        Row: {
          permission: string
          role: string
        }
        Insert: {
          permission: string
          role: string
        }
        Update: {
          permission?: string
          role?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: string
          user_id: string
        }
        Insert: {
          id?: string
          role: string
          user_id: string
        }
        Update: {
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_permission: { Args: { _permission: string }; Returns: boolean }
      has_role: { Args: { _role: string; _user_id: string }; Returns: boolean }
      reserve_ai_request: { Args: never; Returns: boolean }
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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

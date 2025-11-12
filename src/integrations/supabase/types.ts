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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      destination_channels: {
        Row: {
          channel_id: number
          channel_name: string
          config_id: string
          created_at: string
          id: string
          is_active: boolean
        }
        Insert: {
          channel_id: number
          channel_name: string
          config_id: string
          created_at?: string
          id?: string
          is_active?: boolean
        }
        Update: {
          channel_id?: number
          channel_name?: string
          config_id?: string
          created_at?: string
          id?: string
          is_active?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "destination_channels_config_id_fkey"
            columns: ["config_id"]
            isOneToOne: false
            referencedRelation: "telegram_configs"
            referencedColumns: ["id"]
          },
        ]
      }
      replication_logs: {
        Row: {
          config_id: string
          created_at: string
          destination_channel_id: number
          error_message: string | null
          id: string
          message_type: string
          replicated_at: string
          source_channel_id: number
          status: string
        }
        Insert: {
          config_id: string
          created_at?: string
          destination_channel_id: number
          error_message?: string | null
          id?: string
          message_type: string
          replicated_at?: string
          source_channel_id: number
          status: string
        }
        Update: {
          config_id?: string
          created_at?: string
          destination_channel_id?: number
          error_message?: string | null
          id?: string
          message_type?: string
          replicated_at?: string
          source_channel_id?: number
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "replication_logs_config_id_fkey"
            columns: ["config_id"]
            isOneToOne: false
            referencedRelation: "telegram_configs"
            referencedColumns: ["id"]
          },
        ]
      }
      source_channels: {
        Row: {
          channel_id: number
          channel_name: string
          config_id: string
          created_at: string
          id: string
          is_active: boolean
        }
        Insert: {
          channel_id: number
          channel_name: string
          config_id: string
          created_at?: string
          id?: string
          is_active?: boolean
        }
        Update: {
          channel_id?: number
          channel_name?: string
          config_id?: string
          created_at?: string
          id?: string
          is_active?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "source_channels_config_id_fkey"
            columns: ["config_id"]
            isOneToOne: false
            referencedRelation: "telegram_configs"
            referencedColumns: ["id"]
          },
        ]
      }
      telegram_configs: {
        Row: {
          api_hash: string
          api_id: string
          created_at: string
          delay_seconds: number
          id: string
          phone_number: string
          session_string: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          api_hash: string
          api_id: string
          created_at?: string
          delay_seconds?: number
          id?: string
          phone_number: string
          session_string?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          api_hash?: string
          api_id?: string
          created_at?: string
          delay_seconds?: number
          id?: string
          phone_number?: string
          session_string?: string | null
          status?: string
          updated_at?: string
          user_id?: string
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

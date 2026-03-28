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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      connected_accounts: {
        Row: {
          account_id: string
          balance: number | null
          broker: string
          created_at: string
          daily_pnl: number | null
          equity: number | null
          id: string
          last_sync: string | null
          open_trades: number | null
          server: string | null
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          account_id: string
          balance?: number | null
          broker: string
          created_at?: string
          daily_pnl?: number | null
          equity?: number | null
          id?: string
          last_sync?: string | null
          open_trades?: number | null
          server?: string | null
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          account_id?: string
          balance?: number | null
          broker?: string
          created_at?: string
          daily_pnl?: number | null
          equity?: number | null
          id?: string
          last_sync?: string | null
          open_trades?: number | null
          server?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      journal_entries: {
        Row: {
          created_at: string
          date: string
          id: string
          lessons: string | null
          mindset: number | null
          mistakes: string | null
          notes: string | null
          pre_market: string | null
          review: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          lessons?: string | null
          mindset?: number | null
          mistakes?: string | null
          notes?: string | null
          pre_market?: string | null
          review?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          lessons?: string | null
          mindset?: number | null
          mistakes?: string | null
          notes?: string | null
          pre_market?: string | null
          review?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      playbooks: {
        Row: {
          conditions: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          rules: string[] | null
          screenshot: string | null
          strategy_tag: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          conditions?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          rules?: string[] | null
          screenshot?: string | null
          strategy_tag?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          conditions?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          rules?: string[] | null
          screenshot?: string | null
          strategy_tag?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          accent_color: string | null
          avatar_url: string | null
          created_at: string
          currency: string | null
          dark_mode: boolean | null
          default_lot_size: number | null
          default_risk_percent: number | null
          display_name: string | null
          id: string
          notifications: boolean | null
          preferred_sessions: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          accent_color?: string | null
          avatar_url?: string | null
          created_at?: string
          currency?: string | null
          dark_mode?: boolean | null
          default_lot_size?: number | null
          default_risk_percent?: number | null
          display_name?: string | null
          id?: string
          notifications?: boolean | null
          preferred_sessions?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          accent_color?: string | null
          avatar_url?: string | null
          created_at?: string
          currency?: string | null
          dark_mode?: boolean | null
          default_lot_size?: number | null
          default_risk_percent?: number | null
          display_name?: string | null
          id?: string
          notifications?: boolean | null
          preferred_sessions?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      trades: {
        Row: {
          broker_account_id: string | null
          close_date: string | null
          commission: number
          confidence: number | null
          created_at: string
          date: string
          direction: string
          duration: string | null
          emotion: number | null
          entry: number
          id: string
          lot_size: number
          mistakes: string[] | null
          notes: string | null
          pair: string
          pnl: number
          result: string
          rr: number
          screenshot: string | null
          sl: number
          strategy: string | null
          tp: number
          updated_at: string
          user_id: string
        }
        Insert: {
          broker_account_id?: string | null
          close_date?: string | null
          commission?: number
          confidence?: number | null
          created_at?: string
          date: string
          direction: string
          duration?: string | null
          emotion?: number | null
          entry: number
          id?: string
          lot_size: number
          mistakes?: string[] | null
          notes?: string | null
          pair: string
          pnl?: number
          result: string
          rr?: number
          screenshot?: string | null
          sl: number
          strategy?: string | null
          tp: number
          updated_at?: string
          user_id: string
        }
        Update: {
          broker_account_id?: string | null
          close_date?: string | null
          commission?: number
          confidence?: number | null
          created_at?: string
          date?: string
          direction?: string
          duration?: string | null
          emotion?: number | null
          entry?: number
          id?: string
          lot_size?: number
          mistakes?: string[] | null
          notes?: string | null
          pair?: string
          pnl?: number
          result?: string
          rr?: number
          screenshot?: string | null
          sl?: number
          strategy?: string | null
          tp?: number
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

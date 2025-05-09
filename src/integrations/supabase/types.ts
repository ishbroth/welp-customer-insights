export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      one_time_access: {
        Row: {
          created_at: string | null
          id: string
          resource_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          resource_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          resource_id?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          bio: string | null
          city: string | null
          created_at: string | null
          id: string
          name: string | null
          phone: string | null
          state: string | null
          type: string
          updated_at: string | null
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          created_at?: string | null
          id: string
          name?: string | null
          phone?: string | null
          state?: string | null
          type?: string
          updated_at?: string | null
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          created_at?: string | null
          id?: string
          name?: string | null
          phone?: string | null
          state?: string | null
          type?: string
          updated_at?: string | null
          zip_code?: string | null
        }
        Relationships: []
      }
      review_reactions: {
        Row: {
          created_at: string | null
          id: string
          reaction_type: string
          review_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          reaction_type: string
          review_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          reaction_type?: string
          review_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_reactions_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      review_responses: {
        Row: {
          author_id: string
          content: string
          created_at: string | null
          id: string
          parent_id: string | null
          review_id: string
          updated_at: string | null
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string | null
          id?: string
          parent_id?: string | null
          review_id: string
          updated_at?: string | null
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string | null
          id?: string
          parent_id?: string | null
          review_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "review_responses_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "review_responses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_responses_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          address: string | null
          city: string | null
          content: string | null
          created_at: string | null
          customer_id: string
          id: string
          rating: number
          reviewer_id: string
          state: string | null
          updated_at: string | null
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          content?: string | null
          created_at?: string | null
          customer_id: string
          id?: string
          rating: number
          reviewer_id: string
          state?: string | null
          updated_at?: string | null
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          content?: string | null
          created_at?: string | null
          customer_id?: string
          id?: string
          rating?: number
          reviewer_id?: string
          state?: string | null
          updated_at?: string | null
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "searchable_customers"
            referencedColumns: ["id"]
          },
        ]
      }
      searchable_customers: {
        Row: {
          address: string | null
          business_name: string | null
          city: string | null
          created_at: string | null
          email: string | null
          first_name: string | null
          id: string
          is_business: boolean | null
          last_name: string | null
          phone: string | null
          state: string | null
          updated_at: string | null
          verification_status: string | null
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          business_name?: string | null
          city?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          is_business?: boolean | null
          last_name?: string | null
          phone?: string | null
          state?: string | null
          updated_at?: string | null
          verification_status?: string | null
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          business_name?: string | null
          city?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          is_business?: boolean | null
          last_name?: string | null
          phone?: string | null
          state?: string | null
          updated_at?: string | null
          verification_status?: string | null
          zip_code?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          active: boolean
          created_at: string | null
          end_date: string | null
          id: string
          start_date: string | null
          subscription_type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string | null
          end_date?: string | null
          id?: string
          start_date?: string | null
          subscription_type?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          active?: boolean
          created_at?: string | null
          end_date?: string | null
          id?: string
          start_date?: string | null
          subscription_type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_reviewer_name: {
        Args: { reviewer_id: string }
        Returns: string
      }
      user_has_active_subscription: {
        Args: { user_id: string }
        Returns: boolean
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

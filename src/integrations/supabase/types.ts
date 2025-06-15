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
      business_info: {
        Row: {
          additional_info: string | null
          additional_licenses: string | null
          business_category: string | null
          business_name: string
          business_subcategory: string | null
          id: string
          license_expiration: string | null
          license_number: string | null
          license_state: string | null
          license_status: string | null
          license_type: string | null
          verified: boolean
          website: string | null
        }
        Insert: {
          additional_info?: string | null
          additional_licenses?: string | null
          business_category?: string | null
          business_name: string
          business_subcategory?: string | null
          id: string
          license_expiration?: string | null
          license_number?: string | null
          license_state?: string | null
          license_status?: string | null
          license_type?: string | null
          verified?: boolean
          website?: string | null
        }
        Update: {
          additional_info?: string | null
          additional_licenses?: string | null
          business_category?: string | null
          business_name?: string
          business_subcategory?: string | null
          id?: string
          license_expiration?: string | null
          license_number?: string | null
          license_state?: string | null
          license_status?: string | null
          license_type?: string | null
          verified?: boolean
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_info_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_transactions: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          stripe_session_id: string | null
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          stripe_session_id?: string | null
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          stripe_session_id?: string | null
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      credits: {
        Row: {
          balance: number
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      customer_access: {
        Row: {
          business_id: string | null
          created_at: string
          customer_id: string | null
          expires_at: string
          id: string
        }
        Insert: {
          business_id?: string | null
          created_at?: string
          customer_id?: string | null
          expires_at: string
          id?: string
        }
        Update: {
          business_id?: string | null
          created_at?: string
          customer_id?: string | null
          expires_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_access_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_access_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          created_at: string
          customer_responses: boolean
          email_notifications: boolean
          id: string
          new_reviews: boolean
          push_notifications: boolean
          review_reactions: boolean
          review_responses: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          customer_responses?: boolean
          email_notifications?: boolean
          id?: string
          new_reviews?: boolean
          push_notifications?: boolean
          review_reactions?: boolean
          review_responses?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          customer_responses?: boolean
          email_notifications?: boolean
          id?: string
          new_reviews?: boolean
          push_notifications?: boolean
          review_reactions?: boolean
          review_responses?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications_log: {
        Row: {
          channel: string
          content: string
          error_message: string | null
          id: string
          notification_type: string
          sent_at: string
          status: string
          subject: string | null
          user_id: string
        }
        Insert: {
          channel: string
          content: string
          error_message?: string | null
          id?: string
          notification_type: string
          sent_at?: string
          status?: string
          subject?: string | null
          user_id: string
        }
        Update: {
          channel?: string
          content?: string
          error_message?: string | null
          id?: string
          notification_type?: string
          sent_at?: string
          status?: string
          subject?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          avatar: string | null
          bio: string | null
          business_id: string | null
          city: string | null
          created_at: string
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          name: string | null
          phone: string | null
          state: string | null
          type: string
          updated_at: string
          verified: boolean | null
          zipcode: string | null
        }
        Insert: {
          address?: string | null
          avatar?: string | null
          bio?: string | null
          business_id?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          name?: string | null
          phone?: string | null
          state?: string | null
          type?: string
          updated_at?: string
          verified?: boolean | null
          zipcode?: string | null
        }
        Update: {
          address?: string | null
          avatar?: string | null
          bio?: string | null
          business_id?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          name?: string | null
          phone?: string | null
          state?: string | null
          type?: string
          updated_at?: string
          verified?: boolean | null
          zipcode?: string | null
        }
        Relationships: []
      }
      responses: {
        Row: {
          author_id: string | null
          content: string
          created_at: string
          id: string
          review_id: string | null
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          content: string
          created_at?: string
          id?: string
          review_id?: string | null
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          content?: string
          created_at?: string
          id?: string
          review_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "responses_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      review_photos: {
        Row: {
          caption: string | null
          created_at: string
          display_order: number
          id: string
          photo_url: string
          review_id: string
        }
        Insert: {
          caption?: string | null
          created_at?: string
          display_order?: number
          id?: string
          photo_url: string
          review_id: string
        }
        Update: {
          caption?: string | null
          created_at?: string
          display_order?: number
          id?: string
          photo_url?: string
          review_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_photos_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          business_id: string | null
          content: string
          created_at: string
          customer_address: string | null
          customer_city: string | null
          customer_id: string | null
          customer_name: string | null
          customer_phone: string | null
          customer_zipcode: string | null
          id: string
          rating: number
          updated_at: string
        }
        Insert: {
          business_id?: string | null
          content: string
          created_at?: string
          customer_address?: string | null
          customer_city?: string | null
          customer_id?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          customer_zipcode?: string | null
          id?: string
          rating: number
          updated_at?: string
        }
        Update: {
          business_id?: string | null
          content?: string
          created_at?: string
          customer_address?: string | null
          customer_city?: string | null
          customer_id?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          customer_zipcode?: string | null
          id?: string
          rating?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          started_at: string
          status: string
          type: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          started_at?: string
          status: string
          type: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          started_at?: string
          status?: string
          type?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      verification_codes: {
        Row: {
          code: string
          created_at: string
          expires_at: string
          id: string
          phone: string
        }
        Insert: {
          code: string
          created_at?: string
          expires_at: string
          id?: string
          phone: string
        }
        Update: {
          code?: string
          created_at?: string
          expires_at?: string
          id?: string
          phone?: string
        }
        Relationships: []
      }
      verification_requests: {
        Row: {
          additional_info: string | null
          additional_licenses: string | null
          address: string | null
          business_name: string
          business_subcategory: string | null
          business_type: string
          city: string | null
          created_at: string
          id: string
          license_state: string | null
          license_type: string | null
          phone: string | null
          primary_license: string
          state: string | null
          status: string
          user_id: string
          verification_token: string
          verified_at: string | null
          website: string | null
          zipcode: string | null
        }
        Insert: {
          additional_info?: string | null
          additional_licenses?: string | null
          address?: string | null
          business_name: string
          business_subcategory?: string | null
          business_type: string
          city?: string | null
          created_at?: string
          id?: string
          license_state?: string | null
          license_type?: string | null
          phone?: string | null
          primary_license: string
          state?: string | null
          status?: string
          user_id: string
          verification_token?: string
          verified_at?: string | null
          website?: string | null
          zipcode?: string | null
        }
        Update: {
          additional_info?: string | null
          additional_licenses?: string | null
          address?: string | null
          business_name?: string
          business_subcategory?: string | null
          business_type?: string
          city?: string | null
          created_at?: string
          id?: string
          license_state?: string | null
          license_type?: string | null
          phone?: string | null
          primary_license?: string
          state?: string | null
          status?: string
          user_id?: string
          verification_token?: string
          verified_at?: string | null
          website?: string | null
          zipcode?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      update_user_credits: {
        Args: {
          p_user_id: string
          p_amount: number
          p_type: string
          p_description?: string
          p_stripe_session_id?: string
        }
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

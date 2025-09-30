export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      account_lockout: {
        Row: {
          attempts: number
          created_at: string
          id: string
          identifier: string
          locked_until: string
          lockout_type: string
        }
        Insert: {
          attempts?: number
          created_at?: string
          id?: string
          identifier: string
          locked_until: string
          lockout_type: string
        }
        Update: {
          attempts?: number
          created_at?: string
          id?: string
          identifier?: string
          locked_until?: string
          lockout_type?: string
        }
        Relationships: []
      }
      auth_rate_limits: {
        Row: {
          attempt_type: string
          attempts: number
          blocked_until: string | null
          created_at: string
          first_attempt_at: string
          id: string
          identifier: string
          last_attempt_at: string
        }
        Insert: {
          attempt_type: string
          attempts?: number
          blocked_until?: string | null
          created_at?: string
          first_attempt_at?: string
          id?: string
          identifier: string
          last_attempt_at?: string
        }
        Update: {
          attempt_type?: string
          attempts?: number
          blocked_until?: string | null
          created_at?: string
          first_attempt_at?: string
          id?: string
          identifier?: string
          last_attempt_at?: string
        }
        Relationships: []
      }
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
      conversation_participants: {
        Row: {
          business_id: string
          created_at: string
          customer_id: string
          first_customer_response_at: string | null
          id: string
          review_id: string
        }
        Insert: {
          business_id: string
          created_at?: string
          customer_id: string
          first_customer_response_at?: string | null
          id?: string
          review_id: string
        }
        Update: {
          business_id?: string
          created_at?: string
          customer_id?: string
          first_customer_response_at?: string | null
          id?: string
          review_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_participants_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: true
            referencedRelation: "reviews"
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
      customer_review_associations: {
        Row: {
          association_type: string
          created_at: string
          customer_id: string
          id: string
          review_id: string
        }
        Insert: {
          association_type: string
          created_at?: string
          customer_id: string
          id?: string
          review_id: string
        }
        Update: {
          association_type?: string
          created_at?: string
          customer_id?: string
          id?: string
          review_id?: string
        }
        Relationships: []
      }
      device_tokens: {
        Row: {
          created_at: string
          id: string
          platform: string
          token: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          platform: string
          token: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          platform?: string
          token?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      email_verification_codes: {
        Row: {
          code: string
          created_at: string
          email: string
          expires_at: string
          id: string
          used: boolean
        }
        Insert: {
          code: string
          created_at?: string
          email: string
          expires_at: string
          id?: string
          used?: boolean
        }
        Update: {
          code?: string
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          used?: boolean
        }
        Relationships: []
      }
      guest_access: {
        Row: {
          access_token: string
          created_at: string
          expires_at: string
          id: string
          review_id: string
          stripe_session_id: string | null
        }
        Insert: {
          access_token: string
          created_at?: string
          expires_at: string
          id?: string
          review_id: string
          stripe_session_id?: string | null
        }
        Update: {
          access_token?: string
          created_at?: string
          expires_at?: string
          id?: string
          review_id?: string
          stripe_session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "guest_access_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
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
      review_claim_history: {
        Row: {
          broken_at: string | null
          business_id: string
          claimed_at: string
          created_at: string
          customer_address: string | null
          customer_city: string | null
          customer_id: string
          customer_name: string | null
          customer_phone: string | null
          customer_zipcode: string | null
          id: string
          original_review_id: string | null
        }
        Insert: {
          broken_at?: string | null
          business_id: string
          claimed_at?: string
          created_at?: string
          customer_address?: string | null
          customer_city?: string | null
          customer_id: string
          customer_name?: string | null
          customer_phone?: string | null
          customer_zipcode?: string | null
          id?: string
          original_review_id?: string | null
        }
        Update: {
          broken_at?: string | null
          business_id?: string
          claimed_at?: string
          created_at?: string
          customer_address?: string | null
          customer_city?: string | null
          customer_id?: string
          customer_name?: string | null
          customer_phone?: string | null
          customer_zipcode?: string | null
          id?: string
          original_review_id?: string | null
        }
        Relationships: []
      }
      review_claims: {
        Row: {
          claim_type: string
          claimed_at: string
          claimed_by: string
          created_at: string
          credit_transaction_id: string | null
          id: string
          review_id: string
        }
        Insert: {
          claim_type: string
          claimed_at?: string
          claimed_by: string
          created_at?: string
          credit_transaction_id?: string | null
          id?: string
          review_id: string
        }
        Update: {
          claim_type?: string
          claimed_at?: string
          claimed_by?: string
          created_at?: string
          credit_transaction_id?: string | null
          id?: string
          review_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_claims_credit_transaction_id_fkey"
            columns: ["credit_transaction_id"]
            isOneToOne: false
            referencedRelation: "credit_transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_claims_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: true
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      review_conversations: {
        Row: {
          author_id: string
          author_type: string
          content: string
          created_at: string
          id: string
          message_order: number
          review_id: string
          updated_at: string
        }
        Insert: {
          author_id: string
          author_type: string
          content: string
          created_at?: string
          id?: string
          message_order?: number
          review_id: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          author_type?: string
          content?: string
          created_at?: string
          id?: string
          message_order?: number
          review_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_conversations_review_id_fkey"
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
      review_reports: {
        Row: {
          complaint: string | null
          created_at: string
          id: string
          is_about_reporter: boolean
          processed_at: string | null
          reporter_email: string | null
          reporter_id: string
          reporter_name: string | null
          reporter_phone: string | null
          review_id: string
          status: string
        }
        Insert: {
          complaint?: string | null
          created_at?: string
          id?: string
          is_about_reporter?: boolean
          processed_at?: string | null
          reporter_email?: string | null
          reporter_id: string
          reporter_name?: string | null
          reporter_phone?: string | null
          review_id: string
          status?: string
        }
        Update: {
          complaint?: string | null
          created_at?: string
          id?: string
          is_about_reporter?: boolean
          processed_at?: string | null
          reporter_email?: string | null
          reporter_id?: string
          reporter_name?: string | null
          reporter_phone?: string | null
          review_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_reports_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          associates: Json | null
          business_id: string | null
          content: string
          created_at: string
          customer_address: string | null
          customer_business_name: string | null
          customer_city: string | null
          customer_name: string | null
          customer_nickname: string | null
          customer_phone: string | null
          customer_zipcode: string | null
          deleted_at: string | null
          id: string
          rating: number
          updated_at: string
        }
        Insert: {
          associates?: Json | null
          business_id?: string | null
          content: string
          created_at?: string
          customer_address?: string | null
          customer_business_name?: string | null
          customer_city?: string | null
          customer_name?: string | null
          customer_nickname?: string | null
          customer_phone?: string | null
          customer_zipcode?: string | null
          deleted_at?: string | null
          id?: string
          rating: number
          updated_at?: string
        }
        Update: {
          associates?: Json | null
          business_id?: string | null
          content?: string
          created_at?: string
          customer_address?: string | null
          customer_business_name?: string | null
          customer_city?: string | null
          customer_name?: string | null
          customer_nickname?: string | null
          customer_phone?: string | null
          customer_zipcode?: string | null
          deleted_at?: string | null
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
        ]
      }
      security_audit_log: {
        Row: {
          created_at: string
          event_description: string
          event_type: string
          id: string
          ip_address: string | null
          metadata: Json | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_description: string
          event_type: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_description?: string
          event_type?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          stripe_customer_id: string | null
          subscribed: boolean
          subscription_end: string | null
          subscription_tier: string | null
          updated_at: string
          user_id: string | null
          user_type: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
          user_type?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
          user_type?: string
        }
        Relationships: []
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
      user_review_notifications: {
        Row: {
          id: string
          review_id: string | null
          shown_at: string | null
          user_id: string | null
        }
        Insert: {
          id?: string
          review_id?: string | null
          shown_at?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          review_id?: string | null
          shown_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_review_notifications_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      user_sessions: {
        Row: {
          created_at: string | null
          id: string
          last_login: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_login?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          last_login?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      verification_codes: {
        Row: {
          attempt_count: number | null
          code: string
          created_at: string
          email: string | null
          expires_at: string
          id: string
          max_attempts: number | null
          phone: string | null
          verification_type: string
        }
        Insert: {
          attempt_count?: number | null
          code: string
          created_at?: string
          email?: string | null
          expires_at: string
          id?: string
          max_attempts?: number | null
          phone?: string | null
          verification_type?: string
        }
        Update: {
          attempt_count?: number | null
          code?: string
          created_at?: string
          email?: string | null
          expires_at?: string
          id?: string
          max_attempts?: number | null
          phone?: string | null
          verification_type?: string
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
      add_conversation_message: {
        Args: {
          p_review_id: string
          p_author_id: string
          p_author_type: string
          p_content: string
        }
        Returns: string
      }
      check_rate_limit: {
        Args: {
          p_identifier: string
          p_attempt_type: string
          p_max_attempts?: number
          p_window_minutes?: number
          p_block_minutes?: number
        }
        Returns: boolean
      }
      check_rate_limit_with_lockout: {
        Args: {
          p_identifier: string
          p_attempt_type: string
          p_max_attempts?: number
          p_window_minutes?: number
          p_block_minutes?: number
          p_lockout_attempts?: number
          p_lockout_duration_minutes?: number
        }
        Returns: boolean
      }
      claim_review: {
        Args: {
          p_review_id: string
          p_claimed_by: string
          p_claim_type: string
          p_credit_transaction_id?: string
        }
        Returns: boolean
      }
      claim_review_via_conversation: {
        Args: { p_review_id: string; p_customer_id: string; p_content: string }
        Returns: string
      }
      get_user_role: {
        Args: { user_id: string }
        Returns: string
      }
      log_security_event: {
        Args: {
          p_user_id: string
          p_event_type: string
          p_event_description: string
          p_ip_address?: string
          p_user_agent?: string
          p_metadata?: Json
        }
        Returns: undefined
      }
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
      validate_verification_code: {
        Args: { p_code: string; p_identifier: string; p_type?: string }
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

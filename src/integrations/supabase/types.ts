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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
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
      business_customer_pool: {
        Row: {
          business_id: string
          created_at: string | null
          customer_email: string | null
          customer_id: string
          customer_name: string | null
          id: string
          review_id: string | null
          review_rating: number | null
          source: string
          updated_at: string | null
        }
        Insert: {
          business_id: string
          created_at?: string | null
          customer_email?: string | null
          customer_id: string
          customer_name?: string | null
          id?: string
          review_id?: string | null
          review_rating?: number | null
          source: string
          updated_at?: string | null
        }
        Update: {
          business_id?: string
          created_at?: string | null
          customer_email?: string | null
          customer_id?: string
          customer_name?: string | null
          id?: string
          review_id?: string | null
          review_rating?: number | null
          source?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_customer_pool_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_customer_pool_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_customer_pool_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
        ]
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
      campaign_recipients: {
        Row: {
          campaign_id: string
          created_at: string | null
          customer_email: string
          customer_id: string
          error_message: string | null
          id: string
          sent_at: string | null
          status: string
        }
        Insert: {
          campaign_id: string
          created_at?: string | null
          customer_email: string
          customer_id: string
          error_message?: string | null
          id?: string
          sent_at?: string | null
          status?: string
        }
        Update: {
          campaign_id?: string
          created_at?: string | null
          customer_email?: string
          customer_id?: string
          error_message?: string | null
          id?: string
          sent_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_recipients_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "promotional_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_recipients_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
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
      email_entitlements: {
        Row: {
          claimed_at: string | null
          claimed_by: string | null
          credit_balance: number | null
          email: string
          is_legacy_member: boolean | null
          original_user_id: string | null
          preserved_at: string | null
          subscription_type: string | null
        }
        Insert: {
          claimed_at?: string | null
          claimed_by?: string | null
          credit_balance?: number | null
          email: string
          is_legacy_member?: boolean | null
          original_user_id?: string | null
          preserved_at?: string | null
          subscription_type?: string | null
        }
        Update: {
          claimed_at?: string | null
          claimed_by?: string | null
          credit_balance?: number | null
          email?: string
          is_legacy_member?: boolean | null
          original_user_id?: string | null
          preserved_at?: string | null
          subscription_type?: string | null
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
      magic_links: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          redirect_path: string
          token: string
          used_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          redirect_path?: string
          token: string
          used_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          redirect_path?: string
          token?: string
          used_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      nice_list_history: {
        Row: {
          appeared_at: string | null
          average_rating: number | null
          customer_id: string
          id: string
          ranking: number | null
          review_count: number | null
          zipcode_context: string | null
          zoom_level: string
        }
        Insert: {
          appeared_at?: string | null
          average_rating?: number | null
          customer_id: string
          id?: string
          ranking?: number | null
          review_count?: number | null
          zipcode_context?: string | null
          zoom_level: string
        }
        Update: {
          appeared_at?: string | null
          average_rating?: number | null
          customer_id?: string
          id?: string
          ranking?: number | null
          review_count?: number | null
          zipcode_context?: string | null
          zoom_level?: string
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          allow_claimed_business_promotions: boolean
          allow_yitch_promotions: boolean
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
          allow_claimed_business_promotions?: boolean
          allow_yitch_promotions?: boolean
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
          allow_claimed_business_promotions?: boolean
          allow_yitch_promotions?: boolean
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
      customer_promotion_preferences: {
        Row: {
          allow_all_promotions: boolean
          allow_claimed_business_promotions: boolean
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          allow_all_promotions?: boolean
          allow_claimed_business_promotions?: boolean
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          allow_all_promotions?: boolean
          allow_claimed_business_promotions?: boolean
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_promotion_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      yitch_promotion_log: {
        Row: {
          business_id: string
          campaign_id: string | null
          created_at: string
          id: string
          location_filter: Json | null
          max_rating: number | null
          min_rating: number | null
          recipient_count: number | null
          sent_at: string
          target_type: string
        }
        Insert: {
          business_id: string
          campaign_id?: string | null
          created_at?: string
          id?: string
          location_filter?: Json | null
          max_rating?: number | null
          min_rating?: number | null
          recipient_count?: number | null
          sent_at?: string
          target_type: string
        }
        Update: {
          business_id?: string
          campaign_id?: string | null
          created_at?: string
          id?: string
          location_filter?: Json | null
          max_rating?: number | null
          min_rating?: number | null
          recipient_count?: number | null
          sent_at?: string
          target_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "yitch_promotion_log_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "yitch_promotion_log_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "promotional_campaigns"
            referencedColumns: ["id"]
          },
        ]
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
          is_legacy_member: boolean | null
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
          is_legacy_member?: boolean | null
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
          is_legacy_member?: boolean | null
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
      promotional_campaigns: {
        Row: {
          business_id: string
          campaign_name: string
          created_at: string | null
          email_content: string
          id: string
          image_urls: string[] | null
          location_filter: Json | null
          max_rating: number
          min_rating: number
          scheduled_at: string | null
          sent_at: string | null
          sent_count: number | null
          status: string
          subject_line: string
          target_count: number | null
          target_type: string | null
          updated_at: string | null
        }
        Insert: {
          business_id: string
          campaign_name: string
          created_at?: string | null
          email_content: string
          id?: string
          image_urls?: string[] | null
          location_filter?: Json | null
          max_rating?: number
          min_rating?: number
          scheduled_at?: string | null
          sent_at?: string | null
          sent_count?: number | null
          status?: string
          subject_line: string
          target_count?: number | null
          target_type?: string | null
          updated_at?: string | null
        }
        Update: {
          business_id?: string
          campaign_name?: string
          created_at?: string | null
          email_content?: string
          id?: string
          image_urls?: string[] | null
          location_filter?: Json | null
          max_rating?: number
          min_rating?: number
          scheduled_at?: string | null
          sent_at?: string | null
          sent_count?: number | null
          status?: string
          subject_line?: string
          target_count?: number | null
          target_type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "promotional_campaigns_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      promotional_offer_limits: {
        Row: {
          business_id: string
          created_at: string | null
          id: string
          offers_used: number
          updated_at: string | null
          window_start: string
        }
        Insert: {
          business_id: string
          created_at?: string | null
          id?: string
          offers_used?: number
          updated_at?: string | null
          window_start?: string
        }
        Update: {
          business_id?: string
          created_at?: string | null
          id?: string
          offers_used?: number
          updated_at?: string | null
          window_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "promotional_offer_limits_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
      review_requests: {
        Row: {
          business_email: string
          business_id: string | null
          business_name: string | null
          created_at: string | null
          customer_id: string
          id: string
          sent_at: string | null
          updated_at: string | null
        }
        Insert: {
          business_email: string
          business_id?: string | null
          business_name?: string | null
          created_at?: string | null
          customer_id: string
          id?: string
          sent_at?: string | null
          updated_at?: string | null
        }
        Update: {
          business_email?: string
          business_id?: string | null
          business_name?: string | null
          created_at?: string | null
          customer_id?: string
          id?: string
          sent_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "review_requests_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_requests_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      review_views: {
        Row: {
          id: string
          review_id: string
          view_context: string
          viewed_at: string | null
          viewer_id: string
        }
        Insert: {
          id?: string
          review_id: string
          view_context: string
          viewed_at?: string | null
          viewer_id: string
        }
        Update: {
          id?: string
          review_id?: string
          view_context?: string
          viewed_at?: string | null
          viewer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_views_review_id_fkey"
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
          customer_state: string | null
          customer_zipcode: string | null
          deleted_at: string | null
          id: string
          is_anonymous: boolean
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
          customer_state?: string | null
          customer_zipcode?: string | null
          deleted_at?: string | null
          id?: string
          is_anonymous?: boolean
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
          customer_state?: string | null
          customer_zipcode?: string | null
          deleted_at?: string | null
          id?: string
          is_anonymous?: boolean
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
      user_badges: {
        Row: {
          badge_type: string
          criteria_met_at: string | null
          earned_at: string | null
          id: string
          metadata: Json | null
          user_id: string
        }
        Insert: {
          badge_type: string
          criteria_met_at?: string | null
          earned_at?: string | null
          id?: string
          metadata?: Json | null
          user_id: string
        }
        Update: {
          badge_type?: string
          criteria_met_at?: string | null
          earned_at?: string | null
          id?: string
          metadata?: Json | null
          user_id?: string
        }
        Relationships: []
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
      yitch_rewards: {
        Row: {
          awarded_at: string | null
          business_id: string
          credit_transaction_id: string | null
          id: string
          milestone_reached: number
          reward_type: string
          reward_value: number
          total_views_at_milestone: number
        }
        Insert: {
          awarded_at?: string | null
          business_id: string
          credit_transaction_id?: string | null
          id?: string
          milestone_reached: number
          reward_type: string
          reward_value?: number
          total_views_at_milestone: number
        }
        Update: {
          awarded_at?: string | null
          business_id?: string
          credit_transaction_id?: string | null
          id?: string
          milestone_reached?: number
          reward_type?: string
          reward_value?: number
          total_views_at_milestone?: number
        }
        Relationships: [
          {
            foreignKeyName: "yitch_rewards_credit_transaction_id_fkey"
            columns: ["credit_transaction_id"]
            isOneToOne: false
            referencedRelation: "credit_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_conversation_message: {
        Args: {
          p_author_id: string
          p_author_type: string
          p_content: string
          p_review_id: string
        }
        Returns: string
      }
      check_active_reviewer_badge: {
        Args: { p_user_id: string }
        Returns: boolean
      }
      check_all_badges: {
        Args: { p_user_id: string; p_user_type: string }
        Returns: undefined
      }
      check_and_award_yitch_rewards: {
        Args: { p_business_id: string }
        Returns: Json
      }
      check_community_pillar_badge: {
        Args: { p_user_id: string }
        Returns: boolean
      }
      check_engaged_badge: { Args: { p_user_id: string }; Returns: boolean }
      check_guardian_badge: { Args: { p_user_id: string }; Returns: boolean }
      check_honor_badge: { Args: { p_user_id: string }; Returns: boolean }
      check_nice_list_veteran_badge: {
        Args: { p_user_id: string }
        Returns: boolean
      }
      check_rate_limit: {
        Args: {
          p_attempt_type: string
          p_block_minutes?: number
          p_identifier: string
          p_max_attempts?: number
          p_window_minutes?: number
        }
        Returns: boolean
      }
      check_rate_limit_with_lockout: {
        Args: {
          p_attempt_type: string
          p_block_minutes?: number
          p_identifier: string
          p_lockout_attempts?: number
          p_lockout_duration_minutes?: number
          p_max_attempts?: number
          p_window_minutes?: number
        }
        Returns: boolean
      }
      check_watchdog_badge: { Args: { p_user_id: string }; Returns: boolean }
      claim_review: {
        Args: {
          p_claim_type: string
          p_claimed_by: string
          p_credit_transaction_id?: string
          p_review_id: string
        }
        Returns: boolean
      }
      claim_review_via_conversation: {
        Args: { p_content: string; p_customer_id: string; p_review_id: string }
        Returns: string
      }
      extract_negative_quip: {
        Args: { review_content: string }
        Returns: string
      }
      extract_positive_quip: {
        Args: { review_content: string }
        Returns: string
      }
      get_user_badges: {
        Args: { p_user_id: string }
        Returns: {
          badge_type: string
          earned_at: string
          metadata: Json
        }[]
      }
      get_user_role: { Args: { user_id: string }; Returns: string }
      get_yitch_list: { Args: never; Returns: Json }
      get_yitch_list_by_location: {
        Args: { p_user_zipcode?: string; p_zoom_level?: string }
        Returns: Json
      }
      log_security_event: {
        Args: {
          p_event_description: string
          p_event_type: string
          p_ip_address?: string
          p_metadata?: Json
          p_user_agent?: string
          p_user_id: string
        }
        Returns: undefined
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      update_user_credits: {
        Args: {
          p_amount: number
          p_description?: string
          p_stripe_session_id?: string
          p_type: string
          p_user_id: string
        }
        Returns: undefined
      }
      validate_verification_code: {
        Args: { p_code: string; p_identifier: string; p_type?: string }
        Returns: boolean
      }
      verify_customer_on_interaction: {
        Args: { p_customer_id: string }
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
  storage: {
    Tables: {
      buckets: {
        Row: {
          allowed_mime_types: string[] | null
          avif_autodetection: boolean | null
          created_at: string | null
          file_size_limit: number | null
          id: string
          name: string
          owner: string | null
          owner_id: string | null
          public: boolean | null
          type: Database["storage"]["Enums"]["buckettype"]
          updated_at: string | null
        }
        Insert: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id: string
          name: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string | null
        }
        Update: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id?: string
          name?: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string | null
        }
        Relationships: []
      }
      buckets_analytics: {
        Row: {
          created_at: string
          deleted_at: string | null
          format: string
          id: string
          name: string
          type: Database["storage"]["Enums"]["buckettype"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          format?: string
          id?: string
          name: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          format?: string
          id?: string
          name?: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Relationships: []
      }
      buckets_vectors: {
        Row: {
          created_at: string
          id: string
          type: Database["storage"]["Enums"]["buckettype"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Relationships: []
      }
      migrations: {
        Row: {
          executed_at: string | null
          hash: string
          id: number
          name: string
        }
        Insert: {
          executed_at?: string | null
          hash: string
          id: number
          name: string
        }
        Update: {
          executed_at?: string | null
          hash?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      objects: {
        Row: {
          bucket_id: string | null
          created_at: string | null
          id: string
          last_accessed_at: string | null
          level: number | null
          metadata: Json | null
          name: string | null
          owner: string | null
          owner_id: string | null
          path_tokens: string[] | null
          updated_at: string | null
          user_metadata: Json | null
          version: string | null
        }
        Insert: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          level?: number | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          user_metadata?: Json | null
          version?: string | null
        }
        Update: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          level?: number | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          user_metadata?: Json | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "objects_bucketId_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      prefixes: {
        Row: {
          bucket_id: string
          created_at: string | null
          level: number
          name: string
          updated_at: string | null
        }
        Insert: {
          bucket_id: string
          created_at?: string | null
          level?: number
          name: string
          updated_at?: string | null
        }
        Update: {
          bucket_id?: string
          created_at?: string | null
          level?: number
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prefixes_bucketId_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      s3_multipart_uploads: {
        Row: {
          bucket_id: string
          created_at: string
          id: string
          in_progress_size: number
          key: string
          owner_id: string | null
          upload_signature: string
          user_metadata: Json | null
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          id: string
          in_progress_size?: number
          key: string
          owner_id?: string | null
          upload_signature: string
          user_metadata?: Json | null
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          id?: string
          in_progress_size?: number
          key?: string
          owner_id?: string | null
          upload_signature?: string
          user_metadata?: Json | null
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      s3_multipart_uploads_parts: {
        Row: {
          bucket_id: string
          created_at: string
          etag: string
          id: string
          key: string
          owner_id: string | null
          part_number: number
          size: number
          upload_id: string
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          etag: string
          id?: string
          key: string
          owner_id?: string | null
          part_number: number
          size?: number
          upload_id: string
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          etag?: string
          id?: string
          key?: string
          owner_id?: string | null
          part_number?: number
          size?: number
          upload_id?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_parts_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "s3_multipart_uploads_parts_upload_id_fkey"
            columns: ["upload_id"]
            isOneToOne: false
            referencedRelation: "s3_multipart_uploads"
            referencedColumns: ["id"]
          },
        ]
      }
      vector_indexes: {
        Row: {
          bucket_id: string
          created_at: string
          data_type: string
          dimension: number
          distance_metric: string
          id: string
          metadata_configuration: Json | null
          name: string
          updated_at: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          data_type: string
          dimension: number
          distance_metric: string
          id?: string
          metadata_configuration?: Json | null
          name: string
          updated_at?: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          data_type?: string
          dimension?: number
          distance_metric?: string
          id?: string
          metadata_configuration?: Json | null
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "vector_indexes_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets_vectors"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_prefixes: {
        Args: { _bucket_id: string; _name: string }
        Returns: undefined
      }
      can_insert_object: {
        Args: { bucketid: string; metadata: Json; name: string; owner: string }
        Returns: undefined
      }
      delete_leaf_prefixes: {
        Args: { bucket_ids: string[]; names: string[] }
        Returns: undefined
      }
      delete_prefix: {
        Args: { _bucket_id: string; _name: string }
        Returns: boolean
      }
      extension: { Args: { name: string }; Returns: string }
      filename: { Args: { name: string }; Returns: string }
      foldername: { Args: { name: string }; Returns: string[] }
      get_level: { Args: { name: string }; Returns: number }
      get_prefix: { Args: { name: string }; Returns: string }
      get_prefixes: { Args: { name: string }; Returns: string[] }
      get_size_by_bucket: {
        Args: never
        Returns: {
          bucket_id: string
          size: number
        }[]
      }
      list_multipart_uploads_with_delimiter: {
        Args: {
          bucket_id: string
          delimiter_param: string
          max_keys?: number
          next_key_token?: string
          next_upload_token?: string
          prefix_param: string
        }
        Returns: {
          created_at: string
          id: string
          key: string
        }[]
      }
      list_objects_with_delimiter: {
        Args: {
          bucket_id: string
          delimiter_param: string
          max_keys?: number
          next_token?: string
          prefix_param: string
          start_after?: string
        }
        Returns: {
          id: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
      lock_top_prefixes: {
        Args: { bucket_ids: string[]; names: string[] }
        Returns: undefined
      }
      operation: { Args: never; Returns: string }
      search: {
        Args: {
          bucketname: string
          levels?: number
          limits?: number
          offsets?: number
          prefix: string
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          created_at: string
          id: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
      search_legacy_v1: {
        Args: {
          bucketname: string
          levels?: number
          limits?: number
          offsets?: number
          prefix: string
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          created_at: string
          id: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
      search_v1_optimised: {
        Args: {
          bucketname: string
          levels?: number
          limits?: number
          offsets?: number
          prefix: string
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          created_at: string
          id: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
      search_v2: {
        Args: {
          bucket_name: string
          levels?: number
          limits?: number
          prefix: string
          sort_column?: string
          sort_column_after?: string
          sort_order?: string
          start_after?: string
        }
        Returns: {
          created_at: string
          id: string
          key: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
    }
    Enums: {
      buckettype: "STANDARD" | "ANALYTICS" | "VECTOR"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
  storage: {
    Enums: {
      buckettype: ["STANDARD", "ANALYTICS", "VECTOR"],
    },
  },
} as const

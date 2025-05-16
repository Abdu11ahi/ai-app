export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type FeedbackType = 'well' | 'didnt' | 'suggestion' | 'blocker';
export type ReactionType = 'thumbsup' | 'thumbsdown';
export type SentimentScore = 'positive' | 'negative' | 'neutral';

export interface Database {
  public: {
    Tables: {
      retrospectives: {
        Row: {
          id: string
          created_at: string
          sprint_number: number
          sprint_name: string | null
          team_name: string
          user_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          sprint_number: number
          sprint_name?: string | null
          team_name: string
          user_id: string
        }
        Update: {
          id?: string
          created_at?: string
          sprint_number?: number
          sprint_name?: string | null
          team_name?: string
          user_id?: string
        }
      }
      feedback: {
        Row: {
          id: string
          user_id: string
          retro_id: string
          type: FeedbackType
          message: string
          anonymous: boolean
          created_at: string
          sentiment?: SentimentScore | null
        }
        Insert: {
          id?: string
          user_id: string
          retro_id: string
          type: FeedbackType
          message: string
          anonymous: boolean
          created_at?: string
          sentiment?: SentimentScore | null
        }
        Update: {
          id?: string
          user_id?: string
          retro_id?: string
          type?: FeedbackType
          message?: string
          anonymous?: boolean
          created_at?: string
          sentiment?: SentimentScore | null
        }
      }
      feedback_reactions: {
        Row: {
          id: string
          feedback_id: string
          user_id: string
          reaction_type: ReactionType
          created_at: string
        }
        Insert: {
          id?: string
          feedback_id: string
          user_id: string
          reaction_type: ReactionType
          created_at?: string
        }
        Update: {
          id?: string
          feedback_id?: string
          user_id?: string
          reaction_type?: ReactionType
          created_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
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
  }
}

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type FeedbackType = 'well' | 'didnt' | 'suggestion' | 'blocker';

export interface Database {
  public: {
    Tables: {
      retrospectives: {
        Row: {
          id: string
          created_at: string
          sprint_number: number
          team_name: string
          user_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          sprint_number: number
          team_name: string
          user_id: string
        }
        Update: {
          id?: string
          created_at?: string
          sprint_number?: number
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
        }
        Insert: {
          id?: string
          user_id: string
          retro_id: string
          type: FeedbackType
          message: string
          anonymous: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          retro_id?: string
          type?: FeedbackType
          message?: string
          anonymous?: boolean
          created_at?: string
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

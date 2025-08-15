

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Course, SkillLevel } from '../types';

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      assessments: {
        Row: {
          created_at: string
          id: number
          score: number
          skill_level: SkillLevel
          topic: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: number
          score: number
          skill_level: SkillLevel
          topic: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: number
          score?: number
          skill_level?: SkillLevel
          topic?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "assessments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      courses: {
        Row: {
          course_data: Json
          id: number
          title: string
        }
        Insert: {
          course_data: Json
          id?: number
          title: string
        }
        Update: {
          course_data?: Json
          id?: number
          title?: string
        }
        Relationships: []
      }
      leaderboard: {
        Row: {
          course_id: number
          id: number
          score: number
          timestamp: string
          user_id: string
        }
        Insert: {
          course_id: number
          id?: number
          score: number
          timestamp?: string
          user_id: string
        }
        Update: {
          course_id?: number
          id?: number
          score?: number
          timestamp?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "leaderboard_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: true
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leaderboard_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          id: string
          role: "user" | "admin"
          updated_at: string
          username: string
        }
        Insert: {
          id: string
          role?: "user" | "admin"
          updated_at?: string
          username: string
        }
        Update: {
          id?: string
          role?: "user" | "admin"
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      quiz_attempts: {
        Row: {
          attempted_at: string
          course_id: number
          id: number
          module_title: string
          passed: boolean
          score: number
          user_id: string
        }
        Insert: {
          attempted_at?: string
          course_id: number
          id?: number
          module_title: string
          passed: boolean
          score: number
          user_id: string
        }
        Update: {
          attempted_at?: string
          course_id?: number
          id?: number
          module_title?: string
          passed?: boolean
          score?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_attempts_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: true
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_attempts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      user_progress: {
        Row: {
          course_id: number
          completed_lessons: string[] | null
          last_updated_at: string
          skill_level: SkillLevel | null
          unlocked_modules: number[]
          user_id: string
        }
        Insert: {
          course_id: number
          completed_lessons?: string[] | null
          last_updated_at?: string
          skill_level?: SkillLevel | null
          unlocked_modules: number[]
          user_id: string
        }
        Update: {
          course_id?: number
          completed_lessons?: string[] | null
          last_updated_at?: string
          skill_level?: SkillLevel | null
          unlocked_modules?: number[]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_progress_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: true
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_course_and_get_id: {
        Args: {
          p_course_data: Json
          p_course_title: string
        }
        Returns: number
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

let supabaseInstance: SupabaseClient<Database> | null = null;

export const getSupabaseClient = (): SupabaseClient<Database> => {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  const env = (globalThis as any).process?.env;
  const supabaseUrl = env?.SUPABASE_URL;
  const supabaseAnonKey = env?.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase URL and Anon Key must be provided in environment variables.");
  }

  supabaseInstance = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
    }
  });
  return supabaseInstance;
};

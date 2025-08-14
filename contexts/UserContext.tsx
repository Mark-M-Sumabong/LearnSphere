import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User, Profile } from '../types';
import { getSupabaseClient } from '../services/supabaseClient';
import type { Session, User as SupabaseUser } from '@supabase/supabase-js';

interface UserContextType {
  currentUser: User | null;
  logout: () => Promise<void>;
  isLoading: boolean;
  configError: string | null;
}

export const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [configError, setConfigError] = useState<string | null>(null);

  useEffect(() => {
    const initialize = async () => {
      try {
        const supabase = getSupabaseClient();

        const fetchUserAndProfile = async (supabaseUser: SupabaseUser | null): Promise<User | null> => {
            if (!supabaseUser) return null;
    
            const { data: profile, error } = await supabase
                .from('profiles')
                .select('username, role, updated_at') // Explicitly select fields to match Profile type
                .eq('id', supabaseUser.id)
                .maybeSingle(); // Use maybeSingle() to prevent error if profile is not yet created
            
            if (error) {
                console.error("Error fetching profile:", error);
                // Return a user without a profile if the fetch fails
                return {
                    id: supabaseUser.id,
                    email: supabaseUser.email,
                    profile: null,
                };
            }
            
            return {
                id: supabaseUser.id,
                email: supabaseUser.email,
                profile: profile as any as Profile | null,
            };
        };
    
        // Check for an active session on initial load using the v2 API.
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        const initialUser = await fetchUserAndProfile(initialSession?.user || null);
        setCurrentUser(initialUser);
        
        // Once the initial user is determined, the initial auth loading is complete.
        setIsLoading(false);
        
        // Listen for subsequent auth state changes (login, logout, token refresh).
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (_event, session) => {
            const user = await fetchUserAndProfile(session?.user || null);
            setCurrentUser(user);
          }
        );
    
        return () => {
          subscription?.unsubscribe();
        };

      } catch (e: any) {
        console.error("Configuration error:", e);
        setConfigError(e.message);
        setIsLoading(false);
      }
    };

    initialize();
  }, []);

  const logout = async () => {
    try {
        const supabase = getSupabaseClient();
        // Clear session state from localStorage before signing out
        if (currentUser?.id) {
            localStorage.removeItem(`learnsphere-session-${currentUser.id}`);
        }
        await supabase.auth.signOut();
        setCurrentUser(null);
    } catch (e) {
        console.error("Could not log out due to configuration error:", e);
        // If config is broken, we can at least clear the local state
        if (currentUser?.id) {
            localStorage.removeItem(`learnsphere-session-${currentUser.id}`);
        }
        setCurrentUser(null);
    }
  };

  return (
    <UserContext.Provider value={{ currentUser, logout, isLoading, configError }}>
      {children}
    </UserContext.Provider>
  );
};
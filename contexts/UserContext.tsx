import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User, Profile } from '../types';
import { getSupabaseClient } from '../services/supabaseClient';
import type { Session, User as SupabaseUser, AuthChangeEvent } from '@supabase/supabase-js';

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
                .select('*') // Fetch all columns to be more robust against RLS policies
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
    
        // Perform the initial session check to establish the user's state.
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        const initialUser = await fetchUserAndProfile(initialSession?.user || null);
        setCurrentUser(initialUser);
        
        // Once the initial user is determined, the initial auth loading is complete.
        setIsLoading(false);
        
        // Listen for subsequent auth state changes (login, logout, token refresh).
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (_event: AuthChangeEvent, session: Session | null) => {
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
    // Capture user ID before any async operations or state changes
    const userId = currentUser?.id;

    try {
      const supabase = getSupabaseClient();

      // Sign out from Supabase first
      const { error } = await supabase.auth.signOut();

      if (error) {
        // We should still try to log the user out of the UI
        console.error("Error signing out from Supabase:", error);
      }
    } catch (e) {
      // This would catch errors from getSupabaseClient()
      console.error("Could not log out due to configuration error:", e);
    } finally {
      // This block will always run, ensuring the UI is updated regardless of signOut success
      if (userId) {
        localStorage.removeItem(`learnsphere-session-${userId}`);
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

import { useState, useEffect } from 'react'
import { supabase } from '../services/supabase'
import { User } from '@supabase/supabase-js'
import { EXPO_PUBLIC_API_URL } from '@env'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for changes on auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string, p0: { first_name: string; last_name: string; phone: string }) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    })
    return { error }
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { error }
  }

  const signOut = () => supabase.auth.signOut()

  interface UpdateProfileParams {
    first_name?: string;
    last_name?: string;
    email?: string;
    addresses?: any[];
  }

  const updateProfile = async ({ first_name, last_name, email }: UpdateProfileParams) => {
    const { error } = await supabase.auth.updateUser({
      email,
      data: { 
        first_name,
        last_name
      }
    });
    
    if (error) throw error;
    return { error: null };
  };

  return {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    isAuthenticated: !!user,
    verifyOtp: async (email: string, code: string) => {
      try {
        const response = await fetch(`${EXPO_PUBLIC_API_URL}/api/auth/verify-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, code }),
        });
        const data = await response.json();
        return { error: data.error };
      } catch (error) {
        return { error: { message: 'Failed to verify OTP' } };
      }
    },
  }
}
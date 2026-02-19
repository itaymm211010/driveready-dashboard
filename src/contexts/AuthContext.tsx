import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface Teacher {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  parent_teacher_id: string | null;
  is_admin: boolean;
}

interface AuthContextType {
  currentUser: User | null;
  teacherProfile: Teacher | null;
  rootTeacherId: string | null;
  isSubstitute: boolean;
  isAdmin: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [teacherProfile, setTeacherProfile] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadTeacherProfile(user: User) {
    const { data } = await supabase
      .from('teachers')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();
    setTeacherProfile(data ?? null);
  }

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCurrentUser(session?.user ?? null);
      if (session?.user) {
        loadTeacherProfile(session.user).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user ?? null);
      if (session?.user) {
        loadTeacherProfile(session.user).catch(console.error);
      } else {
        setTeacherProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const isAdmin = !!teacherProfile?.is_admin;
  const rootTeacherId = isAdmin ? null : (teacherProfile?.parent_teacher_id ?? teacherProfile?.id ?? null);
  const isSubstitute = !isAdmin && !!teacherProfile?.parent_teacher_id;

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  return (
    <AuthContext.Provider value={{ currentUser, teacherProfile, rootTeacherId, isSubstitute, isAdmin, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider');
  return ctx;
}

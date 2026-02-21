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
  /** When admin is viewing a teacher's data — their ID */
  viewingAsTeacherId: string | null;
  /** When admin is viewing a teacher's data — their name */
  viewingAsTeacherName: string | null;
  setViewingAs: (id: string | null, name: string | null) => void;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [teacherProfile, setTeacherProfile] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewingAsTeacherId, setViewingAsTeacherId] = useState<string | null>(null);
  const [viewingAsTeacherName, setViewingAsTeacherName] = useState<string | null>(null);

  async function loadTeacherProfile(user: User) {
    const { data } = await supabase
      .from('teachers')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();
    setTeacherProfile(data ?? null);
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCurrentUser(session?.user ?? null);
      if (session?.user) {
        loadTeacherProfile(session.user).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user ?? null);
      if (session?.user) {
        loadTeacherProfile(session.user).catch(console.error);
      } else {
        setTeacherProfile(null);
        setViewingAsTeacherId(null);
        setViewingAsTeacherName(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const isAdmin = !!teacherProfile?.is_admin;
  const isSubstitute = !isAdmin && !!teacherProfile?.parent_teacher_id;

  // When admin is viewing a teacher: use that teacher's ID as rootTeacherId
  const rootTeacherId = isAdmin
    ? (viewingAsTeacherId ?? null)
    : (teacherProfile?.parent_teacher_id ?? teacherProfile?.id ?? null);

  function setViewingAs(id: string | null, name: string | null) {
    setViewingAsTeacherId(id);
    setViewingAsTeacherName(name);
  }

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  return (
    <AuthContext.Provider value={{
      currentUser, teacherProfile, rootTeacherId,
      isSubstitute, isAdmin, loading,
      viewingAsTeacherId, viewingAsTeacherName, setViewingAs,
      signIn, signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider');
  return ctx;
}

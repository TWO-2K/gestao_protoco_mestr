import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

const AuthContext = createContext(undefined);

async function buscarPerfil(userId) {
  if (!userId) return null;
  const { data } = await supabase.from('perfis').select('id, nome_completo, papel').eq('id', userId).single();
  return data;
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session);
      setPerfil(await buscarPerfil(data.session?.user?.id));
      setLoading(false);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      buscarPerfil(newSession?.user?.id).then(setPerfil);
    });

    return () => subscription.subscription.unsubscribe();
  }, []);

  const signIn = ({ email, password }) => supabase.auth.signInWithPassword({ email, password });

  const signOut = () => supabase.auth.signOut();

  const isAdmin = perfil?.papel === 'admin';

  return (
    <AuthContext.Provider value={{ session, user: session?.user ?? null, perfil, isAdmin, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}

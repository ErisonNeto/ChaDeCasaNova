import { useEffect, useState } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import type { Session } from '@supabase/supabase-js';
import { AnimatePresence } from 'framer-motion';
import { isSupabaseConfigured, supabase } from './lib/supabase';
import { LoadingScreen } from './components/LoadingScreen';
import { LandingPage } from './pages/guest/LandingPage';
import { GiftListPage } from './pages/guest/GiftListPage';
import { ConfirmationPage } from './pages/guest/ConfirmationPage';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { DashboardPage } from './pages/admin/DashboardPage';
import { GiftsAdminPage } from './pages/admin/GiftsAdminPage';
import { GuestsAdminPage } from './pages/admin/GuestsAdminPage';
import { EnvSetupPage } from './pages/setup/EnvSetupPage';

function AdminRoute({ children }: { children: JSX.Element }) {
  const [session, setSession] = useState<Session | null | undefined>(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, currentSession) => setSession(currentSession));
    return () => listener.subscription.unsubscribe();
  }, []);

  if (session === undefined) return <LoadingScreen text="Validando acesso administrativo..." />;
  if (!session) return <Navigate to="/admin/login" replace />;
  return children;
}

function PublicAdminRoute({ children }: { children: JSX.Element }) {
  const [session, setSession] = useState<Session | null | undefined>(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
  }, []);

  if (session === undefined) return <LoadingScreen text="Abrindo painel..." />;
  if (session) return <Navigate to="/admin" replace />;
  return children;
}

export default function App() {
  const location = useLocation();

  if (!isSupabaseConfigured) {
    return <EnvSetupPage />;
  }

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/lista" element={<GiftListPage />} />
        <Route path="/confirmacao" element={<ConfirmationPage />} />
        <Route path="/admin/login" element={<PublicAdminRoute><AdminLoginPage /></PublicAdminRoute>} />
        <Route path="/admin" element={<AdminRoute><DashboardPage /></AdminRoute>} />
        <Route path="/admin/presentes" element={<AdminRoute><GiftsAdminPage /></AdminRoute>} />
        <Route path="/admin/convidados" element={<AdminRoute><GuestsAdminPage /></AdminRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

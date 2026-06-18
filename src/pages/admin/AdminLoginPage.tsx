import { FormEvent, useState } from 'react';
import { motion } from 'framer-motion';
import { LockKeyhole, Mail, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { PageShell } from '../../components/PageShell';
import { Button } from '../../components/Button';
import { supabase } from '../../lib/supabase';

export function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function login(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) {
      toast.error('Login inválido. Confira e tente novamente.');
      return;
    }

    toast.success('Bem-vindo ao painel administrativo.');
    navigate('/admin');
  }

  return (
    <PageShell>
      <section className="grid min-h-[calc(100vh-2.5rem)] place-items-center py-6 sm:min-h-[92vh] sm:py-10">
        <motion.form
          onSubmit={login}
          className="premium-card w-full max-w-md p-6 sm:p-9"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <div className="mb-6 grid h-14 w-14 place-items-center rounded-[1.2rem] bg-cocoa text-white shadow-glow sm:mb-7 sm:h-16 sm:w-16 sm:rounded-[1.4rem]">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <p className="premium-label">Administração</p>
          <h1 className="mt-3 font-display text-[2.45rem] leading-tight text-cocoa sm:text-4xl">Painel da lista</h1>
          <p className="mt-3 text-sm leading-6 text-cocoa/60">Entre com o usuário criado no Supabase Auth para administrar presentes e convidados.</p>

          <div className="mt-8 space-y-4">
            <label className="block">
              <span className="premium-label mb-2 block">E-mail</span>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-cocoa/35" />
                <input className="premium-input pl-11" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="admin@email.com" autoComplete="email" />
              </div>
            </label>
            <label className="block">
              <span className="premium-label mb-2 block">Senha</span>
              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-cocoa/35" />
                <input className="premium-input pl-11" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Sua senha" autoComplete="current-password" />
              </div>
            </label>
            <Button type="submit" loading={loading} className="w-full py-4">Entrar no painel</Button>
          </div>
        </motion.form>
      </section>
    </PageShell>
  );
}

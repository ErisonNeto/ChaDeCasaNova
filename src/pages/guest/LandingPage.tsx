import { FormEvent, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Home, KeyRound, LockKeyhole, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { PageShell } from '../../components/PageShell';
import { Button } from '../../components/Button';
import { supabase } from '../../lib/supabase';
import { normalize } from '../../lib/format';
import { saveGuestSession } from '../../lib/session';
import type { AdminSettings } from '../../types/database';

const fallbackSettings: Pick<AdminSettings, 'event_title' | 'welcome_message' | 'couple_name' | 'event_date'> = {
  event_title: 'Chá de Casa Nova',
  welcome_message: 'Escolha com carinho um presente para fazer parte do nosso novo lar.',
  couple_name: 'Jeyse e Erison',
  event_date: '2026-06-14',
};

export function LandingPage() {
  const [credential, setCredential] = useState('');
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState(fallbackSettings);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadSettings() {
      const { data } = await supabase
        .from('admin_settings')
        .select('event_title,welcome_message,couple_name,event_date')
        .limit(1)
        .maybeSingle();
      if (data) setSettings(data);
    }
    loadSettings();
  }, []);

  async function handleAccess(event: FormEvent) {
    event.preventDefault();
    const accessText = normalize(credential);

    if (!accessText) {
      toast.error('Informe seu primeiro nome para acessar a lista.');
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.rpc('authenticate_guest', { p_access_text: accessText });
    setLoading(false);

    if (error || !data || data.length === 0) {
      toast.error('Não encontramos seu convite. Confira o nome e tente novamente.');
      return;
    }

    const guest = data[0];
    saveGuestSession({
      guestId: guest.guest_id,
      fullName: guest.full_name,
      selectedGiftId: guest.selected_gift_id,
      selectedAt: guest.selected_at,
    });

    toast.success(`Bem-vindo(a), ${guest.full_name.split(' ')[0]}!`);
    // Agora cada convidado pode escolher vários presentes, então sempre abrimos a lista completa.
    navigate('/lista');
  }

  return (
    <PageShell>
      <section className="grid min-h-[calc(100vh-2.5rem)] items-center gap-8 py-6 sm:min-h-[92vh] sm:py-10 lg:grid-cols-[1.04fr_.96fr] lg:gap-10">
        <motion.div
          initial={{ opacity: 0, x: -18 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.65, ease: 'easeOut' }}
          className="mx-auto max-w-3xl text-center lg:text-left"
        >
          <div className="mx-auto mb-5 inline-flex max-w-full items-center gap-2 rounded-full border border-gold/25 bg-white/60 px-4 py-2 text-[0.68rem] font-bold uppercase tracking-[0.18em] text-olive shadow-soft backdrop-blur sm:mb-7 sm:text-xs sm:tracking-[0.22em] lg:mx-0">
            <Sparkles className="h-4 w-4 shrink-0 text-gold" />
            <span className="truncate">Lista exclusiva de presentes</span>
          </div>
          <h1 className="break-words font-display text-[clamp(3.7rem,16vw,6.2rem)] font-semibold leading-[.94] tracking-[-0.055em] text-cocoa sm:text-[clamp(5rem,12vw,7rem)] lg:text-[clamp(5.5rem,7.2vw,8rem)]">
            {settings.event_title}
          </h1>
          <p className="mt-4 font-script text-[clamp(2.8rem,10vw,4.8rem)] leading-none text-rose/80 sm:mt-5 lg:text-left">
            {settings.couple_name || 'Jeyse e Erison'}
          </p>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-cocoa/68 sm:mt-7 sm:text-xl sm:leading-8 lg:mx-0">
            {settings.welcome_message}
          </p>
          <div className="mt-7 flex flex-col items-center gap-3 text-sm text-cocoa/60 sm:mt-8 sm:flex-row sm:flex-wrap lg:justify-start">
            <span className="inline-flex max-w-full items-center gap-2 rounded-full bg-white/65 px-4 py-2 shadow-soft">
              <Home className="h-4 w-4 shrink-0 text-olive" />
              <span className="truncate">{settings.couple_name || 'Novo lar'}</span>
            </span>
            {settings.event_date && (
              <span className="inline-flex max-w-full items-center gap-2 rounded-full bg-white/65 px-4 py-2 shadow-soft">
                <Sparkles className="h-4 w-4 shrink-0 text-gold" />
                <span className="truncate">{new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long' }).format(new Date(`${settings.event_date}T12:00:00`))}</span>
              </span>
            )}
          </div>
        </motion.div>

        <motion.div
          className="mx-auto w-full max-w-xl"
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.12, ease: 'easeOut' }}
        >
          <div className="premium-card relative overflow-hidden p-5 sm:p-8 lg:p-10">
            <div className="absolute right-4 top-4 h-20 w-20 rounded-full bg-gold/10 blur-2xl sm:right-6 sm:top-6" />
            <div className="relative">
              <div className="mb-6 grid h-14 w-14 place-items-center rounded-[1.2rem] bg-roseDeep text-white shadow-glow sm:mb-8 sm:h-16 sm:w-16 sm:rounded-[1.4rem]">
                <KeyRound className="h-6 w-6 sm:h-7 sm:w-7" />
              </div>
              <p className="premium-label">Acesso do convidado</p>
              <h2 className="mt-3 font-display text-[2.35rem] leading-tight text-cocoa sm:text-4xl">Entre com seu nome</h2>
              <p className="mt-3 text-sm leading-6 text-cocoa/62">
                Digite apenas seu primeiro nome para acessar a lista de presentes.
              </p>

              <form onSubmit={handleAccess} className="mt-7 space-y-5 sm:mt-8">
                <div>
                  <label htmlFor="credential" className="premium-label mb-2 block">
                    Primeiro nome
                  </label>
                  <input
                    id="credential"
                    className="premium-input"
                    placeholder="Ex.: Regiane"
                    value={credential}
                    onChange={(event) => setCredential(event.target.value)}
                    autoComplete="given-name"
                  />
                </div>
                <Button type="submit" loading={loading} className="w-full py-4 text-base">
                  Acessar lista
                  <ArrowRight className="h-5 w-5 shrink-0" />
                </Button>
              </form>

              <p className="mt-6 flex items-center justify-center gap-2 text-center text-xs font-semibold leading-5 text-cocoa/45">
                <LockKeyhole className="h-3.5 w-3.5 shrink-0" />
                A lista é exclusiva para convidados.
              </p>
            </div>
          </div>
        </motion.div>
      </section>
    </PageShell>
  );
}

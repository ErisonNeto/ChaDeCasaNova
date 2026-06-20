import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, Heart, Home, ListChecks, RotateCcw } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { PageShell } from '../../components/PageShell';
import { Button } from '../../components/Button';
import { LoadingScreen } from '../../components/LoadingScreen';
import { GiftCard } from '../../components/GiftCard';
import { supabase } from '../../lib/supabase';
import { getGuestSession, clearGuestSession, saveGuestSession } from '../../lib/session';
import type { Gift, GuestSession } from '../../types/database';

export function ConfirmationPage() {
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelingGiftId, setCancelingGiftId] = useState<string | null>(null);
  const [currentSession, setCurrentSession] = useState<GuestSession | null>(() => getGuestSession());
  const navigate = useNavigate();

  useEffect(() => {
    const session = getGuestSession();
    if (!session) {
      navigate('/');
      return;
    }
    setCurrentSession(session);
    loadMyGifts(session);
  }, []);

  async function loadMyGifts(sessionToValidate = currentSession) {
    if (!sessionToValidate) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('gifts')
      .select('*')
      .eq('reserved_by_guest_id', sessionToValidate.guestId)
      .order('reserved_at', { ascending: false });
    setLoading(false);

    if (error) {
      toast.error('Não foi possível carregar seus presentes.');
      return;
    }

    const selectedGifts = (data ?? []) as Gift[];
    setGifts(selectedGifts);
    const updatedSession = {
      ...sessionToValidate,
      selectedGiftIds: selectedGifts.map((gift) => gift.id),
      selectedGiftId: selectedGifts[0]?.id ?? null,
      selectedAt: selectedGifts[0]?.reserved_at ?? null,
    };
    saveGuestSession(updatedSession);
    setCurrentSession(updatedSession);
  }

  async function cancelMyChoice(gift: Gift) {
    if (!currentSession?.guestId) return;
    if (!confirm(`Deseja cancelar a escolha de "${gift.name}" e liberar este presente novamente?`)) return;

    setCancelingGiftId(gift.id);
    const { data, error } = await supabase.rpc('cancel_guest_choice', {
      p_guest_id: currentSession.guestId,
      p_gift_id: gift.id,
    });
    setCancelingGiftId(null);

    if (error || !data?.success) {
      toast.error(data?.message ?? 'Não foi possível cancelar sua escolha agora.');
      return;
    }

    toast.success('Escolha cancelada. O presente voltou para a lista.');
    await loadMyGifts(currentSession);
  }

  if (loading) return <LoadingScreen text="Preparando sua confirmação..." />;

  return (
    <PageShell>
      <section className="grid min-h-[calc(100vh-2.5rem)] items-start gap-6 py-6 sm:min-h-[92vh] sm:gap-8 sm:py-10 lg:grid-cols-[.85fr_1.15fr]">
        <motion.div
          className="premium-card relative overflow-hidden p-6 text-center sm:p-10 lg:text-left"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="absolute -right-14 -top-14 h-52 w-52 rounded-full bg-gold/10 blur-3xl" />
          <div className="relative">
            <motion.div
              className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-full bg-sage/15 text-olive shadow-soft sm:mb-7 sm:h-20 sm:w-20 lg:mx-0"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 180, damping: 14 }}
            >
              <Check className="h-8 w-8 sm:h-10 sm:w-10" />
            </motion.div>
            <p className="premium-label">Presentes reservados</p>
            <h1 className="mt-3 break-words font-display text-[2.75rem] leading-[1.02] text-cocoa sm:text-6xl">
              Obrigado por fazer parte do nosso lar.
            </h1>
            <p className="mt-5 text-base leading-7 text-cocoa/65 sm:text-lg sm:leading-8">
              {currentSession?.fullName}, você reservou {gifts.length} {gifts.length === 1 ? 'presente' : 'presentes'}. Você pode continuar vendo a lista, escolher mais itens ou cancelar algum presente.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap lg:justify-start">
              <Link to="/lista" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto">
                  <ListChecks className="h-4 w-4 shrink-0" />
                  Ver lista completa
                </Button>
              </Link>
              <Link to="/" onClick={clearGuestSession} className="w-full sm:w-auto">
                <Button variant="ghost" className="w-full sm:w-auto">
                  <ArrowLeft className="h-4 w-4 shrink-0" />
                  Voltar ao convite
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.65, delay: 0.1 }}>
          {gifts.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2">
              {gifts.map((gift) => (
                <GiftCard
                  key={gift.id}
                  gift={gift}
                  isMine
                  disabled={cancelingGiftId === gift.id}
                  onCancelChoice={cancelMyChoice}
                />
              ))}
            </div>
          ) : (
            <div className="premium-card p-8 text-center sm:p-10">
              <Home className="mx-auto h-12 w-12 text-olive" />
              <h2 className="mt-5 font-display text-3xl leading-tight">Nenhum presente reservado</h2>
              <p className="mt-3 text-cocoa/60">Volte para a lista e escolha um ou mais presentes.</p>
              <Link to="/lista" className="mt-6 inline-flex">
                <Button>
                  <ListChecks className="h-4 w-4" />
                  Escolher presentes
                </Button>
              </Link>
            </div>
          )}
        </motion.div>
      </section>
      <div className="fixed bottom-4 left-1/2 hidden -translate-x-1/2 items-center gap-2 rounded-full bg-white/65 px-4 py-2 text-xs font-bold uppercase tracking-[.18em] text-cocoa/45 shadow-soft backdrop-blur sm:flex">
        <Heart className="h-3.5 w-3.5 text-gold" />
        confirmação elegante e segura
      </div>
    </PageShell>
  );
}

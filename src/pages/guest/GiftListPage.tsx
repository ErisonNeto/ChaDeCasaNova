import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Home, RefreshCcw, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { PageShell } from '../../components/PageShell';
import { LoadingScreen } from '../../components/LoadingScreen';
import { Button } from '../../components/Button';
import { ConfirmModal } from '../../components/ConfirmModal';
import { GiftCard } from '../../components/GiftCard';
import { supabase } from '../../lib/supabase';
import { getGuestSession, saveGuestSession, clearGuestSession } from '../../lib/session';
import type { Gift } from '../../types/database';

export function GiftListPage() {
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGift, setSelectedGift] = useState<Gift | null>(null);
  const [claiming, setClaiming] = useState(false);
  const session = getGuestSession();
  const navigate = useNavigate();

  const myGiftId = session?.selectedGiftId ?? null;
  const availableCount = useMemo(() => gifts.filter((gift) => gift.status === 'available').length, [gifts]);

  useEffect(() => {
    if (!session) {
      navigate('/');
      return;
    }

    if (session.selectedGiftId) {
      navigate('/confirmacao');
      return;
    }

    loadGifts();

    const channel = supabase
      .channel('public:gifts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'gifts' }, () => loadGifts(false))
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function loadGifts(showLoading = true) {
    if (showLoading) setLoading(true);
    const { data, error } = await supabase
      .from('gifts')
      .select('*')
      .order('status', { ascending: true })
      .order('created_at', { ascending: true });
    if (error) toast.error('Não foi possível carregar os presentes.');
    setGifts((data ?? []) as Gift[]);
    if (showLoading) setLoading(false);
  }

  async function claimGift() {
    if (!selectedGift || !session) return;
    setClaiming(true);
    const { data, error } = await supabase.rpc('claim_gift', {
      p_guest_id: session.guestId,
      p_gift_id: selectedGift.id,
    });
    setClaiming(false);

    if (error) {
      toast.error('Não foi possível reservar este presente agora.');
      setSelectedGift(null);
      await loadGifts(false);
      return;
    }

    if (!data?.success) {
      toast.error(data?.message ?? 'Esse presente acabou de ser escolhido por outro convidado.');
      setSelectedGift(null);
      await loadGifts(false);
      return;
    }

    saveGuestSession({ ...session, selectedGiftId: selectedGift.id, selectedAt: new Date().toISOString() });
    toast.success('Presente reservado com carinho!');
    navigate('/confirmacao');
  }

  if (loading) return <LoadingScreen />;

  return (
    <PageShell>
      <header className="mb-6 flex flex-col gap-5 rounded-[1.75rem] border border-white/70 bg-white/60 p-4 shadow-soft backdrop-blur-xl sm:mb-8 sm:rounded-[2rem] sm:p-7 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <Link to="/" onClick={clearGuestSession} className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-cocoa/55 hover:text-cocoa">
            <ArrowLeft className="h-4 w-4 shrink-0" />
            trocar convidado
          </Link>
          <p className="premium-label">Olá, {session?.fullName}</p>
          <h1 className="mt-2 break-words font-display text-[2.35rem] leading-tight text-cocoa sm:text-5xl">Escolha um presente especial</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-cocoa/62">
            Cada presente só pode ser escolhido uma vez. Ao confirmar, ele ficará reservado exclusivamente para você.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:flex sm:items-stretch lg:shrink-0">
          <div className="rounded-2xl bg-porcelain px-4 py-3 text-center shadow-soft">
            <p className="font-display text-3xl leading-none text-cocoa">{availableCount}</p>
            <p className="mt-1 text-[0.65rem] font-bold uppercase tracking-[.16em] text-cocoa/45 sm:text-xs sm:tracking-[.18em]">disponíveis</p>
          </div>
          <Button variant="secondary" onClick={() => loadGifts()} className="w-full sm:w-auto">
            <RefreshCcw className="h-4 w-4 shrink-0" />
            Atualizar
          </Button>
        </div>
      </header>

      <AnimatePresence mode="popLayout">
        {gifts.length === 0 ? (
          <motion.div className="premium-card mx-auto max-w-2xl p-8 text-center sm:p-10" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-full bg-champagne text-olive">
              <Home className="h-7 w-7" />
            </div>
            <h2 className="font-display text-3xl leading-tight">A lista ainda está sendo preparada</h2>
            <p className="mt-3 text-cocoa/60">Em breve os presentes aparecerão aqui.</p>
          </motion.div>
        ) : (
          <motion.div className="grid gap-5 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3" initial="hidden" animate="show">
            {gifts.map((gift) => (
              <GiftCard
                key={gift.id}
                gift={gift}
                isMine={myGiftId === gift.id}
                disabled={Boolean(myGiftId)}
                onChoose={setSelectedGift}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mx-auto mt-8 flex max-w-2xl items-center justify-center gap-2 rounded-[1.4rem] bg-white/50 px-5 py-3 text-center text-sm leading-6 text-cocoa/55 shadow-soft backdrop-blur sm:mt-10 sm:rounded-full">
        <Sparkles className="h-4 w-4 shrink-0 text-gold" />
        Obrigado por fazer parte desse momento especial do nosso novo lar.
      </div>

      <ConfirmModal gift={selectedGift} open={Boolean(selectedGift)} loading={claiming} onClose={() => setSelectedGift(null)} onConfirm={claimGift} />
    </PageShell>
  );
}

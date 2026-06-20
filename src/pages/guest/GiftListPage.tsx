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
import type { Gift, GuestSession } from '../../types/database';

export function GiftListPage() {
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGift, setSelectedGift] = useState<Gift | null>(null);
  const [currentSession, setCurrentSession] = useState<GuestSession | null>(() => getGuestSession());
  const [claiming, setClaiming] = useState(false);
  const [cancelingGiftId, setCancelingGiftId] = useState<string | null>(null);
  const navigate = useNavigate();

  const myGiftIds = useMemo(() => {
    if (!currentSession?.guestId) return [];
    return gifts.filter((gift) => gift.reserved_by_guest_id === currentSession.guestId).map((gift) => gift.id);
  }, [gifts, currentSession?.guestId]);

  const myGifts = useMemo(() => gifts.filter((gift) => myGiftIds.includes(gift.id)), [gifts, myGiftIds]);
  const availableCount = useMemo(() => gifts.filter((gift) => gift.status === 'available').length, [gifts]);

  useEffect(() => {
    const savedSession = getGuestSession();
    if (!savedSession) {
      navigate('/');
      return;
    }

    setCurrentSession(savedSession);
    loadGifts(true, savedSession);

    const channel = supabase
      .channel('public:gifts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'gifts' }, () => loadGifts(false, getGuestSession()))
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function loadGifts(showLoading = true, sessionToValidate = currentSession) {
    if (showLoading) setLoading(true);
    const { data, error } = await supabase
      .from('gifts')
      .select('*')
      .order('status', { ascending: true })
      .order('created_at', { ascending: true });

    const nextGifts = (data ?? []) as Gift[];

    if (error) toast.error('Não foi possível carregar os presentes.');
    setGifts(nextGifts);

    if (sessionToValidate) {
      const selectedGiftIds = nextGifts
        .filter((gift) => gift.reserved_by_guest_id === sessionToValidate.guestId)
        .map((gift) => gift.id);
      const updatedSession = {
        ...sessionToValidate,
        selectedGiftIds,
        selectedGiftId: selectedGiftIds[0] ?? null,
        selectedAt: nextGifts.find((gift) => gift.id === selectedGiftIds[0])?.reserved_at ?? null,
      };
      saveGuestSession(updatedSession);
      setCurrentSession(updatedSession);
    }

    if (showLoading) setLoading(false);
  }

  async function claimGift() {
    if (!selectedGift || !currentSession) return;
    setClaiming(true);
    const { data, error } = await supabase.rpc('claim_gift', {
      p_guest_id: currentSession.guestId,
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

    const updatedSession = {
      ...currentSession,
      selectedGiftId: selectedGift.id,
      selectedAt: new Date().toISOString(),
      selectedGiftIds: Array.from(new Set([...(currentSession.selectedGiftIds ?? []), selectedGift.id])),
    };
    saveGuestSession(updatedSession);
    setCurrentSession(updatedSession);
    setSelectedGift(null);
    toast.success('Presente reservado com carinho! Você pode escolher mais itens, se quiser.');
    await loadGifts(false, updatedSession);
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
      await loadGifts(false);
      return;
    }

    const updatedGiftIds = (currentSession.selectedGiftIds ?? []).filter((id) => id !== gift.id);
    const updatedSession = {
      ...currentSession,
      selectedGiftIds: updatedGiftIds,
      selectedGiftId: updatedGiftIds[0] ?? null,
      selectedAt: updatedGiftIds.length ? currentSession.selectedAt : null,
    };
    saveGuestSession(updatedSession);
    setCurrentSession(updatedSession);
    toast.success('Escolha cancelada. O presente voltou a ficar disponível.');
    await loadGifts(false, updatedSession);
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
          <p className="premium-label">Olá, {currentSession?.fullName}</p>
          <h1 className="mt-2 break-words font-display text-[2.35rem] leading-tight text-cocoa sm:text-5xl">
            Escolha um ou mais presentes
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-cocoa/62">
            Cada presente só pode ser escolhido uma vez, mas você pode reservar quantos presentes quiser para participar ainda mais desse momento especial.
          </p>
          {myGifts.length > 0 && (
            <div className="mt-4 rounded-[1.25rem] border border-gold/20 bg-gold/10 px-4 py-3 text-sm leading-6 text-cocoa/70">
              Você já escolheu <strong>{myGifts.length}</strong> {myGifts.length === 1 ? 'presente' : 'presentes'}: {myGifts.map((gift) => gift.name).join(', ')}.
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3 sm:flex sm:items-stretch lg:shrink-0">
          <div className="rounded-2xl bg-porcelain px-4 py-3 text-center shadow-soft">
            <p className="font-display text-3xl leading-none text-cocoa">{availableCount}</p>
            <p className="mt-1 text-[0.65rem] font-bold uppercase tracking-[.16em] text-cocoa/45 sm:text-xs sm:tracking-[.18em]">disponíveis</p>
          </div>
          <div className="rounded-2xl bg-porcelain px-4 py-3 text-center shadow-soft">
            <p className="font-display text-3xl leading-none text-cocoa">{myGifts.length}</p>
            <p className="mt-1 text-[0.65rem] font-bold uppercase tracking-[.16em] text-cocoa/45 sm:text-xs sm:tracking-[.18em]">seus presentes</p>
          </div>
          <Button variant="secondary" onClick={() => loadGifts()} className="col-span-2 w-full sm:col-span-1 sm:w-auto">
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
                isMine={myGiftIds.includes(gift.id)}
                disabled={cancelingGiftId === gift.id}
                onChoose={setSelectedGift}
                onCancelChoice={cancelMyChoice}
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

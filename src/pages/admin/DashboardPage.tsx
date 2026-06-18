import { useEffect, useMemo, useState } from 'react';
import { Gift, PackageCheck, PackageOpen, UserCheck, Users } from 'lucide-react';
import { toast } from 'sonner';
import { AdminShell } from '../../components/AdminShell';
import { StatCard } from '../../components/StatCard';
import { Button } from '../../components/Button';
import { supabase } from '../../lib/supabase';
import { exportReport } from '../../lib/export';
import { formatDateTime } from '../../lib/format';
import type { Gift as GiftType, Guest } from '../../types/database';

export function DashboardPage() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [gifts, setGifts] = useState<GiftType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const [guestsResult, giftsResult] = await Promise.all([
      supabase.from('guests').select('*').order('created_at', { ascending: false }),
      supabase.from('gifts').select('*').order('created_at', { ascending: false }),
    ]);
    setLoading(false);

    if (guestsResult.error || giftsResult.error) {
      toast.error('Não foi possível carregar o dashboard.');
      return;
    }

    setGuests((guestsResult.data ?? []) as Guest[]);
    setGifts((giftsResult.data ?? []) as GiftType[]);
  }

  const giftById = useMemo(() => new Map(gifts.map((gift) => [gift.id, gift])), [gifts]);
  const accessed = guests.filter((guest) => guest.has_accessed).length;
  const selected = guests.filter((guest) => guest.selected_gift_id).length;
  const available = gifts.filter((gift) => gift.status === 'available').length;
  const reserved = gifts.filter((gift) => gift.status === 'reserved').length;
  const recentSelections = guests
    .filter((guest) => guest.selected_gift_id)
    .sort((a, b) => new Date(b.selected_at ?? 0).getTime() - new Date(a.selected_at ?? 0).getTime())
    .slice(0, 8);

  return (
    <AdminShell>
      <div className="mb-6 flex flex-col gap-4 sm:mb-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[.24em] text-gold">Dashboard</p>
          <h1 className="mt-2 break-words font-display text-[2.35rem] leading-tight text-cocoa sm:text-5xl">Resumo da lista</h1>
          <p className="mt-2 text-sm leading-6 text-cocoa/60 sm:text-base">Acompanhe acessos, escolhas e disponibilidade em tempo real.</p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap lg:justify-end">
          <Button variant="secondary" onClick={loadData} loading={loading} className="w-full sm:w-auto">Atualizar</Button>
          <Button onClick={() => exportReport(guests, gifts)} className="w-full sm:w-auto">Exportar Excel</Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-5">
        <StatCard label="Convidados" value={guests.length} icon={Users} />
        <StatCard label="Acessaram" value={accessed} icon={UserCheck} />
        <StatCard label="Escolheram" value={selected} icon={PackageCheck} />
        <StatCard label="Disponíveis" value={available} icon={PackageOpen} />
        <StatCard label="Reservados" value={reserved} icon={Gift} />
      </div>

      <section className="mt-6 rounded-[1.75rem] border border-white bg-white/80 p-4 shadow-soft sm:mt-8 sm:rounded-[2rem] sm:p-7">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.22em] text-cocoa/45">Últimas escolhas</p>
            <h2 className="mt-1 font-display text-3xl leading-tight">Reservas recentes</h2>
          </div>
        </div>

        <div className="space-y-3 md:hidden">
          {recentSelections.length === 0 ? (
            <p className="py-6 text-center text-sm text-cocoa/50">Nenhuma escolha confirmada ainda.</p>
          ) : (
            recentSelections.map((guest) => (
              <article key={guest.id} className="rounded-[1.4rem] border border-cocoa/8 bg-porcelain p-4">
                <p className="font-bold text-cocoa">{guest.full_name}</p>
                <p className="mt-2 text-sm leading-6 text-cocoa/65">{giftById.get(guest.selected_gift_id ?? '')?.name ?? 'Presente removido'}</p>
                <p className="mt-2 text-xs text-cocoa/45">{formatDateTime(guest.selected_at)}</p>
              </article>
            ))
          )}
        </div>

        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[620px] text-left text-sm">
            <thead>
              <tr className="border-b border-cocoa/10 text-xs uppercase tracking-[.18em] text-cocoa/45">
                <th className="py-3 pr-4">Convidado</th>
                <th className="py-3 pr-4">Presente</th>
                <th className="py-3 pr-4">Data</th>
              </tr>
            </thead>
            <tbody>
              {recentSelections.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-cocoa/50">Nenhuma escolha confirmada ainda.</td>
                </tr>
              ) : (
                recentSelections.map((guest) => (
                  <tr key={guest.id} className="border-b border-cocoa/5 last:border-0">
                    <td className="py-4 pr-4 font-bold">{guest.full_name}</td>
                    <td className="py-4 pr-4 text-cocoa/70">{giftById.get(guest.selected_gift_id ?? '')?.name ?? 'Presente removido'}</td>
                    <td className="py-4 pr-4 text-cocoa/55">{formatDateTime(guest.selected_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </AdminShell>
  );
}

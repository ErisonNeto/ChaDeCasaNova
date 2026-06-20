import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Edit3, Plus, RotateCcw, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { AdminShell } from '../../components/AdminShell';
import { Button } from '../../components/Button';
import { supabase } from '../../lib/supabase';
import { formatDateTime } from '../../lib/format';
import type { Gift, Guest } from '../../types/database';

type GuestForm = {
  full_name: string;
  phone: string;
};

const emptyForm: GuestForm = { full_name: '', phone: '' };

type Filter = 'all' | 'accessed' | 'not_accessed' | 'selected' | 'not_selected';

export function GuestsAdminPage() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [form, setForm] = useState<GuestForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>('all');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const [guestsResult, giftsResult] = await Promise.all([
      supabase.from('guests').select('*').order('created_at', { ascending: false }),
      supabase.from('gifts').select('*').order('name', { ascending: true }),
    ]);
    setLoading(false);

    if (guestsResult.error || giftsResult.error) {
      toast.error('Não foi possível carregar convidados.');
      return;
    }
    setGuests((guestsResult.data ?? []) as Guest[]);
    setGifts((giftsResult.data ?? []) as Gift[]);
  }

  const giftById = useMemo(() => new Map(gifts.map((gift) => [gift.id, gift])), [gifts]);
  const filteredGuests = guests.filter((guest) => {
    if (filter === 'accessed') return guest.has_accessed;
    if (filter === 'not_accessed') return !guest.has_accessed;
    if (filter === 'selected') return Boolean(guest.selected_gift_id);
    if (filter === 'not_selected') return !guest.selected_gift_id;
    return true;
  });

  function editGuest(guest: Guest) {
    setEditingId(guest.id);
    setForm({ full_name: guest.full_name, phone: guest.phone ?? '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function saveGuest(event: FormEvent) {
    event.preventDefault();
    if (!form.full_name.trim()) {
      toast.error('Informe o primeiro nome do convidado.');
      return;
    }

    const payload = {
      full_name: form.full_name.trim(),
      phone: form.phone.trim() || null,
    };

    setSaving(true);
    const result = editingId
      ? await supabase.from('guests').update(payload).eq('id', editingId)
      : await supabase.from('guests').insert(payload);
    setSaving(false);

    if (result.error) {
      toast.error('Não foi possível salvar. Verifique se esse nome já foi cadastrado.');
      return;
    }

    toast.success(editingId ? 'Convidado atualizado.' : 'Convidado cadastrado.');
    setEditingId(null);
    setForm(emptyForm);
    loadData();
  }

  async function deleteGuest(guest: Guest) {
    if (guest.selected_gift_id) {
      toast.error('Cancele a escolha antes de excluir este convidado.');
      return;
    }
    if (!confirm(`Excluir o convidado "${guest.full_name}"?`)) return;
    const { error } = await supabase.from('guests').delete().eq('id', guest.id);
    if (error) toast.error('Não foi possível excluir.');
    else {
      toast.success('Convidado excluído.');
      loadData();
    }
  }

  async function releaseGuestChoice(guest: Guest) {
    if (!guest.selected_gift_id) return;
    if (!confirm(`Cancelar a escolha de ${guest.full_name}?`)) return;
    const { data, error } = await supabase.rpc('release_gift', { p_gift_id: guest.selected_gift_id });
    if (error || !data?.success) toast.error(data?.message ?? 'Não foi possível cancelar a escolha.');
    else {
      toast.success('Escolha cancelada e presente liberado.');
      loadData();
    }
  }

  const filterButtons: Array<{ value: Filter; label: string }> = [
    { value: 'all', label: 'Todos' },
    { value: 'accessed', label: 'Acessaram' },
    { value: 'not_accessed', label: 'Não acessaram' },
    { value: 'selected', label: 'Escolheram' },
    { value: 'not_selected', label: 'Sem escolha' },
  ];

  return (
    <AdminShell>
      <div className="mb-6 sm:mb-8">
        <p className="text-xs font-bold uppercase tracking-[.24em] text-gold">Convidados</p>
        <h1 className="mt-2 break-words font-display text-[2.35rem] leading-tight text-cocoa sm:text-5xl">Lista fechada</h1>
        <p className="mt-2 text-sm leading-6 text-cocoa/60 sm:text-base">Somente convidados cadastrados conseguem acessar pelo primeiro nome.</p>
      </div>

      <form onSubmit={saveGuest} className="mb-6 rounded-[1.75rem] border border-white bg-white/80 p-4 shadow-soft sm:mb-8 sm:rounded-[2rem] sm:p-7">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-display text-3xl leading-tight">{editingId ? 'Editar convidado' : 'Novo convidado'}</h2>
          {editingId && (
            <Button type="button" variant="ghost" onClick={() => { setEditingId(null); setForm(emptyForm); }} className="w-full sm:w-auto">
              Cancelar edição
            </Button>
          )}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <label><span className="admin-label">Primeiro nome</span><input className="admin-input" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} placeholder="Ex.: Regiane" /></label>
          <label><span className="admin-label">Telefone opcional</span><input className="admin-input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Ex.: (91) 99999-9999" /></label>
        </div>
        <Button type="submit" loading={saving} className="mt-6 w-full sm:w-auto">
          <Plus className="h-4 w-4 shrink-0" />
          {editingId ? 'Salvar alterações' : 'Cadastrar convidado'}
        </Button>
      </form>

      <section className="rounded-[1.75rem] border border-white bg-white/80 p-4 shadow-soft sm:rounded-[2rem] sm:p-7">
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <h2 className="font-display text-3xl leading-tight">Convidados cadastrados</h2>
          <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:flex-wrap sm:overflow-visible [&::-webkit-scrollbar]:hidden">
            {filterButtons.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setFilter(item.value)}
                className={`min-h-[42px] shrink-0 rounded-full px-4 py-2 text-xs font-bold transition ${filter === item.value ? 'bg-cocoa text-white shadow-soft' : 'bg-porcelain text-cocoa/60 hover:bg-white'}`}
              >
                {item.label}
              </button>
            ))}
            <Button variant="secondary" onClick={loadData} loading={loading} className="shrink-0">Atualizar</Button>
          </div>
        </div>

        <div className="grid gap-3 md:hidden">
          {filteredGuests.map((guest) => (
            <article key={guest.id} className="rounded-[1.5rem] border border-cocoa/8 bg-porcelain p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="break-words font-display text-2xl leading-tight text-cocoa">{guest.full_name}</p>
                  <p className="mt-1 text-xs text-cocoa/45">{guest.phone || 'Sem telefone'}</p>
                </div>
                <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${guest.has_accessed ? 'bg-sage/15 text-olive' : 'bg-cocoa/10 text-cocoa/50'}`}>{guest.has_accessed ? 'Acessou' : 'Não acessou'}</span>
              </div>

              <div className="mt-4 grid gap-3 rounded-[1.2rem] bg-white/60 p-3">
                <div>
                  <p className="mobile-card-label">Presente</p>
                  <p className="mobile-card-value">{guest.selected_gift_id ? giftById.get(guest.selected_gift_id)?.name ?? 'Presente removido' : '-'}</p>
                </div>
                <div>
                  <p className="mobile-card-label">Escolha</p>
                  <p className="mobile-card-value">{formatDateTime(guest.selected_at)}</p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <Button variant="secondary" onClick={() => editGuest(guest)} className="w-full" aria-label="Editar convidado"><Edit3 className="h-4 w-4" /> Editar</Button>
                {guest.selected_gift_id && <Button variant="secondary" onClick={() => releaseGuestChoice(guest)} className="w-full" aria-label="Cancelar escolha"><RotateCcw className="h-4 w-4" /> Liberar</Button>}
                <Button variant="danger" onClick={() => deleteGuest(guest)} className="w-full col-span-2" aria-label="Excluir convidado"><Trash2 className="h-4 w-4" /> Excluir</Button>
              </div>
            </article>
          ))}
          {filteredGuests.length === 0 && <p className="py-10 text-center text-cocoa/50">Nenhum convidado neste filtro.</p>}
        </div>

        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-cocoa/10 text-xs uppercase tracking-[.18em] text-cocoa/45">
                <th className="py-3 pr-4">Nome</th>
                <th className="py-3 pr-4">Acessou</th>
                <th className="py-3 pr-4">Presente</th>
                <th className="py-3 pr-4">Escolha</th>
                <th className="py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredGuests.map((guest) => (
                <tr key={guest.id} className="border-b border-cocoa/5 last:border-0">
                  <td className="py-4 pr-4">
                    <p className="font-bold">{guest.full_name}</p>
                    <p className="text-xs text-cocoa/45">{guest.phone || 'Sem telefone'}</p>
                  </td>
                  <td className="py-4 pr-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${guest.has_accessed ? 'bg-sage/15 text-olive' : 'bg-cocoa/10 text-cocoa/50'}`}>{guest.has_accessed ? 'Sim' : 'Não'}</span>
                  </td>
                  <td className="py-4 pr-4 text-cocoa/65">{guest.selected_gift_id ? giftById.get(guest.selected_gift_id)?.name ?? 'Presente removido' : '-'}</td>
                  <td className="py-4 pr-4 text-cocoa/55">{formatDateTime(guest.selected_at)}</td>
                  <td className="py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="secondary" onClick={() => editGuest(guest)} aria-label="Editar convidado"><Edit3 className="h-4 w-4" /></Button>
                      {guest.selected_gift_id && <Button variant="secondary" onClick={() => releaseGuestChoice(guest)} aria-label="Cancelar escolha"><RotateCcw className="h-4 w-4" /></Button>}
                      <Button variant="danger" onClick={() => deleteGuest(guest)} aria-label="Excluir convidado"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredGuests.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-cocoa/50">Nenhum convidado neste filtro.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </AdminShell>
  );
}

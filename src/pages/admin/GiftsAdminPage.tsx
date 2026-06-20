import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Edit3, ExternalLink, Plus, RotateCcw, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { AdminShell } from '../../components/AdminShell';
import { Button } from '../../components/Button';
import { supabase } from '../../lib/supabase';
import { formatCurrency, formatDateTime } from '../../lib/format';
import { GiftHero } from '../../components/GiftHero';
import type { Gift, Guest } from '../../types/database';

type GiftForm = {
  name: string;
  description: string;
  image_url: string;
  purchase_url: string;
  price: string;
};

const emptyForm: GiftForm = { name: '', description: '', image_url: '', purchase_url: '', price: '' };

export function GiftsAdminPage() {
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [form, setForm] = useState<GiftForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const [giftsResult, guestsResult] = await Promise.all([
      supabase.from('gifts').select('*').order('created_at', { ascending: false }),
      supabase.from('guests').select('*').order('full_name', { ascending: true }),
    ]);
    setLoading(false);
    if (giftsResult.error || guestsResult.error) {
      toast.error('Não foi possível carregar presentes.');
      return;
    }
    setGifts((giftsResult.data ?? []) as Gift[]);
    setGuests((guestsResult.data ?? []) as Guest[]);
  }

  const guestById = useMemo(() => new Map(guests.map((guest) => [guest.id, guest])), [guests]);

  function editGift(gift: Gift) {
    setEditingId(gift.id);
    setForm({
      name: gift.name,
      description: gift.description ?? '',
      image_url: gift.image_url ?? '',
      purchase_url: gift.purchase_url ?? '',
      price: gift.price?.toString() ?? '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function saveGift(event: FormEvent) {
    event.preventDefault();
    if (!form.name.trim()) {
      toast.error('Informe o nome do presente.');
      return;
    }
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      image_url: form.image_url.trim() || null,
      purchase_url: form.purchase_url.trim() || null,
      price: form.price ? Number(form.price.replace(',', '.')) : null,
    };

    const result = editingId
      ? await supabase.from('gifts').update(payload).eq('id', editingId)
      : await supabase.from('gifts').insert(payload);
    setSaving(false);

    if (result.error) {
      toast.error('Não foi possível salvar o presente.');
      return;
    }

    toast.success(editingId ? 'Presente atualizado.' : 'Presente cadastrado.');
    setForm(emptyForm);
    setEditingId(null);
    loadData();
  }

  async function deleteGift(gift: Gift) {
    if (gift.status === 'reserved') {
      toast.error('Libere o presente antes de excluir.');
      return;
    }
    if (!confirm(`Excluir o presente "${gift.name}"?`)) return;
    const { error } = await supabase.from('gifts').delete().eq('id', gift.id);
    if (error) toast.error('Não foi possível excluir.');
    else {
      toast.success('Presente excluído.');
      loadData();
    }
  }

  async function releaseGift(gift: Gift) {
    if (!confirm(`Liberar o presente "${gift.name}" novamente?`)) return;
    const { data, error } = await supabase.rpc('release_gift', { p_gift_id: gift.id });
    if (error || !data?.success) toast.error(data?.message ?? 'Não foi possível liberar.');
    else {
      toast.success('Presente liberado novamente.');
      loadData();
    }
  }

  return (
    <AdminShell>
      <div className="mb-6 sm:mb-8">
        <p className="text-xs font-bold uppercase tracking-[.24em] text-gold">Presentes</p>
        <h1 className="mt-2 break-words font-display text-[2.35rem] leading-tight text-cocoa sm:text-5xl">Cadastro de presentes</h1>
      </div>

      <form onSubmit={saveGift} className="mb-6 rounded-[1.75rem] border border-white bg-white/80 p-4 shadow-soft sm:mb-8 sm:rounded-[2rem] sm:p-7">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-display text-3xl leading-tight">{editingId ? 'Editar presente' : 'Novo presente'}</h2>
          {editingId && (
            <Button type="button" variant="ghost" onClick={() => { setEditingId(null); setForm(emptyForm); }} className="w-full sm:w-auto">
              Cancelar edição
            </Button>
          )}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <label><span className="admin-label">Nome</span><input className="admin-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
          <label><span className="admin-label">Preço opcional</span><input className="admin-input" inputMode="decimal" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="129,90" /></label>
          <label className="lg:col-span-2"><span className="admin-label">Descrição curta</span><textarea className="admin-input min-h-28 resize-y" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
          <label><span className="admin-label">URL da imagem</span><input className="admin-input" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="Opcional: se vazio, o site busca a foto pelo link de compra" /></label>
          <label><span className="admin-label">Link de compra</span><input className="admin-input" value={form.purchase_url} onChange={(e) => setForm({ ...form, purchase_url: e.target.value })} /></label>
        </div>
        <Button type="submit" loading={saving} className="mt-6 w-full sm:w-auto">
          <Plus className="h-4 w-4 shrink-0" />
          {editingId ? 'Salvar alterações' : 'Cadastrar presente'}
        </Button>
      </form>

      <section className="rounded-[1.75rem] border border-white bg-white/80 p-4 shadow-soft sm:rounded-[2rem] sm:p-7">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-display text-3xl leading-tight">Lista cadastrada</h2>
          <Button variant="secondary" onClick={loadData} loading={loading} className="w-full sm:w-auto">Atualizar</Button>
        </div>
        <div className="grid gap-4">
          {gifts.map((gift) => {
            const reservedBy = gift.reserved_by_guest_id ? guestById.get(gift.reserved_by_guest_id) : null;
            return (
              <article key={gift.id} className="grid gap-4 rounded-[1.5rem] border border-cocoa/8 bg-porcelain p-4 sm:grid-cols-[120px_1fr] lg:grid-cols-[120px_1fr_auto] lg:items-center">
                <div className="overflow-hidden rounded-2xl sm:h-28 sm:w-28 [&>div]:h-full [&>div]:rounded-2xl [&>div]:border [&>div]:border-shell/70 [&_.absolute.left-4]:hidden [&_h3]:text-sm [&_h3]:leading-tight [&_.bottom-12]:hidden [&_.top-8]:top-3"><GiftHero gift={gift} compact /></div>
                <div className="min-w-0">
                  <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                    <h3 className="break-words font-display text-2xl leading-tight">{gift.name}</h3>
                    <span className={`w-fit rounded-full px-3 py-1 text-xs font-bold ${gift.status === 'reserved' ? 'bg-cocoa/10 text-cocoa/55' : 'bg-sage/15 text-olive'}`}>{gift.status === 'reserved' ? 'Reservado' : 'Disponível'}</span>
                  </div>
                  {gift.description && <p className="mt-2 text-sm leading-6 text-cocoa/60">{gift.description}</p>}
                  <p className="mt-2 text-sm font-bold text-cocoa/70">{formatCurrency(gift.price)}</p>
                  {reservedBy && <p className="mt-2 text-xs leading-5 text-cocoa/50">Reservado por {reservedBy.full_name} em {formatDateTime(gift.reserved_at)}</p>}
                </div>
                <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:justify-end lg:ml-4">
                  {gift.purchase_url && <a href={gift.purchase_url} target="_blank" rel="noreferrer" className="contents sm:block"><Button variant="ghost" className="w-full sm:w-auto" aria-label="Abrir link de compra"><ExternalLink className="h-4 w-4" /></Button></a>}
                  <Button variant="secondary" onClick={() => editGift(gift)} className="w-full sm:w-auto" aria-label="Editar presente"><Edit3 className="h-4 w-4" /></Button>
                  {gift.status === 'reserved' && <Button variant="secondary" onClick={() => releaseGift(gift)} className="w-full sm:w-auto" aria-label="Liberar presente"><RotateCcw className="h-4 w-4" /></Button>}
                  <Button variant="danger" onClick={() => deleteGift(gift)} className="w-full sm:w-auto" aria-label="Excluir presente"><Trash2 className="h-4 w-4" /></Button>
                </div>
              </article>
            );
          })}
          {gifts.length === 0 && <p className="py-10 text-center text-cocoa/50">Nenhum presente cadastrado ainda.</p>}
        </div>
      </section>
    </AdminShell>
  );
}

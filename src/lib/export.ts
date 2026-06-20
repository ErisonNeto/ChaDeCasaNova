import * as XLSX from 'xlsx';
import type { Gift, Guest } from '../types/database';
import { formatDateTime } from './format';

export function exportReport(guests: Guest[], gifts: Gift[]) {
  const giftsByGuestId = new Map<string, Gift[]>();
  gifts.forEach((gift) => {
    if (!gift.reserved_by_guest_id) return;
    const list = giftsByGuestId.get(gift.reserved_by_guest_id) ?? [];
    list.push(gift);
    giftsByGuestId.set(gift.reserved_by_guest_id, list);
  });

  const guestRows = guests.map((guest) => {
    const selectedGifts = giftsByGuestId.get(guest.id) ?? [];
    const lastGift = selectedGifts
      .slice()
      .sort((a, b) => new Date(b.reserved_at ?? 0).getTime() - new Date(a.reserved_at ?? 0).getTime())[0];

    return {
      Convidado: guest.full_name,
      Telefone: guest.phone ?? '',
      Acessou: guest.has_accessed ? 'Sim' : 'Não',
      QuantidadePresentes: selectedGifts.length,
      Presentes: selectedGifts.map((gift) => gift.name).join(' | '),
      UltimaEscolha: formatDateTime(lastGift?.reserved_at ?? null),
    };
  });

  const giftRows = gifts.map((gift) => {
    const guest = gift.reserved_by_guest_id ? guests.find((item) => item.id === gift.reserved_by_guest_id) : null;
    return {
      Presente: gift.name,
      Status: gift.status === 'reserved' ? 'Reservado' : 'Disponível',
      ReservadoPor: guest?.full_name ?? '',
      ReservadoEm: formatDateTime(gift.reserved_at),
      LinkCompra: gift.purchase_url ?? '',
    };
  });

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(guestRows), 'Convidados');
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(giftRows), 'Presentes');
  XLSX.writeFile(workbook, 'relatorio-cha-casa-nova.xlsx');
}

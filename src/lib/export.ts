import * as XLSX from 'xlsx';
import type { Gift, Guest } from '../types/database';
import { formatDateTime } from './format';

export function exportReport(guests: Guest[], gifts: Gift[]) {
  const giftById = new Map(gifts.map((gift) => [gift.id, gift.name]));
  const rows = guests.map((guest) => ({
    Convidado: guest.full_name,
    Grupo: guest.group_name ?? '',
    StatusConvite: guest.invite_status === 'confirmed' ? 'Confirmado' : 'Pendente',
    Telefone: guest.phone ?? '',
    Acessou: guest.has_accessed ? 'Sim' : 'Não',
    Presente: guest.selected_gift_id ? giftById.get(guest.selected_gift_id) ?? 'Presente removido' : '',
    EscolhidoEm: formatDateTime(guest.selected_at),
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Relatório');
  XLSX.writeFile(workbook, 'relatorio-cha-casa-nova.xlsx');
}

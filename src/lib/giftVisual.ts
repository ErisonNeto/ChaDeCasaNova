export function getGiftCategory(name: string) {
  const n = name.toLowerCase();

  if (n.includes('aspirador')) return 'LIMPEZA';
  if (n.includes('passadeira') || n.includes('varal') || n.includes('cesto') || n.includes('cabide')) return 'LAVANDERIA';
  if (n.includes('toalha') || n.includes('banheiro') || n.includes('lixeira')) return 'BANHEIRO';
  if (n.includes('jogo de cama') || n.includes('cama')) return 'QUARTO';
  if (n.includes('almofada') || n.includes('manta') || n.includes('vaso') || n.includes('decorativo') || n.includes('decoração') || n.includes('boho')) return 'DECORAÇÃO';
  if (n.includes('taça') || n.includes('taca') || n.includes('xícara') || n.includes('xicara') || n.includes('faqueiro') || n.includes('jantar') || n.includes('sousplat') || n.includes('souplast') || n.includes('jogo americano') || n.includes('copos')) return 'MESA POSTA';

  return 'COZINHA';
}

export function formatHeroTitle(name: string) {
  return name.replace(/\s{2,}/g, ' ').trim();
}

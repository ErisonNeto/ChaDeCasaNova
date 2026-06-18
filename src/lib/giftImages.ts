import type React from 'react';
import type { Gift } from '../types/database';

export const FALLBACK_GIFT_IMAGE = '/gifts/fallback-gift.svg';

const LOCAL_PLACEHOLDER_BY_NAME: Array<[RegExp, string]> = [
  [/albany|borda\s+dourada|copos.*400ml/i, '/gifts/30-copos-albany.svg'],
  [/garrafas.*acr[ií]lico|caixa\s+de\s+leite|1000ml/i, '/gifts/31-garrafas-acrilico.svg'],
  [/porta[-\s]?ovos|30\s+ovos|ovos.*rolante/i, '/gifts/32-porta-ovos.svg'],
  [/capas?\s+de\s+almofada|boho\s+chic/i, '/gifts/33-capas-almofada-boho.svg'],
  [/40\s+clips|roupas\s+intimas|roupas\s+[íi]ntimas/i, '/gifts/34-varal-clips.svg'],
  [/nadir|lights|vidro\s+cristalino/i, '/gifts/35-copos-lights-nadir.svg'],
  [/jogo\s+americano|souplast|sousplat|mesa\s+posta|38cm/i, '/gifts/36-jogo-americano-sousplat.svg'],
  [/passadeira|vapor\s+port[aá]til|mondial|vp-09|fast\s+steam/i, '/gifts/37-passadeira-mondial.svg'],
  [/utens[ií]lios.*cozinha|silicone.*madeira|madeira.*silicone|12\s+pe[cç]as/i, '/gifts/38-utensilios-silicone-madeira.svg'],
  [/jogo\s+de\s+panelas.*brinox|brinox.*jogo\s+de\s+panelas|ceramic\s+life\s+sirius.*6|6\s+pe[cç]as.*sirius/i, '/gifts/39-panelas-brinox-sirius.svg'],
  [/air\s*fryer|eaf85/i, '/gifts/01-air-fryer.svg'],
  [/cesto\s+de\s+bambu/i, '/gifts/02-cesto-bambu.svg'],
  [/varal/i, '/gifts/03-varal.svg'],
  [/x[ií]cara|caf[eé]/i, '/gifts/04-xicaras-cafe.svg'],
  [/jogo\s+de\s+jantar|naturalle/i, '/gifts/05-jogo-jantar.svg'],
  [/sanduicheira|cadence/i, '/gifts/06-sanduicheira.svg'],
  [/cama.*preto|camafeu/i, '/gifts/07-jogo-cama-preto.svg'],
  [/cama.*rosa|120\s*fios/i, '/gifts/08-jogo-cama-rosa.svg'],
  [/assadeiras|starflon/i, '/gifts/09-assadeiras.svg'],
  [/cabides|cabide/i, '/gifts/10-cabides.svg'],
  [/banho|d[öo]hler|romance/i, '/gifts/11-jogo-banho.svg'],
  [/karsten|super\s+banho/i, '/gifts/12-toalha-karsten.svg'],
  [/banheiro\s+completo|lixeira.*bambu/i, '/gifts/13-kit-banheiro.svg'],
  [/potes\s+herm[eé]ticos|mantimentos/i, '/gifts/14-potes-hermeticos.svg'],
  [/almofadas/i, '/gifts/15-almofadas.svg'],
  [/mantas/i, '/gifts/16-mantas.svg'],
  [/vasos.*trio|trio.*vasos|vazado/i, '/gifts/17-vasos-trio.svg'],
  [/vaso\s+cone/i, '/gifts/18-vaso-cone.svg'],
  [/umidificador|aromatizador|difusor/i, '/gifts/19-umidificador.svg'],
  [/t[aá]bua|m[aá]rmore/i, '/gifts/20-tabua-marmore.svg'],
  [/processador.*electrolux|efp500/i, '/gifts/21-processador.svg'],
  [/porta\s+temperos|condimentos/i, '/gifts/22-porta-temperos.svg'],
  [/facas|plenus/i, '/gifts/23-facas.svg'],
  [/ta[cç]as|vinho\s+branco/i, '/gifts/24-tacas-vinho.svg'],
  [/frigideira|brinox|sirius/i, '/gifts/25-frigideira.svg'],
  [/panelas|oster|marble/i, '/gifts/26-panelas-oster.svg'],
  [/organizador\s+de\s+pia|escorredor/i, '/gifts/27-organizador-pia.svg'],
  [/faqueiro|malibu/i, '/gifts/28-faqueiro.svg'],
  [/lixeira\s+pl[aá]stica|paramount/i, '/gifts/29-lixeira.svg'],
];

function getLocalPlaceholder(gift: Pick<Gift, 'name' | 'image_url'>) {
  const imageUrl = gift.image_url?.trim();

  if (imageUrl && imageUrl.startsWith('/gifts/')) {
    return imageUrl;
  }

  return LOCAL_PLACEHOLDER_BY_NAME.find(([pattern]) => pattern.test(gift.name || ''))?.[1] || FALLBACK_GIFT_IMAGE;
}

function shouldUseExternalDirectImage(url: string) {
  // Fotos manuais cadastradas pelo admin continuam funcionando direto.
  // Mas URLs automáticas da Amazon Ads e placeholders antigos são ignorados para evitar concha/imagem quebrada.
  return /^https?:\/\//i.test(url) && !/amazon-adsystem\.com\/widgets\/q/i.test(url);
}

export function getGiftImageUrl(gift: Pick<Gift, 'name' | 'image_url' | 'purchase_url'>) {
  const imageUrl = gift.image_url?.trim();
  const purchaseUrl = gift.purchase_url?.trim();
  const fallback = getLocalPlaceholder(gift);

  if (imageUrl && shouldUseExternalDirectImage(imageUrl)) {
    return imageUrl;
  }

  // A imagem principal agora é buscada pelo título do presente.
  // Isso garante que todos os cards tentem exibir foto coerente com o produto,
  // mesmo quando o link da loja bloqueia captura ou vem encurtado.
  const params = new URLSearchParams({
    title: gift.name || 'presente casa nova',
    fallback,
  });

  if (purchaseUrl) params.set('url', purchaseUrl);

  return `/api/product-image?${params.toString()}`;
}

export function handleGiftImageError(event: React.SyntheticEvent<HTMLImageElement>) {
  const current = event.currentTarget;
  const fallback = current.dataset.fallback || FALLBACK_GIFT_IMAGE;

  if (current.src.endsWith(fallback)) return;
  current.src = fallback;
}

export function getGiftFallbackImageUrl(gift: Pick<Gift, 'name' | 'image_url'>) {
  return getLocalPlaceholder(gift);
}

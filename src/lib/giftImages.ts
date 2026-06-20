import type React from 'react';
import type { Gift } from '../types/database';

export const FALLBACK_GIFT_IMAGE = '/gifts/fallback-gift.svg';

const amazonProductImage = (asin: string) =>
  `https://m.media-amazon.com/images/P/${asin}.01._AC_SL1500_.jpg`;

const flickrPhoto = (keywords: string, lock: number) =>
  `https://loremflickr.com/900/700/${keywords}?lock=${lock}`;

// Fotos reais por categoria/título. Esta camada não usa mais a arte da concha como imagem principal.
// A concha fica apenas como último fallback caso alguma foto externa falhe.
const REAL_PHOTO_BY_NAME: Array<[RegExp, string]> = [
  [/air\s*fryer|eaf85/i, amazonProductImage('B0FRH96P1G')],
  [/cesto\s+de\s+bambu/i, amazonProductImage('B0CLSGC1BV')],
  [/varal/i, flickrPhoto('clothes,drying,rack', 3003)],
  [/x[ií]cara|caf[eé]/i, amazonProductImage('B0GNWNXF1W')],
  [/jogo\s+de\s+jantar|naturalle/i, flickrPhoto('black,dinnerware,ceramic', 3005)],
  [/sanduicheira|cadence/i, flickrPhoto('sandwich,maker,kitchen', 3006)],
  [/cama.*preto|camafeu/i, flickrPhoto('black,bed,sheets,bedding', 3007)],
  [/cama.*rosa|120\s*fios/i, flickrPhoto('pink,bedding,bed,sheets', 3008)],
  [/assadeiras|starflon/i, amazonProductImage('B0CFYRRWVL')],
  [/cabides|cabide/i, flickrPhoto('wooden,hangers,closet', 3010)],
  [/banho|d[öo]hler|romance/i, amazonProductImage('B0BVXLVGRN')],
  [/karsten|super\s+banho/i, flickrPhoto('white,bath,towel', 3012)],
  [/banheiro\s+completo|lixeira.*bambu/i, flickrPhoto('bathroom,accessories,bamboo', 3013)],
  [/potes\s+herm[eé]ticos|mantimentos/i, flickrPhoto('kitchen,storage,jars,bamboo', 3014)],
  [/almofadas/i, amazonProductImage('B0G6GF9741')],
  [/mantas/i, amazonProductImage('B0DPT3V2K6')],
  [/vasos.*trio|trio.*vasos|vazado/i, amazonProductImage('B0GKPQ7315')],
  [/vaso\s+cone/i, amazonProductImage('B0F99HM6L4')],
  [/umidificador|aromatizador|difusor/i, amazonProductImage('B08SXS57Q7')],
  [/t[aá]bua|m[aá]rmore/i, flickrPhoto('marble,cutting,board,kitchen', 3020)],
  [/processador.*electrolux|efp500/i, flickrPhoto('food,processor,kitchen,appliance', 3021)],
  [/porta\s+temperos|condimentos/i, amazonProductImage('B0GPR1VZN6')],
  [/facas|plenus/i, amazonProductImage('B076MKTNRK')],
  [/ta[cç]as|vinho\s+branco/i, amazonProductImage('B0B5LL9MXB')],
  [/frigideira|brinox|sirius/i, flickrPhoto('ceramic,frying,pan,kitchen', 3025)],
  [/panelas|oster|marble/i, amazonProductImage('B0CRY48NSK')],
  [/organizador\s+de\s+pia|escorredor/i, amazonProductImage('B0CQT38866')],
  [/faqueiro|malibu/i, flickrPhoto('flatware,cutlery,set', 3028)],
  [/lixeira\s+pl[aá]stica|paramount/i, amazonProductImage('B0GKGXZ5YB')],
];

const LOCAL_PLACEHOLDER_BY_NAME: Array<[RegExp, string]> = [
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

function getRealPhotoByTitle(name = '') {
  return REAL_PHOTO_BY_NAME.find(([pattern]) => pattern.test(name))?.[1] || null;
}

function getLocalPlaceholder(gift: Pick<Gift, 'name' | 'image_url'>) {
  const imageUrl = gift.image_url?.trim();

  if (imageUrl && imageUrl.startsWith('/gifts/')) {
    return imageUrl;
  }

  return LOCAL_PLACEHOLDER_BY_NAME.find(([pattern]) => pattern.test(gift.name || ''))?.[1] || FALLBACK_GIFT_IMAGE;
}

function shouldUseExternalDirectImage(url: string) {
  return /^https?:\/\//i.test(url) && !/amazon-adsystem\.com\/widgets\/q/i.test(url);
}

export function getGiftImageUrl(gift: Pick<Gift, 'name' | 'image_url' | 'purchase_url'>) {
  const imageUrl = gift.image_url?.trim();

  // 1) Se o admin cadastrou uma URL externa direta, respeita essa imagem.
  if (imageUrl && shouldUseExternalDirectImage(imageUrl)) {
    return imageUrl;
  }

  // 2) Caso não tenha imagem no banco, usa uma foto real pela categoria do título.
  // Exemplo: Frigideira -> foto de frigideira; Panelas -> foto de panelas.
  const titlePhoto = getRealPhotoByTitle(gift.name || '');
  if (titlePhoto) return titlePhoto;

  // 3) Último fallback: arte local do convite, apenas para não quebrar visual.
  return getLocalPlaceholder(gift);
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

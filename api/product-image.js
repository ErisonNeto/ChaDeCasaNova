const DEFAULT_HEADERS = {
  'user-agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
  accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'accept-language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
};

const IMAGE_SEARCH_HEADERS = {
  ...DEFAULT_HEADERS,
  referer: 'https://duckduckgo.com/',
};

const A_CO_ASIN_BY_CODE = {
  '0hZJsPRh': 'B0FRHHNVLV',
  '0eNxNJDK': 'B0CLSGC1BV',
  '0942pZ3k': 'B0DKM4TQ7Y',
  '0d3GXViL': 'B0CFYRRWVL',
  '0662YUHW': 'B0BVX344FR',
  '01BcJfzL': 'B0G6GF9741',
  '0acjYaMx': 'B0DPT3V2K6',
  '0bqHUX9R': 'B0GKPPK325',
  '07EVWWVc': 'B0F99HM6L4',
  '0jdsuG65': 'B0G583P6TN',
  '0heMr4mU': 'B0CX2W9W22',
  '00orRvWi': 'B076MKTNRK',
  '00tQhFB6': 'B0GF2VJ22H',
  '035dbqkh': 'B0B5LL9MXB',
  '01z9fLEl': 'B0CRY48NSK',
  '09iYsO5d': 'B0CQT38866',
  '00GUFJ7f': 'B0GKGXZ5YB',
};

function amazonImageFromAsin(asin) {
  return `https://ws-na.amazon-adsystem.com/widgets/q?_encoding=UTF8&ASIN=${asin}&Format=_SL800_&ID=AsinImage&MarketPlace=BR&ServiceVersion=20070822&WS=1`;
}

function amazonImageFromKnownShortLink(url) {
  const shortCode = url.match(/a\.co\/d\/([^/?#]+)/i)?.[1];
  const asinFromShort = shortCode ? A_CO_ASIN_BY_CODE[shortCode] : null;
  const asinFromUrl = url.match(/\/(?:dp|gp\/product)\/([A-Z0-9]{10})/i)?.[1];
  const asin = asinFromUrl || asinFromShort;
  return asin ? amazonImageFromAsin(asin) : null;
}

function decodeHtml(value = '') {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();
}

function absolutize(imageUrl, baseUrl) {
  if (!imageUrl) return null;
  try {
    return new URL(decodeHtml(imageUrl), baseUrl).toString();
  } catch {
    return null;
  }
}

function normalizeTitle(title = '') {
  return title
    .replace(/\s+/g, ' ')
    .replace(/\b(null|undefined)\b/gi, '')
    .trim();
}

function buildSearchQuery(title = '') {
  return `${normalizeTitle(title)} produto foto`.trim();
}

function pickFromMeta(html, finalUrl) {
  const patterns = [
    /<meta[^>]+property=["']og:image:secure_url["'][^>]+content=["']([^"']+)["'][^>]*>/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image:secure_url["'][^>]*>/i,
    /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["'][^>]*>/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["'][^>]*>/i,
    /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["'][^>]*>/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["'][^>]*>/i,
    /<meta[^>]+itemprop=["']image["'][^>]+content=["']([^"']+)["'][^>]*>/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+itemprop=["']image["'][^>]*>/i,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    const candidate = absolutize(match?.[1], finalUrl);
    if (candidate) return candidate;
  }

  return null;
}

function pickFromJsonLd(html, finalUrl) {
  const scripts = html.match(/<script[^>]+type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi) || [];

  for (const script of scripts) {
    const raw = script.replace(/<script[^>]*>/i, '').replace(/<\/script>/i, '').trim();
    if (!raw) continue;

    try {
      const parsed = JSON.parse(raw);
      const stack = Array.isArray(parsed) ? [...parsed] : [parsed];

      while (stack.length) {
        const item = stack.shift();
        if (!item || typeof item !== 'object') continue;

        const image = item.image || item.thumbnailUrl;
        if (typeof image === 'string') {
          const candidate = absolutize(image, finalUrl);
          if (candidate) return candidate;
        }
        if (Array.isArray(image)) {
          const first = image.find((entry) => typeof entry === 'string') || image.find((entry) => entry?.url);
          const candidate = absolutize(typeof first === 'string' ? first : first?.url, finalUrl);
          if (candidate) return candidate;
        }
        if (image && typeof image === 'object') {
          const candidate = absolutize(image.url || image.contentUrl, finalUrl);
          if (candidate) return candidate;
        }

        for (const value of Object.values(item)) {
          if (Array.isArray(value)) stack.push(...value);
          else if (value && typeof value === 'object') stack.push(value);
        }
      }
    } catch {
      // Algumas lojas inserem JSON-LD quebrado; apenas tenta a próxima opção.
    }
  }

  return null;
}

function pickFromImageTags(html, finalUrl) {
  const imgs = [...html.matchAll(/<img[^>]+(?:src|data-src|data-original|data-image)=["']([^"']+)["'][^>]*>/gi)];
  const ignored = /(logo|sprite|icon|placeholder|loading|base64|pixel|transparent)/i;

  for (const match of imgs) {
    const url = match[1];
    if (!url || ignored.test(url)) continue;
    const candidate = absolutize(url, finalUrl);
    if (candidate) return candidate;
  }

  return null;
}

function amazonAsinImage(finalUrl) {
  const asin = finalUrl.match(/\/(?:dp|gp\/product)\/([A-Z0-9]{10})/i)?.[1];
  if (!asin) return null;
  return amazonImageFromAsin(asin);
}

async function fetchHtml(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 9000);

  try {
    const response = await fetch(url, {
      redirect: 'follow',
      headers: DEFAULT_HEADERS,
      signal: controller.signal,
    });

    const contentType = response.headers.get('content-type') || '';
    const finalUrl = response.url || url;

    if (contentType.startsWith('image/')) {
      return { finalUrl, directImage: finalUrl, html: '' };
    }

    const html = await response.text();
    return { finalUrl, html, directImage: null };
  } finally {
    clearTimeout(timeout);
  }
}

async function searchDuckDuckGoImage(title) {
  const query = buildSearchQuery(title);
  if (!query || query.length < 3) return null;

  const searchUrl = `https://duckduckgo.com/?q=${encodeURIComponent(query)}&iax=images&ia=images&kl=br-pt`;
  const searchPage = await fetch(searchUrl, { headers: IMAGE_SEARCH_HEADERS });
  const html = await searchPage.text();
  const vqd =
    html.match(/vqd=["']?([^&"'\\]+)["']?/i)?.[1] ||
    html.match(/"vqd":"([^"]+)"/i)?.[1] ||
    html.match(/vqd='([^']+)'/i)?.[1];

  if (!vqd) return null;

  const imagesUrl = `https://duckduckgo.com/i.js?l=br-pt&o=json&q=${encodeURIComponent(query)}&vqd=${encodeURIComponent(vqd)}&f=,,,&p=1`;
  const response = await fetch(imagesUrl, { headers: IMAGE_SEARCH_HEADERS });
  if (!response.ok) return null;

  const data = await response.json();
  const results = Array.isArray(data.results) ? data.results : [];
  const ignored = /(logo|icon|sprite|placeholder|base64|pixel|transparent|facebook|instagram|pinterest)/i;

  for (const item of results.slice(0, 12)) {
    const candidate = item.thumbnail || item.image;
    const titleText = item.title || '';
    if (!candidate || ignored.test(candidate) || ignored.test(titleText)) continue;

    try {
      const url = new URL(candidate);
      if (!['http:', 'https:'].includes(url.protocol)) continue;
      return url.toString();
    } catch {
      // ignora URLs inválidas
    }
  }

  return null;
}

async function getImageFromProductUrl(inputUrl) {
  if (!inputUrl) return null;

  const parsed = new URL(inputUrl);
  if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('URL inválida');

  const knownAmazonImage = amazonImageFromKnownShortLink(parsed.toString());
  if (knownAmazonImage) return knownAmazonImage;

  const { finalUrl, html, directImage } = await fetchHtml(parsed.toString());
  return (
    directImage ||
    pickFromMeta(html, finalUrl) ||
    pickFromJsonLd(html, finalUrl) ||
    amazonAsinImage(finalUrl) ||
    pickFromImageTags(html, finalUrl)
  );
}

export default async function handler(req, res) {
  const inputUrl = Array.isArray(req.query.url) ? req.query.url[0] : req.query.url;
  const title = Array.isArray(req.query.title) ? req.query.title[0] : req.query.title;
  const fallback = Array.isArray(req.query.fallback) ? req.query.fallback[0] : req.query.fallback || '/gifts/fallback-gift.svg';

  try {
    // Prioridade: foto buscada pelo título do presente. Assim itens com link encurtado,
    // redirecionamento bloqueado ou página sem og:image ainda exibem uma foto coerente.
    const titleImage = title ? await searchDuckDuckGoImage(title) : null;
    const imageUrl = titleImage || (inputUrl ? await getImageFromProductUrl(inputUrl) : null);

    if (!imageUrl) throw new Error('Imagem não encontrada');

    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=604800');
    res.statusCode = 302;
    res.setHeader('Location', imageUrl);
    res.end();
  } catch (error) {
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    res.statusCode = 302;
    res.setHeader('Location', fallback);
    res.end();
  }
}

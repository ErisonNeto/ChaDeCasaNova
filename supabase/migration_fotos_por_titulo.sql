-- Imagens automáticas por título
-- Rode no Supabase SQL Editor para parar de usar imagens quebradas/placeholder no banco.
-- O front-end buscará uma foto coerente pelo título de cada presente pela rota /api/product-image.

update public.gifts
set image_url = null
where image_url is not null;

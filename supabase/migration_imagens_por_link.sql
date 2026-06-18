-- Faz o front buscar a foto real pelo link de compra.
-- Rode este SQL no Supabase depois de subir a nova versão do código.
-- Ele remove apenas as imagens locais ilustrativas geradas anteriormente.

update public.gifts
set image_url = null
where image_url like '/gifts/%';

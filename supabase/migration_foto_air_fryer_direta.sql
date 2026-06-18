-- Atualiza somente a foto da Air Fryer, sem apagar presentes e sem mexer nas reservas.
-- Rode este arquivo no Supabase SQL Editor se o banco já estiver em produção.

update public.gifts
set image_url = 'https://m.media-amazon.com/images/I/51zqocFSQSL._AC_SX679_.jpg'
where purchase_url = 'https://a.co/d/0hZJsPRh'
   or name ilike '%Air Fryer%';

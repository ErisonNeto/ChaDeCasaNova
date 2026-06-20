-- Corrige imagens dos itens que não carregam automaticamente por links encurtados da Amazon.
-- Pode rodar no Supabase SQL Editor sem apagar escolhas e sem alterar reservas.

update public.gifts
set image_url = 'https://ws-na.amazon-adsystem.com/widgets/q?_encoding=UTF8&ASIN=B0FRHHNVLV&Format=_SL800_&ID=AsinImage&MarketPlace=BR&ServiceVersion=20070822&WS=1'
where purchase_url = 'https://a.co/d/0hZJsPRh'
   or name ilike '%Air Fryer%';

update public.gifts
set image_url = 'https://ws-na.amazon-adsystem.com/widgets/q?_encoding=UTF8&ASIN=B0CLSGC1BV&Format=_SL800_&ID=AsinImage&MarketPlace=BR&ServiceVersion=20070822&WS=1'
where purchase_url = 'https://a.co/d/0eNxNJDK'
   or name ilike '%Cesto de Bambu%';

update public.gifts
set image_url = 'https://ws-na.amazon-adsystem.com/widgets/q?_encoding=UTF8&ASIN=B0DKM4TQ7Y&Format=_SL800_&ID=AsinImage&MarketPlace=BR&ServiceVersion=20070822&WS=1'
where purchase_url = 'https://a.co/d/0942pZ3k'
   or name ilike '%Xícara%';

update public.gifts
set image_url = 'https://ws-na.amazon-adsystem.com/widgets/q?_encoding=UTF8&ASIN=B0CFYRRWVL&Format=_SL800_&ID=AsinImage&MarketPlace=BR&ServiceVersion=20070822&WS=1'
where purchase_url = 'https://a.co/d/0d3GXViL'
   or name ilike '%Assadeiras%';

update public.gifts
set image_url = 'https://ws-na.amazon-adsystem.com/widgets/q?_encoding=UTF8&ASIN=B0BVX344FR&Format=_SL800_&ID=AsinImage&MarketPlace=BR&ServiceVersion=20070822&WS=1'
where purchase_url = 'https://a.co/d/0662YUHW'
   or name ilike '%Döhler%'
   or name ilike '%Dohler%';

update public.gifts
set image_url = 'https://ws-na.amazon-adsystem.com/widgets/q?_encoding=UTF8&ASIN=B0G6GF9741&Format=_SL800_&ID=AsinImage&MarketPlace=BR&ServiceVersion=20070822&WS=1'
where purchase_url = 'https://a.co/d/01BcJfzL'
   or name ilike '%Almofadas%';

update public.gifts
set image_url = 'https://ws-na.amazon-adsystem.com/widgets/q?_encoding=UTF8&ASIN=B0DPT3V2K6&Format=_SL800_&ID=AsinImage&MarketPlace=BR&ServiceVersion=20070822&WS=1'
where purchase_url = 'https://a.co/d/0acjYaMx'
   or name ilike '%Mantas%';

update public.gifts
set image_url = 'https://ws-na.amazon-adsystem.com/widgets/q?_encoding=UTF8&ASIN=B0GKPPK325&Format=_SL800_&ID=AsinImage&MarketPlace=BR&ServiceVersion=20070822&WS=1'
where purchase_url = 'https://a.co/d/0bqHUX9R'
   or name ilike '%Vasos Decorativos%'
   or name ilike '%Vazado%';

update public.gifts
set image_url = 'https://ws-na.amazon-adsystem.com/widgets/q?_encoding=UTF8&ASIN=B0F99HM6L4&Format=_SL800_&ID=AsinImage&MarketPlace=BR&ServiceVersion=20070822&WS=1'
where purchase_url = 'https://a.co/d/07EVWWVc'
   or name ilike '%Vaso Cone%';

update public.gifts
set image_url = 'https://ws-na.amazon-adsystem.com/widgets/q?_encoding=UTF8&ASIN=B0G583P6TN&Format=_SL800_&ID=AsinImage&MarketPlace=BR&ServiceVersion=20070822&WS=1'
where purchase_url = 'https://a.co/d/0jdsuG65'
   or name ilike '%Umidificador%';

update public.gifts
set image_url = 'https://ws-na.amazon-adsystem.com/widgets/q?_encoding=UTF8&ASIN=B0CX2W9W22&Format=_SL800_&ID=AsinImage&MarketPlace=BR&ServiceVersion=20070822&WS=1'
where purchase_url = 'https://a.co/d/0heMr4mU'
   or name ilike '%Porta Temperos%';

update public.gifts
set image_url = 'https://ws-na.amazon-adsystem.com/widgets/q?_encoding=UTF8&ASIN=B076MKTNRK&Format=_SL800_&ID=AsinImage&MarketPlace=BR&ServiceVersion=20070822&WS=1'
where purchase_url = 'https://a.co/d/00orRvWi'
   or name ilike '%Facas%';

update public.gifts
set image_url = 'https://ws-na.amazon-adsystem.com/widgets/q?_encoding=UTF8&ASIN=B0B5LL9MXB&Format=_SL800_&ID=AsinImage&MarketPlace=BR&ServiceVersion=20070822&WS=1'
where purchase_url = 'https://a.co/d/035dbqkh'
   or name ilike '%Taças%';

update public.gifts
set image_url = 'https://ws-na.amazon-adsystem.com/widgets/q?_encoding=UTF8&ASIN=B0CRY48NSK&Format=_SL800_&ID=AsinImage&MarketPlace=BR&ServiceVersion=20070822&WS=1'
where purchase_url = 'https://a.co/d/01z9fLEl'
   or name ilike '%Panelas Oster%';

update public.gifts
set image_url = 'https://ws-na.amazon-adsystem.com/widgets/q?_encoding=UTF8&ASIN=B0GT5XFDXD&Format=_SL800_&ID=AsinImage&MarketPlace=BR&ServiceVersion=20070822&WS=1'
where purchase_url = 'https://a.co/d/09iYsO5d'
   or name ilike '%Organizador de Pia%'
   or name ilike '%Escorredor%';

update public.gifts
set image_url = 'https://ws-na.amazon-adsystem.com/widgets/q?_encoding=UTF8&ASIN=B0GKGXZ5YB&Format=_SL800_&ID=AsinImage&MarketPlace=BR&ServiceVersion=20070822&WS=1'
where purchase_url = 'https://a.co/d/00GUFJ7f'
   or name ilike '%Lixeira Plástica%';

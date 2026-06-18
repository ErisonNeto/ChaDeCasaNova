-- Adiciona novos presentes enviados em 18/06/2026.
-- Este script não apaga reservas/escolhas existentes.
-- Ele adiciona apenas itens que ainda não existirem na tabela public.gifts.

begin;

insert into public.gifts (name, description, image_url, purchase_url, price, created_at)
select $$MONDIAL Passadeira a Vapor Portátil Fast Steam 1270W 110V VP-09$$,
       $$Passadeira a vapor portátil Mondial branca/azul, prática para desamassar roupas no dia a dia.$$,
       $$/gifts/37-passadeira-mondial.svg$$,
       $$https://www.amazon.com.br/Passadeira-Vapor-Port%C3%A1til-Mondial-Branco/dp/B0C59MB8V7/ref=sr_1_4?__mk_pt_BR=%C3%85M%C3%85%C5%BD%C3%95%C3%91&crid=3BM6GBKAW9YX0&dib=eyJ2IjoiMSJ9.NY3RjwHpLsBandsOBlRvMm5hxljwKTIWhJ7_co_4wvmbF-4uYgO6EVCGm_rlGUNOCuK5pvkWc9k0oK1oo9mYenbrBPJk3-ZqePji-yWGWE6S-gxS6NBWU3MW3E6It2Gd5g-VKEOLmnyPhvSovjcMzh_njhQYDyFa-zmaBciUQuNtmwjWcG5_dzcWOizT9Dt_scMxlM6hwSFj7pimCKwB5QC08OKxl5LSclB8EhvI1og.1mg2RLDrSRZiKFa-xpAVEfPxjSOwpJA9PpMbn9LwAhA&dib_tag=se&keywords=MONDIAL%2BPassadeira%2Ba%2BVapor%2BPort%C3%A1til%2BFast%2BSteam%2C%2BBranco%2FAzul%2C%2B1500W&qid=1781756550&s=home&sprefix=mondial%2Bpassadeira%2Ba%2Bvapor%2Bport%C3%A1til%2Bfast%2Bsteam%2Bbranco%2Fazul%2B1500w%2Chome%2C199&sr=1-4&ufe=app_do%3Aamzn1.fos.db68964d-7c0e-4bb2-a95c-e5cb9e32eb12&th=1$$,
       null,
       now() + interval '37 seconds'
where not exists (
  select 1
  from public.gifts existing
  where existing.purchase_url like $$%B0C59MB8V7%$$
     or lower(existing.name) like '%passadeira%mondial%'
     or lower(existing.name) like '%mondial%passadeira%'
     or lower(existing.name) like '%vp-09%'
);

insert into public.gifts (name, description, image_url, purchase_url, price, created_at)
select $$Conjunto de Utensílios de Cozinha 12 Peças Silicone e Madeira Cinza$$,
       $$Kit de utensílios de cozinha em silicone e madeira, resistente ao calor e com design ergonômico.$$,
       $$/gifts/38-utensilios-silicone-madeira.svg$$,
       $$https://a.co/d/05sx6WJj$$,
       null,
       now() + interval '38 seconds'
where not exists (
  select 1
  from public.gifts existing
  where existing.purchase_url = $$https://a.co/d/05sx6WJj$$
     or lower(existing.name) like '%utensílios%cozinha%12%'
     or lower(existing.name) like '%utensilios%cozinha%12%'
     or lower(existing.name) like '%silicone%madeira%'
);

insert into public.gifts (name, description, image_url, purchase_url, price, created_at)
select $$Brinox Jogo de Panelas 6 Peças Ceramic Life Sirius Vanilla$$,
       $$Jogo de panelas Brinox Ceramic Life Sirius com revestimento antiaderente, cor vanilla e base com indução.$$,
       $$/gifts/39-panelas-brinox-sirius.svg$$,
       $$https://www.brinox.com.br/jogo-de-panelas-brinox-antiaderente-ceramic-life-sirius-6-pecas-com-inducao-vanilla_4814101-1-4814101/p$$,
       null,
       now() + interval '39 seconds'
where not exists (
  select 1
  from public.gifts existing
  where existing.purchase_url = $$https://a.co/d/02DvEdTA$$
     or existing.purchase_url = $$https://www.brinox.com.br/jogo-de-panelas-brinox-antiaderente-ceramic-life-sirius-6-pecas-com-inducao-vanilla_4814101-1-4814101/p$$
     or (lower(existing.name) like '%jogo de panelas%' and lower(existing.name) like '%brinox%')
     or lower(existing.name) like '%ceramic life sirius%6%'
);

commit;

-- Atualiza links enviados em 18/06/2026.
-- Este script não apaga reservas/escolhas existentes.
-- Ele garante links de compra para itens já existentes e adiciona apenas o novo sousplat/jogo americano.

begin;

-- Links já existentes na lista: reforça no banco caso algum item tenha ficado sem purchase_url.
update public.gifts
set purchase_url = $$https://br.shp.ee/mvxoVpAV$$,
    price = 19.99
where lower(name) like '%garrafas acrílicas%'
   or lower(name) like '%garrafas acrilicas%'
   or lower(name) like '%caixa de leite%';

update public.gifts
set purchase_url = $$https://br.shp.ee/cAmWuCQs$$,
    price = 14.89
where lower(name) like '%porta-ovos%'
   or lower(name) like '%porta ovos%'
   or lower(name) like '%30 ovos%';

update public.gifts
set purchase_url = $$https://br.shp.ee/gss4q1du$$,
    price = 49.90
where lower(name) like '%boho chic%'
   or lower(name) like '%capas de almofada%';

update public.gifts
set purchase_url = $$https://share.google/ALV8MpoqlRIk1KS0u$$
where lower(name) like '%40 clips%'
   or lower(name) like '%roupas íntimas%'
   or lower(name) like '%roupas intimas%';

update public.gifts
set purchase_url = $$https://www.americanas.com.br/conjunto-de-copos-lights-6-pecas-nadir-27995564/p?idsku=6805161&sellerId=1&utm_source=YSMESP&utm_medium=buscappc&utm_campaign=alwayson-25&utm_content=bp_pl_px_go_fisico_aloc_pmax_aberto_alwayson-25_na_aon25-00482&utm_term=pla_pmax&gad_source=1&gad_campaignid=23355046229&gbraid=0AAAAAD37Vpo4RUOhvProBkszwCCOkIn5D$$
where lower(name) like '%nadir%'
   or lower(name) like '%lights%';

-- Novo item da lista.
insert into public.gifts (name, description, image_url, purchase_url, price, created_at)
select $$Kit 4 ou 6 Jogo Americano Sousplat Redondo 38cm$$,
       $$Jogo americano/sousplat redondo para mesa posta, cozinha e jantar, com 38cm.$$,
       $$/gifts/36-jogo-americano-sousplat.svg$$,
       $$https://br.shp.ee/SAcjAxAf$$,
       42.98,
       now() + interval '36 seconds'
where not exists (
  select 1
  from public.gifts existing
  where existing.purchase_url = $$https://br.shp.ee/SAcjAxAf$$
     or lower(existing.name) like '%jogo americano%'
     or lower(existing.name) like '%souplast%'
     or lower(existing.name) like '%sousplat%'
);

commit;

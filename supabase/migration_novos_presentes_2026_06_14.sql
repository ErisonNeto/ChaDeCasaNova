-- Novos presentes conferidos em 14/06/2026
-- Execute este arquivo no SQL Editor para adicionar apenas os itens novos, sem apagar reservas existentes.

begin;

insert into public.gifts (name, description, image_url, purchase_url, price, created_at)
select *
from (values
  ($$Jogo 6 Copos Albany Borda Dourada 400ml$$, $$Conjunto de 6 copos de vidro long drink, transparentes com borda dourada, para água e suco.$$, $$/gifts/30-copos-albany.svg$$, $$https://a.co/d/00tQhFB6$$, null, now() + interval '30 seconds'),
  ($$Garrafas Acrílicas Transparentes 1000ml Caixa de Leite$$, $$Garrafas estilo caixa de leite para geladeira, ideais para leite, suco, água, chá e bebidas.$$, $$/gifts/31-garrafas-acrilico.svg$$, $$https://br.shp.ee/mvxoVpAV$$, 19.99, now() + interval '31 seconds'),
  ($$Porta-Ovos Rolante 4 Andares Branco 30 Ovos$$, $$Organizador de ovos para geladeira com sistema rolante e capacidade para até 30 ovos.$$, $$/gifts/32-porta-ovos.svg$$, $$https://br.shp.ee/cAmWuCQs$$, 14.89, now() + interval '32 seconds'),
  ($$Kit 4 Capas de Almofada Boho Chic$$, $$Kit com 4 capas de almofada, sendo 2 lisas e 2 com detalhes em estilo boho elegante.$$, $$/gifts/33-capas-almofada-boho.svg$$, $$https://br.shp.ee/gss4q1du$$, 49.90, now() + interval '33 seconds'),
  ($$Varal de 40 Clips Inox Retrátil para Roupas Íntimas$$, $$Cabide varal com 40 prendedores em inox, prático para peças pequenas e roupas íntimas.$$, $$/gifts/34-varal-clips.svg$$, $$https://share.google/ALV8MpoqlRIk1KS0u$$, null, now() + interval '34 seconds'),
  ($$Jogo Copos Vidro Cristalino Nadir Lights 6 Peças$$, $$Conjunto de 6 copos de vidro cristalino Nadir Lights para uso diário e mesa posta.$$, $$/gifts/35-copos-lights-nadir.svg$$, $$https://www.americanas.com.br/conjunto-de-copos-lights-6-pecas-nadir-27995564/p?idsku=6805161&sellerId=1&utm_source=YSMESP&utm_medium=buscappc&utm_campaign=alwayson-25&utm_content=bp_pl_px_go_fisico_aloc_pmax_aberto_alwayson-25_na_aon25-00482&utm_term=pla_pmax&gad_source=1&gad_campaignid=23355046229&gbraid=0AAAAAD37Vpo4RUOhvProBkszwCCOkIn5D$$, null, now() + interval '35 seconds')
) as new_gifts(name, description, image_url, purchase_url, price, created_at)
where not exists (
  select 1
  from public.gifts existing
  where existing.purchase_url = new_gifts.purchase_url
);

commit;

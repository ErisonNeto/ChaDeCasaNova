-- Lista real de presentes | Chá de Casa Nova Jeyse e Erison
-- Execute este arquivo no SQL Editor do Supabase para substituir a lista atual.
-- Atenção: este script libera presentes e limpa escolhas já feitas, ideal para rodar antes de enviar o link aos convidados.

begin;

-- Libera escolhas anteriores para evitar vínculos com itens antigos.
update public.guests
set selected_gift_id = null,
    selected_at = null;

update public.gifts
set status = 'available',
    reserved_by_guest_id = null,
    reserved_at = null;

-- Remove a lista antiga de presentes.
delete from public.gifts;

-- Insere a lista oficial de presentes.
insert into public.gifts (name, description, image_url, purchase_url, price, created_at)
values
  ($$Air Fryer Forno Electrolux EAF85 12L 127V$$, $$Fritadeira elétrica sem óleo 5 em 1, digital, com bandeja antiaderente e receitas programadas.$$, $$https://m.media-amazon.com/images/P/B0FRH96P1G.01._AC_SL1500_.jpg$$, $$https://a.co/d/0hZJsPRh$$, null, now() + interval '1 seconds'),
  ($$Cesto de Bambu Ecológico 65L com Tampa$$, $$Cesto bege para lavanderia com tampa, alças e acabamento em fibra natural.$$, $$https://m.media-amazon.com/images/P/B0CLSGC1BV.01._AC_SL1500_.jpg$$, $$https://a.co/d/0eNxNJDK$$, null, now() + interval '2 seconds'),
  ($$Varal de Chão Secalux Ravenna 1,22m$$, $$Varal dobrável em aço com abas, prático para o dia a dia do novo lar.$$, $$https://loremflickr.com/900/700/clothes,drying,rack?lock=3003$$, $$https://share.google/RzoZZZKiTvwPg1riP$$, null, now() + interval '3 seconds'),
  ($$Conjunto Xícara de Café Ouro 12 Peças$$, $$Xícaras de porcelana chinesa 80ml para cafezinho e expresso.$$, $$https://m.media-amazon.com/images/P/B0GNWNXF1W.01._AC_SL1500_.jpg$$, $$https://a.co/d/0942pZ3k$$, null, now() + interval '4 seconds'),
  ($$Jogo de Jantar Cerâmica Naturalle 16 Peças Preto$$, $$Aparelho de jantar em cerâmica, elegante e moderno, ideal para receber com carinho.$$, $$https://loremflickr.com/900/700/black,dinnerware,ceramic?lock=3005$$, $$https://www.havan.com.br/aparelho-de-jantar-ceramica-naturalle-havan-casa-16-pecas-preto/p?shem=rimspwouoe$$, null, now() + interval '5 seconds'),
  ($$Sanduicheira Elétrica Cadence Click 750W SAN400$$, $$Sanduicheira elétrica compacta e prática para cafés e lanches rápidos.$$, $$https://loremflickr.com/900/700/sandwich,maker,kitchen?lock=3006$$, $$https://share.google/Krp1AXWt3dLta1XTj$$, null, now() + interval '6 seconds'),
  ($$Jogo de Cama Malha Camafeu Casal Preto$$, $$Jogo de cama de malha casal na cor preta, confortável e versátil.$$, $$https://loremflickr.com/900/700/black,bed,sheets,bedding?lock=3007$$, $$https://www.riachuelo.com.br/jogo-de-cama-camafeu-de-algod-o-casa-riachuelo-14957574_sku_sku_casal_preto?sku=15040593001&gad_source=1&gad_campaignid=17162640194&gbraid=0AAAAADr2JaygPtADy5MNctb6Nxw_a1Qhg&gclid=CjwKCAjwxITRBhBYEiwA6mZm7bfTeG6nB2Yw3UMhLyyrI0U_edV6AFzr_cvJQ_F2Ufi3k01o4G_IQBoCjNsQAvD_BwE&shem=rimspwouoe$$, null, now() + interval '7 seconds'),
  ($$Jogo de Cama Algodão 120 Fios Casal Rosa Claro$$, $$Roupa de cama casal em algodão 120 fios, delicada e aconchegante.$$, $$https://loremflickr.com/900/700/pink,bedding,bed,sheets?lock=3008$$, $$https://www.riachuelo.com.br/jogo-de-cama-king-algod-o-120-fios-cinza-casa-riachuelo-15280420001_sku_sku_casal_rosa-claro?sku=15040593001&gad_source=1&gad_campaignid=17162640194&gbraid=0AAAAADr2JaygPtADy5MNctb6Nxw_a1Qhg&gclid=CjwKCAjwxITRBhBYEiwA6mZm7bfTeG6nB2Yw3UMhLyyrI0U_edV6AFzr_cvJQ_F2Ufi3k01o4G_IQBoCjNsQAvD_BwE&shem=rimspwouoe$$, null, now() + interval '8 seconds'),
  ($$Jogo de Assadeiras Tramontina Starflon Max Rosa 2 Peças$$, $$Assadeiras antiaderentes Tramontina para preparar receitas com praticidade.$$, $$https://m.media-amazon.com/images/P/B0CFYRRWVL.01._AC_SL1500_.jpg$$, $$https://a.co/d/0d3GXViL$$, null, now() + interval '9 seconds'),
  ($$Kit 20 Cabides de Madeira Adulto Marfim$$, $$Cabides de madeira para organizar o closet com elegância e padrão.$$, $$https://loremflickr.com/900/700/wooden,hangers,closet?lock=3010$$, $$https://share.google/Aw9d4cibEK8RLadww$$, null, now() + interval '10 seconds'),
  ($$Jogo de Banho 4 Peças Romance Döhler Branco$$, $$Kit de toalhas 100% algodão, aveludadas, com fio penteado e acabamento delicado.$$, $$https://m.media-amazon.com/images/P/B0BVXLVGRN.01._AC_SL1500_.jpg$$, $$https://a.co/d/0662YUHW$$, null, now() + interval '11 seconds'),
  ($$Toalha Super Banho Karsten by Havan Casa Branco$$, $$Toalha super banho 100% algodão, macia e essencial para o novo lar.$$, $$https://loremflickr.com/900/700/white,bath,towel?lock=3012$$, $$https://www.havan.com.br/toalha-super-banho-100-algodao-karsten-by-havan-casa-branco/p?utm_source=share$$, null, now() + interval '12 seconds'),
  ($$Kit de Banheiro Completo Bambu 4 ou 6 Peças$$, $$Conjunto para lavabo com lixeira de tampa basculante e acabamento bambu.$$, $$https://loremflickr.com/900/700/bathroom,accessories,bamboo?lock=3013$$, $$https://br.shp.ee/aiprBWhB$$, 69.26, now() + interval '13 seconds'),
  ($$Kit 13 Potes Herméticos com Tampa de Bambu$$, $$Potes para mantimentos, ideais para organizar a cozinha e a despensa.$$, $$https://loremflickr.com/900/700/kitchen,storage,jars,bamboo?lock=3014$$, $$https://br.shp.ee/FVCmjM47$$, 62.90, now() + interval '14 seconds'),
  ($$Kit 4 Almofadas Decorativas Sofá Luxo Premium$$, $$Almofadas decorativas para deixar a sala mais aconchegante e elegante.$$, $$https://m.media-amazon.com/images/P/B0G6GF9741.01._AC_SL1500_.jpg$$, $$https://a.co/d/01BcJfzL$$, null, now() + interval '15 seconds'),
  ($$Kit 2 Mantas Decorativas Verde Oliva e Cru$$, $$Mantas para sofá, poltronas ou cama, em tons suaves e acolhedores.$$, $$https://m.media-amazon.com/images/P/B0DPT3V2K6.01._AC_SL1500_.jpg$$, $$https://a.co/d/0acjYaMx$$, null, now() + interval '16 seconds'),
  ($$Trio de Vasos Decorativos Vazado Nude$$, $$Conjunto de vasos modernos para compor a decoração da sala com sofisticação.$$, $$https://m.media-amazon.com/images/P/B0GKPQ7315.01._AC_SL1500_.jpg$$, $$https://a.co/d/0bqHUX9R$$, null, now() + interval '17 seconds'),
  ($$Vaso Cone Bege 15cm$$, $$Vaso decorativo bege para trazer charme e leveza aos ambientes.$$, $$https://m.media-amazon.com/images/P/B0F99HM6L4.01._AC_SL1500_.jpg$$, $$https://a.co/d/07EVWWVc$$, null, now() + interval '18 seconds'),
  ($$Umidificador Ultrassônico USB Madeira 7 Cores$$, $$Difusor aromatizador com visual amadeirado e LED, perfeito para ambientes aconchegantes.$$, $$https://m.media-amazon.com/images/P/B08SXS57Q7.01._AC_SL1500_.jpg$$, $$https://a.co/d/0jdsuG65$$, null, now() + interval '19 seconds'),
  ($$Tábua de Corte de Mármore para Carne$$, $$Tábua de mármore resistente e elegante para preparo e apoio na cozinha.$$, $$https://loremflickr.com/900/700/marble,cutting,board,kitchen?lock=3020$$, $$https://produto.mercadolivre.com.br/MLB-6544742356-tabua-de-corte-de-marmore-para-carne-_JM?matt_tool=38524122#origin=share&sid=share&action=whatsapp$$, null, now() + interval '20 seconds'),
  ($$Processador de Alimentos Electrolux EFP500 3 em 1 127V$$, $$Processador de alimentos Efficient 3 em 1 para facilitar o preparo das receitas.$$, $$https://loremflickr.com/900/700/food,processor,kitchen,appliance?lock=3021$$, $$https://www.google.com/search?q=Processador+de+Alimentos+3+em+1+Electrolux+Efficient+(EFP500)+127V&ibp=oshop&hl=pt-BR&gl=br&prds=catalogid:5738480336635671527,gpcid:1975862656171998401,productid:8283256800018731152,imageDocid:17871872922977174928,headlineOfferDocid:12180858613389176083,mid:576462852948111329,pvt:hg,sori:0,mno:5,rds:PC_1975862656171998401%7CPROD_PC_1975862656171998401,pvo:25,pvcb:0&pvorigin=25&shem=pvflt,rimspwouoe&shndl=37&shmd=H4sIAAAAAAAA_7XMTQ7BQBgA0LDUG1h9Sxa0iJQmItVUmwpRiZ-yUTNThrZD51NiZe-KPQyXsH7Jq3zKldE8E4RJGVKRAWVgxjxhKQoJHWAJtMCOGcFMxPcn2FHECf8p1OzxvKtpdWi19VV1d0K8GqqKWvMoMUROmkQkKk_CI5PD2wAPqWHOaN8hvmV2eu4kjfO17jx0ebnKGdUbPsuD4LVYWlnquf52QpmjTc_ouZ5l_DPfFMq-UJ6F8i4Vyhd0dTsUDgEAAA&shmds=v1_ATWGeeMQD_4jOsTB3gzOFSt_KxFPIVGTI-sDBjYQTD-f1-rNyg&source=sh/x/prdct/hdr/m1/5&kgs=c444b7df75fa4a59&utm_source=pvflt,rimspwouoe,sh/x/prdct/hdr/m1/5$$, null, now() + interval '21 seconds'),
  ($$Porta Temperos Giratório com 12 Potes de Vidro$$, $$Organizador de condimentos com potes de vidro, tampa inox e suporte giratório preto.$$, $$https://m.media-amazon.com/images/P/B0GPR1VZN6.01._AC_SL1500_.jpg$$, $$https://a.co/d/0heMr4mU$$, null, now() + interval '22 seconds'),
  ($$Jogo de Facas Tramontina Plenus Branco 6 Peças$$, $$Conjunto de facas Tramontina para equipar a cozinha com praticidade.$$, $$https://m.media-amazon.com/images/P/B076MKTNRK.01._AC_SL1500_.jpg$$, $$https://a.co/d/00orRvWi$$, null, now() + interval '23 seconds'),
  ($$Jogo de 6 Taças para Vinho Branco Xtra 360ml$$, $$Taças em cristal ecológico para compor a mesa em momentos especiais.$$, $$https://m.media-amazon.com/images/P/B0B5LL9MXB.01._AC_SL1500_.jpg$$, $$https://a.co/d/035dbqkh$$, null, now() + interval '24 seconds'),
  ($$Frigideira de Indução Brinox Sirius 20cm Vanilla$$, $$Frigideira antiaderente Ceramic Life, compatível com indução, na cor vanilla.$$, $$https://loremflickr.com/900/700/ceramic,frying,pan,kitchen?lock=3025$$, $$https://www.brinox.com.br/frigideira-de-inducao-brinox-sirius-antiaderente-ceramic-life-%C3%B8-20-cm-1-litro-vanilla-4814354/p$$, null, now() + interval '25 seconds'),
  ($$Jogo de Panelas Oster Marble Edition Cream 4 Peças$$, $$Panelas e leiteira com revestimento cerâmico antiaderente, alças antitérmicas e base para indução.$$, $$https://m.media-amazon.com/images/P/B0CRY48NSK.01._AC_SL1500_.jpg$$, $$https://a.co/d/01z9fLEl$$, null, now() + interval '26 seconds'),
  ($$Organizador de Pia e Escorredor de Louça Suspenso 65cm$$, $$Escorredor premium suspenso para organizar a pia da cozinha com mais espaço.$$, $$https://m.media-amazon.com/images/P/B0CQT38866.01._AC_SL1500_.jpg$$, $$https://a.co/d/09iYsO5d$$, null, now() + interval '27 seconds'),
  ($$Faqueiro Tramontina Malibu Inox 42 Peças$$, $$Faqueiro em aço inox para completar a mesa posta do novo lar.$$, $$https://loremflickr.com/900/700/flatware,cutlery,set?lock=3028$$, $$https://www.havan.com.br/faqueiro-aco-inox-malibu-42-pecas-tramontina-prata/p?utm_source=share$$, null, now() + interval '28 seconds'),
  ($$Lixeira Plástica 10L Fly Paramount com Pedal Creme$$, $$Lixeira com tampa acionada por pedal, ideal para banheiro, cozinha ou lavabo.$$, $$https://m.media-amazon.com/images/P/B0GKGXZ5YB.01._AC_SL1500_.jpg$$, $$https://a.co/d/00GUFJ7f$$, null, now() + interval '29 seconds');

commit;

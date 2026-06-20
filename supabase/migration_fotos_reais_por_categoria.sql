-- Atualiza imagens dos presentes para fotos reais/coerentes com o título.
-- Pode rodar sem apagar convidados, reservas ou escolhas.

update public.gifts set image_url = 'https://m.media-amazon.com/images/P/B0FRH96P1G.01._AC_SL1500_.jpg' where name ilike '%Air Fryer%';
update public.gifts set image_url = 'https://m.media-amazon.com/images/P/B0CLSGC1BV.01._AC_SL1500_.jpg' where name ilike '%Cesto de Bambu%';
update public.gifts set image_url = 'https://loremflickr.com/900/700/clothes,drying,rack?lock=3003' where name ilike '%Varal%';
update public.gifts set image_url = 'https://m.media-amazon.com/images/P/B0GNWNXF1W.01._AC_SL1500_.jpg' where name ilike '%Xícara%';
update public.gifts set image_url = 'https://loremflickr.com/900/700/black,dinnerware,ceramic?lock=3005' where name ilike '%Jogo de Jantar%';
update public.gifts set image_url = 'https://loremflickr.com/900/700/sandwich,maker,kitchen?lock=3006' where name ilike '%Sanduicheira%';
update public.gifts set image_url = 'https://loremflickr.com/900/700/black,bed,sheets,bedding?lock=3007' where name ilike '%Cama Malha%';
update public.gifts set image_url = 'https://loremflickr.com/900/700/pink,bedding,bed,sheets?lock=3008' where name ilike '%Cama Algodão%';
update public.gifts set image_url = 'https://m.media-amazon.com/images/P/B0CFYRRWVL.01._AC_SL1500_.jpg' where name ilike '%Assadeiras%';
update public.gifts set image_url = 'https://loremflickr.com/900/700/wooden,hangers,closet?lock=3010' where name ilike '%Cabides%';
update public.gifts set image_url = 'https://m.media-amazon.com/images/P/B0BVXLVGRN.01._AC_SL1500_.jpg' where name ilike '%Banho%';
update public.gifts set image_url = 'https://loremflickr.com/900/700/white,bath,towel?lock=3012' where name ilike '%Toalha%';
update public.gifts set image_url = 'https://loremflickr.com/900/700/bathroom,accessories,bamboo?lock=3013' where name ilike '%Banheiro%';
update public.gifts set image_url = 'https://loremflickr.com/900/700/kitchen,storage,jars,bamboo?lock=3014' where name ilike '%Potes%';
update public.gifts set image_url = 'https://m.media-amazon.com/images/P/B0G6GF9741.01._AC_SL1500_.jpg' where name ilike '%Almofadas%';
update public.gifts set image_url = 'https://m.media-amazon.com/images/P/B0DPT3V2K6.01._AC_SL1500_.jpg' where name ilike '%Mantas%';
update public.gifts set image_url = 'https://m.media-amazon.com/images/P/B0GKPQ7315.01._AC_SL1500_.jpg' where name ilike '%Vasos Decorativos%' or name ilike '%Trio de Vasos%';
update public.gifts set image_url = 'https://m.media-amazon.com/images/P/B0F99HM6L4.01._AC_SL1500_.jpg' where name ilike '%Vaso Cone%';
update public.gifts set image_url = 'https://m.media-amazon.com/images/P/B08SXS57Q7.01._AC_SL1500_.jpg' where name ilike '%Umidificador%';
update public.gifts set image_url = 'https://loremflickr.com/900/700/marble,cutting,board,kitchen?lock=3020' where name ilike '%Tábua%';
update public.gifts set image_url = 'https://loremflickr.com/900/700/food,processor,kitchen,appliance?lock=3021' where name ilike '%Processador%';
update public.gifts set image_url = 'https://m.media-amazon.com/images/P/B0GPR1VZN6.01._AC_SL1500_.jpg' where name ilike '%Porta Temperos%';
update public.gifts set image_url = 'https://m.media-amazon.com/images/P/B076MKTNRK.01._AC_SL1500_.jpg' where name ilike '%Facas%';
update public.gifts set image_url = 'https://m.media-amazon.com/images/P/B0B5LL9MXB.01._AC_SL1500_.jpg' where name ilike '%Taças%';
update public.gifts set image_url = 'https://loremflickr.com/900/700/ceramic,frying,pan,kitchen?lock=3025' where name ilike '%Frigideira%';
update public.gifts set image_url = 'https://m.media-amazon.com/images/P/B0CRY48NSK.01._AC_SL1500_.jpg' where name ilike '%Panelas Oster%';
update public.gifts set image_url = 'https://m.media-amazon.com/images/P/B0CQT38866.01._AC_SL1500_.jpg' where name ilike '%Organizador de Pia%' or name ilike '%Escorredor%';
update public.gifts set image_url = 'https://loremflickr.com/900/700/flatware,cutlery,set?lock=3028' where name ilike '%Faqueiro%';
update public.gifts set image_url = 'https://m.media-amazon.com/images/P/B0GKGXZ5YB.01._AC_SL1500_.jpg' where name ilike '%Lixeira%';

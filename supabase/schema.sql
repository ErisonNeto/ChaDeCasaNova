-- Lista de Presentes | Chá de Casa Nova Premium
-- Execute este arquivo no SQL Editor do Supabase.

create extension if not exists pgcrypto;

-- Tipos
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'gift_status') THEN
    CREATE TYPE public.gift_status AS ENUM ('available', 'reserved');
  END IF;
END $$;

-- Tabelas
create table if not exists public.gifts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  image_url text,
  purchase_url text,
  price numeric(10,2),
  status public.gift_status not null default 'available',
  reserved_by_guest_id uuid,
  reserved_at timestamptz,
  created_at timestamptz not null default now(),
  constraint gifts_price_positive check (price is null or price >= 0),
  constraint gifts_reservation_consistency check (
    (status = 'available' and reserved_by_guest_id is null and reserved_at is null)
    or
    (status = 'reserved' and reserved_by_guest_id is not null and reserved_at is not null)
  )
);

create table if not exists public.guests (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text,
  group_name text not null default 'Familiares',
  invite_status text not null default 'pending',
  has_accessed boolean not null default false,
  selected_gift_id uuid,
  selected_at timestamptz,
  created_at timestamptz not null default now(),
  constraint guests_name_not_blank check (length(trim(full_name)) >= 3),
  constraint guests_invite_status_check check (invite_status in ('confirmed', 'pending')),
  constraint guests_selection_consistency check (
    (selected_gift_id is null and selected_at is null)
    or
    (selected_gift_id is not null and selected_at is not null)
  )
);

create table if not exists public.admin_settings (
  id uuid primary key default gen_random_uuid(),
  event_title text not null default 'Chá de Casa Nova',
  welcome_message text not null default 'Escolha com carinho um presente para fazer parte do nosso novo lar.',
  couple_name text,
  event_date date,
  allow_multiple_gifts_per_guest boolean not null default false,
  theme_color text default '#B96F68',
  created_at timestamptz not null default now()
);

-- Relacionamentos
alter table public.gifts
  drop constraint if exists gifts_reserved_by_guest_id_fkey,
  add constraint gifts_reserved_by_guest_id_fkey
  foreign key (reserved_by_guest_id)
  references public.guests(id)
  on delete set null;

alter table public.guests
  drop constraint if exists guests_selected_gift_id_fkey,
  add constraint guests_selected_gift_id_fkey
  foreign key (selected_gift_id)
  references public.gifts(id)
  on delete set null;

-- Índices e unicidade

-- Recomendado para permitir acesso por nome sem ambiguidade.
create unique index if not exists guests_full_name_unique_lower_idx
  on public.guests (lower(trim(regexp_replace(full_name, '\s+', ' ', 'g'))));

-- Um convidado só pode escolher um presente.
create unique index if not exists guests_selected_gift_unique_idx
  on public.guests (selected_gift_id)
  where selected_gift_id is not null;

-- Um presente só pode estar reservado por um convidado.
create unique index if not exists gifts_reserved_by_guest_unique_idx
  on public.gifts (reserved_by_guest_id)
  where reserved_by_guest_id is not null;

create index if not exists gifts_status_idx on public.gifts(status);
create index if not exists gifts_created_at_idx on public.gifts(created_at desc);
create index if not exists guests_accessed_idx on public.guests(has_accessed);
create index if not exists guests_group_name_idx on public.guests(group_name);
create index if not exists guests_invite_status_idx on public.guests(invite_status);
create index if not exists guests_selected_at_idx on public.guests(selected_at desc);

-- Configuração inicial
insert into public.admin_settings (event_title, welcome_message, couple_name, event_date, theme_color)
select 'Chá de Casa Nova', 'Escolha com carinho um presente para fazer parte do nosso novo lar.', 'Jeyse e Erison', '2026-06-14', '#B96F68'
where not exists (select 1 from public.admin_settings);

-- Função para autenticar convidado pelo nome cadastrado.
create or replace function public.authenticate_guest(p_access_text text)
returns table (
  guest_id uuid,
  full_name text,
  selected_gift_id uuid,
  selected_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_guest public.guests%rowtype;
  v_input text;
begin
  v_input := lower(trim(regexp_replace(coalesce(p_access_text, ''), '\s+', ' ', 'g')));

  if v_input = '' then
    return;
  end if;

  select g.*
    into v_guest
  from public.guests g
  where lower(trim(regexp_replace(g.full_name, '\s+', ' ', 'g'))) = v_input
  limit 1;

  if not found then
    return;
  end if;

  update public.guests g
     set has_accessed = true
   where g.id = v_guest.id
  returning g.* into v_guest;

  return query
  select v_guest.id, v_guest.full_name, v_guest.selected_gift_id, v_guest.selected_at;
end;
$$;

-- Função segura para reservar presente.
-- Ela usa SELECT ... FOR UPDATE para evitar corrida entre duas pessoas tentando escolher ao mesmo tempo.
create or replace function public.claim_gift(p_guest_id uuid, p_gift_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_guest public.guests%rowtype;
  v_gift public.gifts%rowtype;
begin
  select g.*
    into v_guest
  from public.guests g
  where g.id = p_guest_id
  for update;

  if not found then
    return jsonb_build_object('success', false, 'message', 'Convidado não encontrado.');
  end if;

  if v_guest.selected_gift_id is not null then
    return jsonb_build_object('success', false, 'message', 'Você já escolheu um presente.');
  end if;

  select gf.*
    into v_gift
  from public.gifts gf
  where gf.id = p_gift_id
  for update;

  if not found then
    return jsonb_build_object('success', false, 'message', 'Presente não encontrado.');
  end if;

  if v_gift.status <> 'available' or v_gift.reserved_by_guest_id is not null then
    return jsonb_build_object('success', false, 'message', 'Esse presente acabou de ser escolhido por outro convidado.');
  end if;

  update public.gifts gf
     set status = 'reserved',
         reserved_by_guest_id = v_guest.id,
         reserved_at = now()
   where gf.id = v_gift.id;

  update public.guests g
     set selected_gift_id = v_gift.id,
         selected_at = now()
   where g.id = v_guest.id;

  return jsonb_build_object(
    'success', true,
    'message', 'Presente reservado com sucesso.',
    'gift_id', v_gift.id,
    'guest_id', v_guest.id
  );
exception
  when unique_violation then
    return jsonb_build_object('success', false, 'message', 'Esse presente já foi reservado. Escolha outro item.');
  when others then
    return jsonb_build_object('success', false, 'message', 'Não foi possível reservar agora. Tente novamente.');
end;
$$;

-- Função administrativa para cancelar escolha e liberar presente.
create or replace function public.release_gift(p_gift_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_gift public.gifts%rowtype;
begin
  if auth.role() <> 'authenticated' then
    return jsonb_build_object('success', false, 'message', 'Apenas administradores autenticados podem liberar presentes.');
  end if;

  select gf.*
    into v_gift
  from public.gifts gf
  where gf.id = p_gift_id
  for update;

  if not found then
    return jsonb_build_object('success', false, 'message', 'Presente não encontrado.');
  end if;

  if v_gift.reserved_by_guest_id is not null then
    update public.guests g
       set selected_gift_id = null,
           selected_at = null
     where g.id = v_gift.reserved_by_guest_id;
  end if;

  update public.gifts gf
     set status = 'available',
         reserved_by_guest_id = null,
         reserved_at = null
   where gf.id = p_gift_id;

  return jsonb_build_object('success', true, 'message', 'Presente liberado com sucesso.');
end;
$$;

-- Row Level Security
alter table public.gifts enable row level security;
alter table public.guests enable row level security;
alter table public.admin_settings enable row level security;

-- Limpeza defensiva de policies para reexecutar o script sem duplicar.
drop policy if exists "Public can read gifts" on public.gifts;
drop policy if exists "Admins can manage gifts" on public.gifts;
drop policy if exists "Admins can manage guests" on public.guests;
drop policy if exists "Public can read admin settings" on public.admin_settings;
drop policy if exists "Admins can manage admin settings" on public.admin_settings;

create policy "Public can read gifts"
  on public.gifts
  for select
  to anon, authenticated
  using (true);

create policy "Admins can manage gifts"
  on public.gifts
  for all
  to authenticated
  using (true)
  with check (true);

create policy "Admins can manage guests"
  on public.guests
  for all
  to authenticated
  using (true)
  with check (true);

create policy "Public can read admin settings"
  on public.admin_settings
  for select
  to anon, authenticated
  using (true);

create policy "Admins can manage admin settings"
  on public.admin_settings
  for all
  to authenticated
  using (true)
  with check (true);

-- Permissões
revoke all on public.guests from anon;
grant select on public.gifts to anon, authenticated;
grant select on public.admin_settings to anon, authenticated;
grant all on public.gifts to authenticated;
grant all on public.guests to authenticated;
grant all on public.admin_settings to authenticated;
grant execute on function public.authenticate_guest(text) to anon, authenticated;
grant execute on function public.claim_gift(uuid, uuid) to anon, authenticated;
grant execute on function public.release_gift(uuid) to authenticated;

-- Realtime para atualizar a lista quando alguém reservar.
do $$
begin
  begin
    alter publication supabase_realtime add table public.gifts;
  exception
    when duplicate_object then null;
    when undefined_object then null;
  end;
end $$;

-- Seeds opcionais para testar rapidamente.
-- Apague ou altere depois.
insert into public.gifts (name, description, image_url, purchase_url, price, created_at)
select * from (values
  ($$Air Fryer Forno Electrolux EAF85 12L 127V$$, $$Fritadeira elétrica sem óleo 5 em 1, digital, com bandeja antiaderente e receitas programadas.$$, $$https://m.media-amazon.com/images/I/51zqocFSQSL._AC_SX679_.jpg$$, $$https://a.co/d/0hZJsPRh$$, null, now() + interval '1 seconds'),
  ($$Cesto de Bambu Ecológico 65L com Tampa$$, $$Cesto bege para lavanderia com tampa, alças e acabamento em fibra natural.$$, $$https://m.media-amazon.com/images/I/71+gPoidGrL._AC_SX679_.jpg$$, $$https://a.co/d/0eNxNJDK$$, null, now() + interval '2 seconds'),
  ($$Varal de Chão Secalux Ravenna 1,22m$$, $$Varal dobrável em aço com abas, prático para o dia a dia do novo lar.$$, $$/gifts/03-varal.svg$$, $$https://share.google/RzoZZZKiTvwPg1riP$$, null, now() + interval '3 seconds'),
  ($$Conjunto Xícara de Café Ouro 12 Peças$$, $$Xícaras de porcelana chinesa 80ml para cafezinho e expresso.$$, $$https://m.media-amazon.com/images/I/61qHZLXZJOL._AC_SX679_.jpg$$, $$https://a.co/d/0942pZ3k$$, null, now() + interval '4 seconds'),
  ($$Jogo de Jantar Cerâmica Naturalle 16 Peças Preto$$, $$Aparelho de jantar em cerâmica, elegante e moderno, ideal para receber com carinho.$$, $$/gifts/05-jogo-jantar.svg$$, $$https://www.havan.com.br/aparelho-de-jantar-ceramica-naturalle-havan-casa-16-pecas-preto/p?shem=rimspwouoe$$, null, now() + interval '5 seconds'),
  ($$Sanduicheira Elétrica Cadence Click 750W SAN400$$, $$Sanduicheira elétrica compacta e prática para cafés e lanches rápidos.$$, $$https://m.magazineluiza.com.br/a-static/420x420/sanduicheira-eletrica-cadence-click-750w-san400/magazineluiza/238024800/35ae650cc4bababf411676e2346bc871.jpg$$, $$https://share.google/Krp1AXWt3dLta1XTj$$, null, now() + interval '6 seconds'),
  ($$Jogo de Cama Malha Camafeu Casal Preto$$, $$Jogo de cama de malha casal na cor preta, confortável e versátil.$$, $$https://static.riachuelo.com.br/RCHLO/15040585001/portrait/fa193f29a524aeee0a61fb64cf00778af07174ad.jpg?imwidth=400$$, $$https://www.riachuelo.com.br/jogo-de-cama-camafeu-de-algod-o-casa-riachuelo-14957574_sku_sku_casal_preto?sku=15040593001&gad_source=1&gad_campaignid=17162640194&gbraid=0AAAAADr2JaygPtADy5MNctb6Nxw_a1Qhg&gclid=CjwKCAjwxITRBhBYEiwA6mZm7bfTeG6nB2Yw3UMhLyyrI0U_edV6AFzr_cvJQ_F2Ufi3k01o4G_IQBoCjNsQAvD_BwE&shem=rimspwouoe$$, null, now() + interval '7 seconds'),
  ($$Jogo de Cama Algodão 120 Fios Casal Rosa Claro$$, $$Roupa de cama casal em algodão 120 fios, delicada e aconchegante.$$, $$https://static.riachuelo.com.br/RCHLO/15280497001/portrait/a0bdd00270735d60b3371c36f9e2a09a002947b6.jpg?imwidth=400$$, $$https://www.riachuelo.com.br/jogo-de-cama-king-algod-o-120-fios-cinza-casa-riachuelo-15280420001_sku_sku_casal_rosa-claro?sku=15040593001&gad_source=1&gad_campaignid=17162640194&gbraid=0AAAAADr2JaygPtADy5MNctb6Nxw_a1Qhg&gclid=CjwKCAjwxITRBhBYEiwA6mZm7bfTeG6nB2Yw3UMhLyyrI0U_edV6AFzr_cvJQ_F2Ufi3k01o4G_IQBoCjNsQAvD_BwE&shem=rimspwouoe$$, null, now() + interval '8 seconds'),
  ($$Jogo de Assadeiras Tramontina Starflon Max Rosa 2 Peças$$, $$Assadeiras antiaderentes Tramontina para preparar receitas com praticidade.$$, $$https://m.media-amazon.com/images/I/910R9JeEghL._AC_SX679_.jpg$$, $$https://a.co/d/0d3GXViL$$, null, now() + interval '9 seconds'),
  ($$Kit 20 Cabides de Madeira Adulto Marfim$$, $$Cabides de madeira para organizar o closet com elegância e padrão.$$, $$https://a-static.mlcdn.com.br/420x420/kit-20-cabide-de-madeira-adulto-marfim-organizador-closet-gancho-giratorio-kontuz-home/nawebutilidade/cabmd120/8eef5f27f8fd97a1a4487a9848516f1f.jpeg$$, $$https://share.google/Aw9d4cibEK8RLadww$$, null, now() + interval '10 seconds'),
  ($$Jogo de Banho 4 Peças Romance Döhler Branco$$, $$Kit de toalhas 100% algodão, aveludadas, com fio penteado e acabamento delicado.$$, $$https://m.media-amazon.com/images/I/61dz-QrP1hL._AC_SX679_.jpg$$, $$https://a.co/d/0662YUHW$$, null, now() + interval '11 seconds'),
  ($$Toalha Super Banho Karsten by Havan Casa Branco$$, $$Toalha super banho 100% algodão, macia e essencial para o novo lar.$$, $$https://www.havan.com.br/media/catalog/product/cache/820af7facfa7aca6eb3c138e3457dc8d/t/o/toalha-super-banho-100-algodao-karsten-by-havan-casa_1221961.webp$$, $$https://www.havan.com.br/toalha-super-banho-100-algodao-karsten-by-havan-casa-branco/p?utm_source=share$$, null, now() + interval '12 seconds'),
  ($$Kit de Banheiro Completo Bambu 4 ou 6 Peças$$, $$Conjunto para lavabo com lixeira de tampa basculante e acabamento bambu.$$, $$https://down-br.img.susercontent.com/file/br-11134207-7r98o-m8ayedf0fle9fa.webp$$, $$https://br.shp.ee/aiprBWhB$$, 69.26, now() + interval '13 seconds'),
  ($$Kit 13 Potes Herméticos com Tampa de Bambu$$, $$Potes para mantimentos, ideais para organizar a cozinha e a despensa.$$, $$https://down-br.img.susercontent.com/file/br-11134207-820lr-mo1hirbgm2v47a@resize_w900_nl.webp$$, $$https://br.shp.ee/FVCmjM47$$, 62.90, now() + interval '14 seconds'),
  ($$Kit 4 Almofadas Decorativas Sofá Luxo Premium$$, $$Almofadas decorativas para deixar a sala mais aconchegante e elegante.$$, $$https://m.media-amazon.com/images/I/515OJd357RL._AC_.jpg$$, $$https://a.co/d/01BcJfzL$$, null, now() + interval '15 seconds'),
  ($$Kit 2 Mantas Decorativas Verde Oliva e Cru$$, $$Mantas para sofá, poltronas ou cama, em tons suaves e acolhedores.$$, $$https://m.media-amazon.com/images/I/91f9Q7ac20L._AC_SX679_.jpg$$, $$https://a.co/d/0acjYaMx$$, null, now() + interval '16 seconds'),
  ($$Trio de Vasos Decorativos Vazado Nude$$, $$Conjunto de vasos modernos para compor a decoração da sala com sofisticação.$$, $$https://m.media-amazon.com/images/I/41f2ogWyVoL._AC_SX679_.jpg$$, $$https://a.co/d/0bqHUX9R$$, null, now() + interval '17 seconds'),
  ($$Vaso Cone Bege 15cm$$, $$Vaso decorativo bege para trazer charme e leveza aos ambientes.$$, $$https://m.media-amazon.com/images/I/619ADvuUI7L._AC_SX679_.jpg$$, $$https://a.co/d/07EVWWVc$$, null, now() + interval '18 seconds'),
  ($$Umidificador Ultrassônico USB Madeira 7 Cores$$, $$Difusor aromatizador com visual amadeirado e LED, perfeito para ambientes aconchegantes.$$, $$https://m.media-amazon.com/images/I/61+wXb+0sVL._AC_SY300_SX300_QL70_ML2_.jpg$$, $$https://a.co/d/0jdsuG65$$, null, now() + interval '19 seconds'),
  ($$Tábua de Corte de Mármore para Carne$$, $$Tábua de mármore resistente e elegante para preparo e apoio na cozinha.$$, $$https://http2.mlstatic.com/D_NQ_NP_2X_965104-CBT109877861855_032026-F-tabua-de-corte-de-marmore-para-carne.webp$$, $$https://produto.mercadolivre.com.br/MLB-6544742356-tabua-de-corte-de-marmore-para-carne-_JM?matt_tool=38524122#origin=share&sid=share&action=whatsapp$$, null, now() + interval '20 seconds'),
  ($$Processador de Alimentos Electrolux EFP500 3 em 1 127V$$, $$Processador de alimentos Efficient 3 em 1 para facilitar o preparo das receitas.$$, $$https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcT6MaRlld2p5ndh9b50HMrNgoJ4cNPLSfeKUg4gbSrJaXTikoQXVAS0mgpbeA37VDGuKXOFHRbvF343BUvGjxrme5CoQAU8rm_98KnH0U3J6F9xdV-Dqy4vh4A$$, $$https://www.google.com/search?q=Processador+de+Alimentos+3+em+1+Electrolux+Efficient+(EFP500)+127V&ibp=oshop&hl=pt-BR&gl=br&prds=catalogid:5738480336635671527,gpcid:1975862656171998401,productid:8283256800018731152,imageDocid:17871872922977174928,headlineOfferDocid:12180858613389176083,mid:576462852948111329,pvt:hg,sori:0,mno:5,rds:PC_1975862656171998401%7CPROD_PC_1975862656171998401,pvo:25,pvcb:0&pvorigin=25&shem=pvflt,rimspwouoe&shndl=37&shmd=H4sIAAAAAAAA_7XMTQ7BQBgA0LDUG1h9Sxa0iJQmItVUmwpRiZ-yUTNThrZD51NiZe-KPQyXsH7Jq3zKldE8E4RJGVKRAWVgxjxhKQoJHWAJtMCOGcFMxPcn2FHECf8p1OzxvKtpdWi19VV1d0K8GqqKWvMoMUROmkQkKk_CI5PD2wAPqWHOaN8hvmV2eu4kjfO17jx0ebnKGdUbPsuD4LVYWlnquf52QpmjTc_ouZ5l_DPfFMq-UJ6F8i4Vyhd0dTsUDgEAAA&shmds=v1_ATWGeeMQD_4jOsTB3gzOFSt_KxFPIVGTI-sDBjYQTD-f1-rNyg&source=sh/x/prdct/hdr/m1/5&kgs=c444b7df75fa4a59&utm_source=pvflt,rimspwouoe,sh/x/prdct/hdr/m1/5$$, null, now() + interval '21 seconds'),
  ($$Porta Temperos Giratório com 12 Potes de Vidro$$, $$Organizador de condimentos com potes de vidro, tampa inox e suporte giratório preto.$$, $$https://m.media-amazon.com/images/I/71-hYCSxNUL._AC_SY300_SX300_QL70_ML2_.jpg$$, $$https://a.co/d/0heMr4mU$$, null, now() + interval '22 seconds'),
  ($$Jogo de Facas Tramontina Plenus Branco 6 Peças$$, $$Conjunto de facas Tramontina para equipar a cozinha com praticidade.$$, $$https://m.media-amazon.com/images/I/61hxcu7jkjL._AC_SX679_.jpg$$, $$https://a.co/d/00orRvWi$$, null, now() + interval '23 seconds'),
  ($$Jogo de 6 Taças para Vinho Branco Xtra 360ml$$, $$Taças em cristal ecológico para compor a mesa em momentos especiais.$$, $$https://m.media-amazon.com/images/I/61HfgRQP81L._AC_SX679_.jpg$$, $$https://a.co/d/035dbqkh$$, null, now() + interval '24 seconds'),
  ($$Frigideira de Indução Brinox Sirius 20cm Vanilla$$, $$Frigideira antiaderente Ceramic Life, compatível com indução, na cor vanilla.$$, $$https://brinox.vteximg.com.br/arquivos/ids/284016/frigideira-antiaderente-ceramic-life-brinox-sirius-inducao-vanilla.jpg?v=639137779168300000$$, $$https://www.brinox.com.br/frigideira-de-inducao-brinox-sirius-antiaderente-ceramic-life-%C3%B8-20-cm-1-litro-vanilla-4814354/p$$, null, now() + interval '25 seconds'),
  ($$Jogo de Panelas Oster Marble Edition Cream 4 Peças$$, $$Panelas e leiteira com revestimento cerâmico antiaderente, alças antitérmicas e base para indução.$$, $$https://m.media-amazon.com/images/I/615g1n2LBML._AC_SX679_.jpg$$, $$https://a.co/d/01z9fLEl$$, null, now() + interval '26 seconds'),
  ($$Organizador de Pia e Escorredor de Louça Suspenso 65cm$$, $$Escorredor premium suspenso para organizar a pia da cozinha com mais espaço.$$, $$https://m.media-amazon.com/images/I/71uYLEMEOEL._AC_SX679_.jpg$$, $$https://a.co/d/09iYsO5d$$, null, now() + interval '27 seconds'),
  ($$Faqueiro Tramontina Malibu Inox 42 Peças$$, $$Faqueiro em aço inox para completar a mesa posta do novo lar.$$, $$/gifts/28-faqueiro.svg$$, $$https://www.havan.com.br/faqueiro-aco-inox-malibu-42-pecas-tramontina-prata/p?utm_source=share$$, null, now() + interval '28 seconds'),
  ($$Lixeira Plástica 10L Fly Paramount com Pedal Creme$$, $$Lixeira com tampa acionada por pedal, ideal para banheiro, cozinha ou lavabo.$$, $$https://m.media-amazon.com/images/I/31n7Iu7d6oL._SX342_SY445_QL70_ML2_.jpg$$, $$https://a.co/d/00GUFJ7f$$, null, now() + interval '29 seconds'),
  ($$Jogo 6 Copos Albany Borda Dourada 400ml$$, $$Conjunto de 6 copos de vidro long drink, transparentes com borda dourada, para água e suco.$$, $$/gifts/30-copos-albany.svg$$, $$https://a.co/d/00tQhFB6$$, null, now() + interval '30 seconds'),
  ($$Garrafas Acrílicas Transparentes 1000ml Caixa de Leite$$, $$Garrafas estilo caixa de leite para geladeira, ideais para leite, suco, água, chá e bebidas.$$, $$/gifts/31-garrafas-acrilico.svg$$, $$https://br.shp.ee/mvxoVpAV$$, 19.99, now() + interval '31 seconds'),
  ($$Porta-Ovos Rolante 4 Andares Branco 30 Ovos$$, $$Organizador de ovos para geladeira com sistema rolante e capacidade para até 30 ovos.$$, $$/gifts/32-porta-ovos.svg$$, $$https://br.shp.ee/cAmWuCQs$$, 14.89, now() + interval '32 seconds'),
  ($$Kit 4 Capas de Almofada Boho Chic$$, $$Kit com 4 capas de almofada, sendo 2 lisas e 2 com detalhes em estilo boho elegante.$$, $$/gifts/33-capas-almofada-boho.svg$$, $$https://br.shp.ee/gss4q1du$$, 49.90, now() + interval '33 seconds'),
  ($$Varal de 40 Clips Inox Retrátil para Roupas Íntimas$$, $$Cabide varal com 40 prendedores em inox, prático para peças pequenas e roupas íntimas.$$, $$/gifts/34-varal-clips.svg$$, $$https://share.google/ALV8MpoqlRIk1KS0u$$, null, now() + interval '34 seconds'),
  ($$Jogo Copos Vidro Cristalino Nadir Lights 6 Peças$$, $$Conjunto de 6 copos de vidro cristalino Nadir Lights para uso diário e mesa posta.$$, $$/gifts/35-copos-lights-nadir.svg$$, $$https://www.americanas.com.br/conjunto-de-copos-lights-6-pecas-nadir-27995564/p?idsku=6805161&sellerId=1&utm_source=YSMESP&utm_medium=buscappc&utm_campaign=alwayson-25&utm_content=bp_pl_px_go_fisico_aloc_pmax_aberto_alwayson-25_na_aon25-00482&utm_term=pla_pmax&gad_source=1&gad_campaignid=23355046229&gbraid=0AAAAAD37Vpo4RUOhvProBkszwCCOkIn5D$$, null, now() + interval '35 seconds'),
  ($$Kit 4 ou 6 Jogo Americano Sousplat Redondo 38cm$$, $$Jogo americano/sousplat redondo para mesa posta, cozinha e jantar, com 38cm.$$, $$/gifts/36-jogo-americano-sousplat.svg$$, $$https://br.shp.ee/SAcjAxAf$$, 42.98, now() + interval '36 seconds'),
  ($$MONDIAL Passadeira a Vapor Portátil Fast Steam 1270W 110V VP-09$$, $$Passadeira a vapor portátil Mondial branca/azul, prática para desamassar roupas no dia a dia.$$, $$/gifts/37-passadeira-mondial.svg$$, $$https://www.amazon.com.br/Passadeira-Vapor-Port%C3%A1til-Mondial-Branco/dp/B0C59MB8V7/ref=sr_1_4?__mk_pt_BR=%C3%85M%C3%85%C5%BD%C3%95%C3%91&crid=3BM6GBKAW9YX0&dib=eyJ2IjoiMSJ9.NY3RjwHpLsBandsOBlRvMm5hxljwKTIWhJ7_co_4wvmbF-4uYgO6EVCGm_rlGUNOCuK5pvkWc9k0oK1oo9mYenbrBPJk3-ZqePji-yWGWE6S-gxS6NBWU3MW3E6It2Gd5g-VKEOLmnyPhvSovjcMzh_njhQYDyFa-zmaBciUQuNtmwjWcG5_dzcWOizT9Dt_scMxlM6hwSFj7pimCKwB5QC08OKxl5LSclB8EhvI1og.1mg2RLDrSRZiKFa-xpAVEfPxjSOwpJA9PpMbn9LwAhA&dib_tag=se&keywords=MONDIAL%2BPassadeira%2Ba%2BVapor%2BPort%C3%A1til%2BFast%2BSteam%2C%2BBranco%2FAzul%2C%2B1500W&qid=1781756550&s=home&sprefix=mondial%2Bpassadeira%2Ba%2Bvapor%2Bport%C3%A1til%2Bfast%2Bsteam%2Bbranco%2Fazul%2B1500w%2Chome%2C199&sr=1-4&ufe=app_do%3Aamzn1.fos.db68964d-7c0e-4bb2-a95c-e5cb9e32eb12&th=1$$, null, now() + interval '37 seconds'),
  ($$Conjunto de Utensílios de Cozinha 12 Peças Silicone e Madeira Cinza$$, $$Kit de utensílios de cozinha em silicone e madeira, resistente ao calor e com design ergonômico.$$, $$/gifts/38-utensilios-silicone-madeira.svg$$, $$https://a.co/d/05sx6WJj$$, null, now() + interval '38 seconds'),
  ($$Brinox Jogo de Panelas 6 Peças Ceramic Life Sirius Vanilla$$, $$Jogo de panelas Brinox Ceramic Life Sirius com revestimento antiaderente, cor vanilla e base com indução.$$, $$/gifts/39-panelas-brinox-sirius.svg$$, $$https://www.brinox.com.br/jogo-de-panelas-brinox-antiaderente-ceramic-life-sirius-6-pecas-com-inducao-vanilla_4814101-1-4814101/p$$, null, now() + interval '39 seconds')
) as seed(name, description, image_url, purchase_url, price, created_at)
where not exists (select 1 from public.gifts);

insert into public.guests (full_name, phone, group_name, invite_status)
select * from (values
  ('Regiane', null, 'Familiares', 'confirmed'),
  ('Adriane', null, 'Familiares', 'confirmed'),
  ('Sofia', null, 'Familiares', 'confirmed'),
  ('Junior', null, 'Familiares', 'pending'),
  ('Juracy', null, 'Familiares', 'confirmed'),
  ('Keven', null, 'Familiares', 'confirmed'),
  ('Manu', null, 'Familiares', 'confirmed'),
  ('Fagner', null, 'Familiares', 'confirmed'),
  ('Alice', null, 'Familiares', 'confirmed'),
  ('Eduarda', null, 'Familiares', 'confirmed'),
  ('Walter', null, 'Familiares', 'confirmed'),
  ('Josi', null, 'Familiares', 'confirmed'),
  ('Juliana', null, 'Familiares', 'confirmed'),
  ('Mauro Vitor', null, 'Familiares', 'pending'),
  ('Naldo', null, 'Familiares', 'pending'),
  ('Lenir', null, 'Familiares', 'confirmed'),
  ('Erison', null, 'Familiares', 'confirmed'),
  ('Marluce', null, 'Familiares', 'pending'),
  ('Leanny', null, 'Familiares', 'pending'),
  ('Patricia', null, 'Familiares', 'pending'),
  ('Yone', null, 'Familiares', 'pending'),
  ('Yolanda', null, 'Familiares', 'pending'),
  ('Patrick', null, 'Familiares', 'pending'),
  ('Matheus Eduardo', null, 'Amigos', 'confirmed'),
  ('Igor', null, 'Amigos', 'pending'),
  ('Sygria', null, 'Amigos', 'confirmed'),
  ('Mateus', null, 'Amigos', 'confirmed'),
  ('Fernanda', null, 'Amigos', 'pending'),
  ('Bruna', null, 'Amigos', 'pending'),
  ('Laura', null, 'Amigos', 'confirmed'),
  ('Aryelle', null, 'Amigos', 'confirmed'),
  ('Matheus Pavanelli', null, 'Amigos', 'pending'),
  ('Artur', null, 'Amigos', 'pending'),
  ('Amigo do Erison 1', null, 'Amigos', 'pending'),
  ('Amigo do Erison 2', null, 'Amigos', 'pending'),
  ('Amigo do Erison 3', null, 'Amigos', 'pending')
) as seed(full_name, phone, group_name, invite_status)
where not exists (
  select 1
  from public.guests g
  where lower(trim(regexp_replace(g.full_name, '\s+', ' ', 'g'))) = lower(trim(seed.full_name))
);

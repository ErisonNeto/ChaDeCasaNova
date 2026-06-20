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
  has_accessed boolean not null default false,
  selected_gift_id uuid,
  selected_at timestamptz,
  created_at timestamptz not null default now(),
  constraint guests_name_not_blank check (length(trim(full_name)) >= 3),
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
  allow_multiple_gifts_per_guest boolean not null default true,
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
create index if not exists guests_selected_at_idx on public.guests(selected_at desc);

-- Configuração inicial
insert into public.admin_settings (event_title, welcome_message, couple_name, event_date, theme_color, allow_multiple_gifts_per_guest)
select 'Chá de Casa Nova', 'Escolha com carinho um presente para fazer parte do nosso novo lar.', 'Jeyse e Erison', '2026-06-14', '#B96F68', true
where not exists (select 1 from public.admin_settings);

-- Função para autenticar convidado apenas pelo primeiro nome cadastrado.
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

-- Função para o convidado cancelar a própria escolha.
-- Permite que o convidado cancele a própria escolha e libere o presente novamente.

create or replace function public.cancel_guest_choice(p_guest_id uuid, p_gift_id uuid default null)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_guest public.guests%rowtype;
  v_gift public.gifts%rowtype;
  v_target_gift_id uuid;
begin
  select g.*
    into v_guest
  from public.guests g
  where g.id = p_guest_id
  for update;

  if not found then
    return jsonb_build_object('success', false, 'message', 'Convidado não encontrado.');
  end if;

  if v_guest.selected_gift_id is null then
    return jsonb_build_object('success', true, 'message', 'Você ainda não tinha um presente escolhido.');
  end if;

  v_target_gift_id := coalesce(p_gift_id, v_guest.selected_gift_id);

  if v_target_gift_id <> v_guest.selected_gift_id then
    return jsonb_build_object('success', false, 'message', 'Este presente não está vinculado ao seu convite.');
  end if;

  select gf.*
    into v_gift
  from public.gifts gf
  where gf.id = v_target_gift_id
  for update;

  if not found then
    update public.guests g
       set selected_gift_id = null,
           selected_at = null
     where g.id = v_guest.id;

    return jsonb_build_object('success', true, 'message', 'Escolha cancelada.');
  end if;

  if v_gift.reserved_by_guest_id <> v_guest.id then
    return jsonb_build_object('success', false, 'message', 'Este presente não está reservado por você.');
  end if;

  update public.gifts gf
     set status = 'available',
         reserved_by_guest_id = null,
         reserved_at = null
   where gf.id = v_gift.id;

  update public.guests g
     set selected_gift_id = null,
         selected_at = null
   where g.id = v_guest.id;

  return jsonb_build_object('success', true, 'message', 'Escolha cancelada e presente liberado.');
exception
  when others then
    return jsonb_build_object('success', false, 'message', 'Não foi possível cancelar sua escolha agora.');
end;
$$;

grant execute on function public.cancel_guest_choice(uuid, uuid) to anon, authenticated;

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


-- Ajustes finais: múltiplos presentes por convidado.
-- Permite que um mesmo convidado escolha vários presentes.
-- Mantém a regra principal: cada presente só pode ser reservado por uma pessoa.

-- Remove a trava antiga que limitava 1 presente por convidado.
drop index if exists public.gifts_reserved_by_guest_unique_idx;
drop index if exists public.guests_selected_gift_unique_idx;

-- Ativa configuração de múltiplos presentes.
update public.admin_settings
set allow_multiple_gifts_per_guest = true;

-- Função segura para reservar presente.
-- Agora o convidado pode reservar vários presentes, desde que cada presente esteja disponível.
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
   where gf.id = v_gift.id
   returning gf.* into v_gift;

  -- Campos legados: guardam a última escolha para compatibilidade com telas antigas.
  update public.guests g
     set selected_gift_id = v_gift.id,
         selected_at = v_gift.reserved_at
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

-- Função administrativa para liberar um presente específico.
create or replace function public.release_gift(p_gift_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_gift public.gifts%rowtype;
  v_next_gift public.gifts%rowtype;
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

  update public.gifts gf
     set status = 'available',
         reserved_by_guest_id = null,
         reserved_at = null
   where gf.id = p_gift_id;

  if v_gift.reserved_by_guest_id is not null then
    select gf.*
      into v_next_gift
    from public.gifts gf
    where gf.reserved_by_guest_id = v_gift.reserved_by_guest_id
      and gf.status = 'reserved'
    order by gf.reserved_at desc nulls last
    limit 1;

    if found then
      update public.guests g
         set selected_gift_id = v_next_gift.id,
             selected_at = v_next_gift.reserved_at
       where g.id = v_gift.reserved_by_guest_id;
    else
      update public.guests g
         set selected_gift_id = null,
             selected_at = null
       where g.id = v_gift.reserved_by_guest_id;
    end if;
  end if;

  return jsonb_build_object('success', true, 'message', 'Presente liberado com sucesso.');
end;
$$;

-- Função para o convidado cancelar um presente específico que ele escolheu.
create or replace function public.cancel_guest_choice(p_guest_id uuid, p_gift_id uuid default null)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_guest public.guests%rowtype;
  v_gift public.gifts%rowtype;
  v_next_gift public.gifts%rowtype;
  v_target_gift_id uuid;
begin
  select g.*
    into v_guest
  from public.guests g
  where g.id = p_guest_id
  for update;

  if not found then
    return jsonb_build_object('success', false, 'message', 'Convidado não encontrado.');
  end if;

  v_target_gift_id := coalesce(p_gift_id, v_guest.selected_gift_id);

  if v_target_gift_id is null then
    return jsonb_build_object('success', true, 'message', 'Você ainda não tinha um presente escolhido.');
  end if;

  select gf.*
    into v_gift
  from public.gifts gf
  where gf.id = v_target_gift_id
  for update;

  if not found then
    return jsonb_build_object('success', false, 'message', 'Presente não encontrado.');
  end if;

  if v_gift.reserved_by_guest_id <> v_guest.id then
    return jsonb_build_object('success', false, 'message', 'Este presente não está reservado por você.');
  end if;

  update public.gifts gf
     set status = 'available',
         reserved_by_guest_id = null,
         reserved_at = null
   where gf.id = v_gift.id;

  select gf.*
    into v_next_gift
  from public.gifts gf
  where gf.reserved_by_guest_id = v_guest.id
    and gf.status = 'reserved'
  order by gf.reserved_at desc nulls last
  limit 1;

  if found then
    update public.guests g
       set selected_gift_id = v_next_gift.id,
           selected_at = v_next_gift.reserved_at
     where g.id = v_guest.id;
  else
    update public.guests g
       set selected_gift_id = null,
           selected_at = null
     where g.id = v_guest.id;
  end if;

  return jsonb_build_object('success', true, 'message', 'Escolha cancelada e presente liberado.');
exception
  when others then
    return jsonb_build_object('success', false, 'message', 'Não foi possível cancelar sua escolha agora.');
end;
$$;

grant execute on function public.claim_gift(uuid, uuid) to anon, authenticated;
grant execute on function public.release_gift(uuid) to authenticated;
grant execute on function public.cancel_guest_choice(uuid, uuid) to anon, authenticated;


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
  ($$Air Fryer Forno Electrolux EAF85 12L 127V$$, $$Fritadeira elétrica sem óleo 5 em 1, digital, com bandeja antiaderente e receitas programadas.$$, $$/gifts/01-air-fryer.svg$$, $$https://a.co/d/0hZJsPRh$$, null, now() + interval '1 seconds'),
  ($$Cesto de Bambu Ecológico 65L com Tampa$$, $$Cesto bege para lavanderia com tampa, alças e acabamento em fibra natural.$$, $$/gifts/02-cesto-bambu.svg$$, $$https://a.co/d/0eNxNJDK$$, null, now() + interval '2 seconds'),
  ($$Varal de Chão Secalux Ravenna 1,22m$$, $$Varal dobrável em aço com abas, prático para o dia a dia do novo lar.$$, $$/gifts/03-varal.svg$$, $$https://share.google/RzoZZZKiTvwPg1riP$$, null, now() + interval '3 seconds'),
  ($$Conjunto Xícara de Café Ouro 12 Peças$$, $$Xícaras de porcelana chinesa 80ml para cafezinho e expresso.$$, $$/gifts/04-xicaras-cafe.svg$$, $$https://a.co/d/0942pZ3k$$, null, now() + interval '4 seconds'),
  ($$Jogo de Jantar Cerâmica Naturalle 16 Peças Preto$$, $$Aparelho de jantar em cerâmica, elegante e moderno, ideal para receber com carinho.$$, $$/gifts/05-jogo-jantar.svg$$, $$https://www.havan.com.br/aparelho-de-jantar-ceramica-naturalle-havan-casa-16-pecas-preto/p?shem=rimspwouoe$$, null, now() + interval '5 seconds'),
  ($$Sanduicheira Elétrica Cadence Click 750W SAN400$$, $$Sanduicheira elétrica compacta e prática para cafés e lanches rápidos.$$, $$/gifts/06-sanduicheira.svg$$, $$https://share.google/Krp1AXWt3dLta1XTj$$, null, now() + interval '6 seconds'),
  ($$Jogo de Cama Malha Camafeu Casal Preto$$, $$Jogo de cama de malha casal na cor preta, confortável e versátil.$$, $$/gifts/07-jogo-cama-preto.svg$$, $$https://www.riachuelo.com.br/jogo-de-cama-camafeu-de-algod-o-casa-riachuelo-14957574_sku_sku_casal_preto?sku=15040593001&gad_source=1&gad_campaignid=17162640194&gbraid=0AAAAADr2JaygPtADy5MNctb6Nxw_a1Qhg&gclid=CjwKCAjwxITRBhBYEiwA6mZm7bfTeG6nB2Yw3UMhLyyrI0U_edV6AFzr_cvJQ_F2Ufi3k01o4G_IQBoCjNsQAvD_BwE&shem=rimspwouoe$$, null, now() + interval '7 seconds'),
  ($$Jogo de Cama Algodão 120 Fios Casal Rosa Claro$$, $$Roupa de cama casal em algodão 120 fios, delicada e aconchegante.$$, $$/gifts/08-jogo-cama-rosa.svg$$, $$https://www.riachuelo.com.br/jogo-de-cama-king-algod-o-120-fios-cinza-casa-riachuelo-15280420001_sku_sku_casal_rosa-claro?sku=15040593001&gad_source=1&gad_campaignid=17162640194&gbraid=0AAAAADr2JaygPtADy5MNctb6Nxw_a1Qhg&gclid=CjwKCAjwxITRBhBYEiwA6mZm7bfTeG6nB2Yw3UMhLyyrI0U_edV6AFzr_cvJQ_F2Ufi3k01o4G_IQBoCjNsQAvD_BwE&shem=rimspwouoe$$, null, now() + interval '8 seconds'),
  ($$Jogo de Assadeiras Tramontina Starflon Max Rosa 2 Peças$$, $$Assadeiras antiaderentes Tramontina para preparar receitas com praticidade.$$, $$/gifts/09-assadeiras.svg$$, $$https://a.co/d/0d3GXViL$$, null, now() + interval '9 seconds'),
  ($$Kit 20 Cabides de Madeira Adulto Marfim$$, $$Cabides de madeira para organizar o closet com elegância e padrão.$$, $$/gifts/10-cabides.svg$$, $$https://share.google/Aw9d4cibEK8RLadww$$, null, now() + interval '10 seconds'),
  ($$Jogo de Banho 4 Peças Romance Döhler Branco$$, $$Kit de toalhas 100% algodão, aveludadas, com fio penteado e acabamento delicado.$$, $$/gifts/11-jogo-banho.svg$$, $$https://a.co/d/0662YUHW$$, null, now() + interval '11 seconds'),
  ($$Toalha Super Banho Karsten by Havan Casa Branco$$, $$Toalha super banho 100% algodão, macia e essencial para o novo lar.$$, $$/gifts/12-toalha-karsten.svg$$, $$https://www.havan.com.br/toalha-super-banho-100-algodao-karsten-by-havan-casa-branco/p?utm_source=share$$, null, now() + interval '12 seconds'),
  ($$Kit de Banheiro Completo Bambu 4 ou 6 Peças$$, $$Conjunto para lavabo com lixeira de tampa basculante e acabamento bambu.$$, $$/gifts/13-kit-banheiro.svg$$, $$https://br.shp.ee/aiprBWhB$$, 69.26, now() + interval '13 seconds'),
  ($$Kit 13 Potes Herméticos com Tampa de Bambu$$, $$Potes para mantimentos, ideais para organizar a cozinha e a despensa.$$, $$/gifts/14-potes-hermeticos.svg$$, $$https://br.shp.ee/FVCmjM47$$, 62.90, now() + interval '14 seconds'),
  ($$Kit 4 Almofadas Decorativas Sofá Luxo Premium$$, $$Almofadas decorativas para deixar a sala mais aconchegante e elegante.$$, $$/gifts/15-almofadas.svg$$, $$https://a.co/d/01BcJfzL$$, null, now() + interval '15 seconds'),
  ($$Kit 2 Mantas Decorativas Verde Oliva e Cru$$, $$Mantas para sofá, poltronas ou cama, em tons suaves e acolhedores.$$, $$/gifts/16-mantas.svg$$, $$https://a.co/d/0acjYaMx$$, null, now() + interval '16 seconds'),
  ($$Trio de Vasos Decorativos Vazado Nude$$, $$Conjunto de vasos modernos para compor a decoração da sala com sofisticação.$$, $$/gifts/17-vasos-trio.svg$$, $$https://a.co/d/0bqHUX9R$$, null, now() + interval '17 seconds'),
  ($$Vaso Cone Bege 15cm$$, $$Vaso decorativo bege para trazer charme e leveza aos ambientes.$$, $$/gifts/18-vaso-cone.svg$$, $$https://a.co/d/07EVWWVc$$, null, now() + interval '18 seconds'),
  ($$Umidificador Ultrassônico USB Madeira 7 Cores$$, $$Difusor aromatizador com visual amadeirado e LED, perfeito para ambientes aconchegantes.$$, $$/gifts/19-umidificador.svg$$, $$https://a.co/d/0jdsuG65$$, null, now() + interval '19 seconds'),
  ($$Tábua de Corte de Mármore para Carne$$, $$Tábua de mármore resistente e elegante para preparo e apoio na cozinha.$$, $$/gifts/20-tabua-marmore.svg$$, $$https://produto.mercadolivre.com.br/MLB-6544742356-tabua-de-corte-de-marmore-para-carne-_JM?matt_tool=38524122#origin=share&sid=share&action=whatsapp$$, null, now() + interval '20 seconds'),
  ($$Processador de Alimentos Electrolux EFP500 3 em 1 127V$$, $$Processador de alimentos Efficient 3 em 1 para facilitar o preparo das receitas.$$, $$/gifts/21-processador.svg$$, $$https://www.google.com/search?q=Processador+de+Alimentos+3+em+1+Electrolux+Efficient+(EFP500)+127V&ibp=oshop&hl=pt-BR&gl=br&prds=catalogid:5738480336635671527,gpcid:1975862656171998401,productid:8283256800018731152,imageDocid:17871872922977174928,headlineOfferDocid:12180858613389176083,mid:576462852948111329,pvt:hg,sori:0,mno:5,rds:PC_1975862656171998401%7CPROD_PC_1975862656171998401,pvo:25,pvcb:0&pvorigin=25&shem=pvflt,rimspwouoe&shndl=37&shmd=H4sIAAAAAAAA_7XMTQ7BQBgA0LDUG1h9Sxa0iJQmItVUmwpRiZ-yUTNThrZD51NiZe-KPQyXsH7Jq3zKldE8E4RJGVKRAWVgxjxhKQoJHWAJtMCOGcFMxPcn2FHECf8p1OzxvKtpdWi19VV1d0K8GqqKWvMoMUROmkQkKk_CI5PD2wAPqWHOaN8hvmV2eu4kjfO17jx0ebnKGdUbPsuD4LVYWlnquf52QpmjTc_ouZ5l_DPfFMq-UJ6F8i4Vyhd0dTsUDgEAAA&shmds=v1_ATWGeeMQD_4jOsTB3gzOFSt_KxFPIVGTI-sDBjYQTD-f1-rNyg&source=sh/x/prdct/hdr/m1/5&kgs=c444b7df75fa4a59&utm_source=pvflt,rimspwouoe,sh/x/prdct/hdr/m1/5$$, null, now() + interval '21 seconds'),
  ($$Porta Temperos Giratório com 12 Potes de Vidro$$, $$Organizador de condimentos com potes de vidro, tampa inox e suporte giratório preto.$$, $$/gifts/22-porta-temperos.svg$$, $$https://a.co/d/0heMr4mU$$, null, now() + interval '22 seconds'),
  ($$Jogo de Facas Tramontina Plenus Branco 6 Peças$$, $$Conjunto de facas Tramontina para equipar a cozinha com praticidade.$$, $$/gifts/23-facas.svg$$, $$https://a.co/d/00orRvWi$$, null, now() + interval '23 seconds'),
  ($$Jogo de 6 Taças para Vinho Branco Xtra 360ml$$, $$Taças em cristal ecológico para compor a mesa em momentos especiais.$$, $$/gifts/24-tacas-vinho.svg$$, $$https://a.co/d/035dbqkh$$, null, now() + interval '24 seconds'),
  ($$Frigideira de Indução Brinox Sirius 20cm Vanilla$$, $$Frigideira antiaderente Ceramic Life, compatível com indução, na cor vanilla.$$, $$/gifts/25-frigideira.svg$$, $$https://www.brinox.com.br/frigideira-de-inducao-brinox-sirius-antiaderente-ceramic-life-%C3%B8-20-cm-1-litro-vanilla-4814354/p$$, null, now() + interval '25 seconds'),
  ($$Jogo de Panelas Oster Marble Edition Cream 4 Peças$$, $$Panelas e leiteira com revestimento cerâmico antiaderente, alças antitérmicas e base para indução.$$, $$/gifts/26-panelas-oster.svg$$, $$https://a.co/d/01z9fLEl$$, null, now() + interval '26 seconds'),
  ($$Organizador de Pia e Escorredor de Louça Suspenso 65cm$$, $$Escorredor premium suspenso para organizar a pia da cozinha com mais espaço.$$, $$/gifts/27-organizador-pia.svg$$, $$https://a.co/d/09iYsO5d$$, null, now() + interval '27 seconds'),
  ($$Faqueiro Tramontina Malibu Inox 42 Peças$$, $$Faqueiro em aço inox para completar a mesa posta do novo lar.$$, $$/gifts/28-faqueiro.svg$$, $$https://www.havan.com.br/faqueiro-aco-inox-malibu-42-pecas-tramontina-prata/p?utm_source=share$$, null, now() + interval '28 seconds'),
  ($$Lixeira Plástica 10L Fly Paramount com Pedal Creme$$, $$Lixeira com tampa acionada por pedal, ideal para banheiro, cozinha ou lavabo.$$, $$/gifts/29-lixeira.svg$$, $$https://a.co/d/00GUFJ7f$$, null, now() + interval '29 seconds'),
  ($$Garrafas Acrílicas 1000ml para Geladeira$$, $$Garrafas transparentes para leite, sucos, água, chá e bebidas na geladeira.$$, $$/gifts/30-garrafas-acrilico.svg$$, $$https://shopee.com.br/product/1151779695/58251627000?d_id=da0d5&uls_trackid=55uh4v7r02ct&utm_content=33v3JPYLVNj9NWXAXVwfw1XLnCx7$$, null, now() + interval '30 seconds'),
  ($$Kit 5 Descansos de Panela Madeira Premium 19x19$$, $$Protetores de madeira para panelas e travessas, práticos e elegantes para a mesa.$$, $$/gifts/31-descanso-panela-madeira.svg$$, $$https://www.mercadolivre.com.br/kit-5-descanso-de-panela-protetor-madeira-premium-19x19/up/MLBU3515307082?skipInApp=true&matt_ignore=true$$, null, now() + interval '31 seconds'),
  ($$Kit Jogo Americano Sousplat Redondo 38cm$$, $$Conjunto de sousplats redondos para mesa posta, jantar e cozinha.$$, $$/gifts/32-jogo-americano-sousplat.svg$$, $$https://shopee.com.br/product/1223641329/22993050249?d_id=da0d5&rModelId=199163339947&uls_trackid=55uh582m00k6&utm_content=33v3JPYLVU4dMBFpqdNhywX6H9DR&vItemId=22594777637&vModelId=119726930066&vShopId=1665239494$$, null, now() + interval '32 seconds'),
  ($$Passadeira a Vapor Portátil Mondial Fast Steam 1500W$$, $$Passadeira portátil a vapor, ideal para manter as roupas sempre alinhadas.$$, $$/gifts/33-passadeira-mondial.svg$$, $$https://www.amazon.com.br/Passadeira-Vapor-Port%C3%A1til-Mondial-Branco/dp/B0C59MB8V7/ref=asc_df_B0C59NLPC2?mcid=df3c5930732637b5ac7229d774f8a006&tag=googleshopp06-20&linkCode=df0&hvadid=709964705711&hvpos=&hvnetw=g&hvrand=501251467939053534&hvpone=&hvptwo=&hvqmt=&hvdev=m&hvdvcmdl=&hvlocint=&hvlocphy=9101622&hvtargid=pla-2199251424186&hvocijid=501251467939053534-B0C59NLPC2-&hvexpln=0&language=pt_BR&th=1$$, null, now() + interval '33 seconds'),
  ($$Conjunto de Utensílios Silicone e Madeira 12 Peças$$, $$Utensílios de cozinha com silicone, madeira, design ergonômico e resistência ao calor.$$, $$/gifts/34-utensilios-silicone-madeira.svg$$, $$https://a.co/d/05sx6WJj$$, null, now() + interval '34 seconds'),
  ($$Jogo de Panelas Brinox Ceramic Life Sirius 6 Peças Vanilla$$, $$Conjunto de panelas Brinox com acabamento vanilla e revestimento cerâmico.$$, $$/gifts/35-panelas-brinox-sirius.svg$$, $$https://a.co/d/02DvEdTA$$, null, now() + interval '35 seconds'),
  ($$Aspirador de Pó Vertical Electrolux STK12 1100W 2 em 1$$, $$Aspirador vertical 2 em 1 para limpeza prática e rápida do novo lar.$$, $$/gifts/36-aspirador-electrolux.svg$$, $$https://www.magazineluiza.com.br/aspirador-de-po-vertical-1100w-stk12-electrolux-2-em-1/p/021499100/ep/apdv/?seller_id=magazineluiza$$, null, now() + interval '36 seconds'),
  ($$Jogo de Copos Nadir Lights 300ml 6 Peças$$, $$Copos de vidro cristalino transparente para servir com elegância no dia a dia.$$, $$/gifts/37-copos-nadir-lights.svg$$, $$https://www.americanas.com.br/conjunto-de-copos-lights-6-pecas-nadir-27995564/p?idsku=6805161&sellerId=1&utm_source=YSMESP&utm_medium=buscappc&utm_campaign=alwayson-25&utm_content=bp_pl_px_go_fisico_aloc_pmax_aberto_alwayson-25_na_aon25-00482&utm_term=pla_pmax&gad_source=1&gad_campaignid=23355046229&gbraid=0AAAAAD37Vpo4RUOhvProBkszwCCOkIn5D$$, null, now() + interval '37 seconds'),
  ($$Varal de 40 Clips Inox Retrátil para Roupas Íntimas$$, $$Cabide prático com prendedores para peças pequenas, roupas íntimas e organização.$$, $$/gifts/38-varal-clips-inox.svg$$, $$https://www.amazon.com.br/Prendedores-Pratico-Retr%C3%A1til-Intimas-Pequenas/dp/B0DRXG2RTV/ref=asc_df_B0DRXG2RTV?mcid=757fdec055d93b99a8112e7f285fff8c&tag=googleshopp06-20&linkCode=df0&hvadid=709857323175&hvpos=&hvnetw=g&hvrand=8523565390202454174&hvpone=&hvptwo=&hvqmt=&hvdev=m&hvdvcmdl=&hvlocint=&hvlocphy=9222465&hvtargid=pla-2456906691317&psc=1&hvocijid=8523565390202454174-B0DRXG2RTV-&hvexpln=0&language=pt_BR&shem=rimspwouoe$$, null, now() + interval '38 seconds'),
  ($$Kit 4 Capas de Almofada Boho Chic$$, $$Capas de almofada com duas lisas e duas com detalhes elegantes para decorar a sala.$$, $$/gifts/39-capas-almofada-boho.svg$$, $$https://shopee.com.br/product/824236063/23992692048?d_id=da0d5&uls_trackid=55uh5rf700k8&utm_content=33v3JPYL1bHe1wjv7wsKRftkxhtj$$, null, now() + interval '39 seconds'),
  ($$Porta Ovos Dispenser 4 Andares para 30 Ovos$$, $$Organizador branco rolante em plástico para geladeira, com capacidade para 30 ovos.$$, $$/gifts/40-porta-ovos-dispenser.svg$$, $$https://shopee.com.br/product/323288678/52809373757?d_id=da0d5&uls_trackid=55uh5tl301dj&utm_content=33v3JPYL1b9JvVN2bgY2sQ8RQaKH$$, null, now() + interval '40 seconds')
) as seed(name, description, image_url, purchase_url, price, created_at)
where not exists (select 1 from public.gifts);

insert into public.guests (full_name, phone)
select * from (values
  ('Regiane', null),
  ('Adriane', null),
  ('Sofia', null),
  ('Junior', null),
  ('Juracy', null),
  ('Keven', null),
  ('Manu', null),
  ('Fagner', null),
  ('Alice', null),
  ('Eduarda', null),
  ('Walter', null),
  ('Josi', null),
  ('Juliana', null),
  ('Naldo', null),
  ('Lenir', null),
  ('Erison', null),
  ('Marluce', null),
  ('Leanny', null),
  ('Patricia', null),
  ('Yone', null),
  ('Yolanda', null),
  ('Patrick', null),
  ('Matheus', null),
  ('Sigria', null),
  ('Igor', null),
  ('Fernanda', null),
  ('Bruna', null),
  ('Laura', null),
  ('Miguel', null)
) as seed(full_name, phone)
where not exists (
  select 1
  from public.guests g
  where lower(trim(regexp_replace(g.full_name, '\s+', ' ', 'g'))) = lower(trim(seed.full_name))
);

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

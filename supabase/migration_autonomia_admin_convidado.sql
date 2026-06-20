-- Autonomia do convidado e do admin
-- Rode este arquivo no SQL Editor do Supabase.
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

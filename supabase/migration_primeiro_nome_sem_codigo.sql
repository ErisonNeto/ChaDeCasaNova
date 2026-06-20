-- Migração: remover acesso por código e usar apenas primeiro nome.
-- Rode este arquivo no SQL Editor do Supabase caso você já tenha executado uma versão anterior do banco.

-- 1) Remove regras e coluna antigas de código, se existirem.
drop index if exists public.guests_access_code_unique_lower_idx;
alter table public.guests drop constraint if exists guests_access_code_not_blank;
alter table public.guests drop column if exists access_code;

-- 2) Garante que o nome do convidado seja único, para evitar ambiguidade no login por primeiro nome.
create unique index if not exists guests_full_name_unique_lower_idx
  on public.guests (lower(trim(regexp_replace(full_name, '\s+', ' ', 'g'))));

-- 3) Atualiza a função de autenticação para procurar somente pelo nome cadastrado.
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

grant execute on function public.authenticate_guest(text) to anon, authenticated;

-- 4) Insere a lista oficial sem código, sem duplicar nomes existentes.
insert into public.guests (full_name, phone)
select seed.full_name, seed.phone
from (values
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

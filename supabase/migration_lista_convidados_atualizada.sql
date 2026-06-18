-- Migration da lista atualizada do Chá de Casa Nova
-- Versão: acesso pelo nome cadastrado, sem código individual.
-- ✅ = confirmed | ❌/sem marcação = pending
-- Rode este arquivo no SQL Editor do Supabase depois do schema/migration.

alter table public.guests add column if not exists group_name text not null default 'Familiares';
alter table public.guests add column if not exists invite_status text not null default 'pending';

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'guests_invite_status_check'
      and conrelid = 'public.guests'::regclass
  ) then
    alter table public.guests
      add constraint guests_invite_status_check
      check (invite_status in ('confirmed', 'pending'));
  end if;
end $$;

-- Ajustes de nomes antigos para a lista nova, evitando duplicidade.
update public.guests g
set full_name = 'Sygria', group_name = 'Amigos', invite_status = 'confirmed'
where lower(trim(regexp_replace(g.full_name, '\s+', ' ', 'g'))) = 'sigria'
  and not exists (
    select 1 from public.guests existing
    where lower(trim(regexp_replace(existing.full_name, '\s+', ' ', 'g'))) = 'sygria'
  );

update public.guests g
set full_name = 'Matheus Eduardo', group_name = 'Amigos', invite_status = 'confirmed'
where lower(trim(regexp_replace(g.full_name, '\s+', ' ', 'g'))) = 'matheus'
  and not exists (
    select 1 from public.guests existing
    where lower(trim(regexp_replace(existing.full_name, '\s+', ' ', 'g'))) = 'matheus eduardo'
  );

with seed(full_name, phone, group_name, invite_status) as (
  values
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
), upserted as (
  update public.guests g
     set phone = coalesce(seed.phone, g.phone),
         group_name = seed.group_name,
         invite_status = seed.invite_status
    from seed
   where lower(trim(regexp_replace(g.full_name, '\s+', ' ', 'g'))) = lower(trim(seed.full_name))
  returning g.id
)
insert into public.guests (full_name, phone, group_name, invite_status)
select seed.full_name, seed.phone, seed.group_name, seed.invite_status
from seed
where not exists (
  select 1
  from public.guests g
  where lower(trim(regexp_replace(g.full_name, '\s+', ' ', 'g'))) = lower(trim(seed.full_name))
);

-- Observação: nomes que saíram da lista antiga, como Miguel, não são apagados automaticamente
-- para não liberar/esconder escolhas por acidente. Remova manualmente pelo painel se necessário.

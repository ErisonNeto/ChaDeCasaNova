-- Seed da lista oficial do Chá de Casa Nova
-- Versão: acesso apenas pelo primeiro nome, sem código individual.
-- Rode este arquivo no SQL Editor do Supabase se o banco já estiver criado.

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

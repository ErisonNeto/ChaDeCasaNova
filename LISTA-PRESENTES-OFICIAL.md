# Lista oficial de presentes

A lista real de presentes está em `supabase/seed_gifts_lista_real.sql`.

Para atualizar o Supabase:

1. Abra o Supabase.
2. Vá em SQL Editor.
3. Cole o conteúdo do arquivo `supabase/seed_gifts_lista_real.sql`.
4. Clique em Run.

Atenção: esse script substitui os presentes atuais e limpa escolhas feitas anteriormente. Rode antes de enviar o link para os convidados.

## Atualização de links — 14/06/2026

Foram conferidos os links enviados e adicionados 6 novos presentes ao projeto. Os links que já existiam foram mantidos sem duplicar.

Para banco já criado, rode `supabase/migration_novos_presentes_2026_06_14.sql` para adicionar apenas os novos itens.

## Atualização de links — 18/06/2026

Foi adicionado o item **Kit 4 ou 6 Jogo Americano Sousplat Redondo 38cm** e reforçados links de compra de itens já existentes, sem duplicar presentes.

Para banco já criado, rode `supabase/migration_novos_links_2026_06_18.sql`.

## Atualização extra — 18/06/2026

Foram adicionados 3 novos presentes:

- MONDIAL Passadeira a Vapor Portátil Fast Steam 1270W 110V VP-09.
- Conjunto de Utensílios de Cozinha 12 Peças Silicone e Madeira Cinza.
- Brinox Jogo de Panelas 6 Peças Ceramic Life Sirius Vanilla.

Para banco já criado, rode `supabase/migration_presentes_extra_2026_06_18.sql` para adicionar apenas esses novos itens sem apagar reservas.

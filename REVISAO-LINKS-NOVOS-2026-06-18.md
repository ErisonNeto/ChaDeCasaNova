# Revisão de links — 18/06/2026

## Novo item adicionado

- Kit 4 ou 6 Jogo Americano Sousplat Redondo 38cm  
  Link: https://br.shp.ee/SAcjAxAf

## Links reforçados/atualizados para itens já existentes

Estes itens já estavam no código, então não foram duplicados. A migration apenas garante o `purchase_url` correto no Supabase:

- Garrafas Acrílicas Transparentes 1000ml Caixa de Leite — https://br.shp.ee/mvxoVpAV
- Porta-Ovos Rolante 4 Andares Branco 30 Ovos — https://br.shp.ee/cAmWuCQs
- Kit 4 Capas de Almofada Boho Chic — https://br.shp.ee/gss4q1du
- Varal de 40 Clips Inox Retrátil para Roupas Íntimas — https://share.google/ALV8MpoqlRIk1KS0u
- Jogo Copos Vidro Cristalino Nadir Lights 6 Peças — link Americanas informado

## Links não adicionados automaticamente

- https://share.google/h4TyMFbmP8fdnvWUJ — veio apenas como “Fonte: Camicado”, sem nome do produto.
- https://share.google/6MR25zhJToRukoZhn — veio sem nome do produto.
- https://br.shp.ee/rSkteWCs — parece ser outro link para o mesmo item de garrafas acrílicas; mantido o link já cadastrado para evitar duplicidade.

## Migration para banco existente

Rode no Supabase SQL Editor:

`supabase/migration_novos_links_2026_06_18.sql`

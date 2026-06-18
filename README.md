# Chá de Casa Nova Premium

Sistema web premium para lista fechada de presentes de Chá de Casa Nova.

## O que vem pronto

- Landing page premium com aparência de convite digital.
- Acesso exclusivo por nome completo ou código individual.
- Lista de presentes com imagem, descrição, preço opcional e link de compra.
- Escolha única por convidado.
- Bloqueio real no PostgreSQL/Supabase com função `claim_gift` usando lock transacional.
- Proteção contra duas pessoas escolherem o mesmo presente ao mesmo tempo.
- Confirmação elegante após escolha.
- Painel administrativo com login Supabase Auth.
- CRUD de presentes.
- CRUD de convidados.
- Filtros de convidados por acesso e escolha.
- Cancelamento manual de escolha/liberação de presente.
- Dashboard com resumo.
- Exportação em Excel.
- Tailwind CSS, Framer Motion, Lucide React e Sonner.
- Pronto para Vercel ou Netlify.

## Stack

- React
- Vite
- TypeScript
- Tailwind CSS
- Supabase
- PostgreSQL
- React Router
- Framer Motion
- Lucide React

## 1. Criar o banco no Supabase

1. Crie um projeto no Supabase.
2. Abra **SQL Editor**.
3. Copie todo o conteúdo de `supabase/schema.sql`.
4. Execute o SQL.
5. Em **Authentication > Users**, crie manualmente um usuário admin com e-mail e senha.

Esse admin será usado em `/admin/login`.

## 2. Configurar variáveis de ambiente

Copie o arquivo `.env.example` para `.env`:

```bash
cp .env.example .env
```

Preencha:

```env
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=SUA_SUPABASE_ANON_KEY
```

Você encontra esses dados em **Supabase > Project Settings > API**.

## 3. Rodar localmente

```bash
npm install
npm run dev
```

Abra:

```txt
http://localhost:5173
```

Admin:

```txt
http://localhost:5173/admin/login
```

## 4. Publicar na Vercel

1. Suba o projeto para o GitHub.
2. Importe o repositório na Vercel.
3. Configure as variáveis de ambiente:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Build command:

```bash
npm run build
```

5. Output directory:

```txt
dist
```

## 5. Publicar na Netlify

1. Suba o projeto para o GitHub.
2. Importe o repositório na Netlify.
3. Configure as mesmas variáveis de ambiente.
4. Build command:

```bash
npm run build
```

5. Publish directory:

```txt
dist
```

## 6. Fluxo do convidado

1. O admin cadastra o convidado com nome completo e código único.
2. O convidado acessa a landing page.
3. Informa nome completo ou código.
4. O sistema chama `authenticate_guest` no Supabase.
5. Se o convidado existir, `has_accessed` vira `true`.
6. O convidado vê os presentes.
7. Ao escolher, abre um modal de confirmação.
8. O sistema chama `claim_gift(guest_id, gift_id)`.
9. A função bloqueia linhas no banco com `FOR UPDATE`.
10. Se o presente estiver disponível, ele é reservado.
11. O presente fica indisponível para todos.

## 7. Segurança importante

A reserva não depende apenas do front-end.

A função `claim_gift` valida no banco:

- se o convidado existe;
- se o convidado ainda não escolheu presente;
- se o presente ainda está disponível;
- se não há outra reserva concorrente;
- se a operação deve ser concluída ou rejeitada.

Isso evita a falha clássica de duas pessoas clicarem no mesmo presente ao mesmo tempo.

## 8. Personalização visual

O visual principal está em:

- `src/index.css`
- `tailwind.config.ts`
- componentes em `src/components`
- páginas em `src/pages/guest`

Paleta atual:

- Champagne
- Off-white
- Dourado suave
- Sage green
- Cocoa
- Blush pastel

## 9. Observações

- O script SQL inclui alguns presentes e convidados de exemplo.
- Você pode apagar esses registros no painel admin depois.
- Para produção, use códigos únicos fortes para convidados.
- Recomenda-se manter o acesso admin apenas para pessoas responsáveis pela lista.


## Paleta do convite

Esta versão usa a identidade visual do convite virtual Jeyse & Erison: fundo perolado, rosé queimado, concha rosada e dourado champagne. Veja `PALETA-CONVITE.md`.

Se o banco já estiver criado, rode também:

```sql
supabase/migration_paleta_convite.sql
```


## Atualizar lista oficial de presentes

Para substituir a lista de presentes pelos itens reais enviados, rode no Supabase SQL Editor o arquivo:

```txt
supabase/seed_gifts_lista_real.sql
```

Esse script remove a lista antiga, libera reservas anteriores e insere os 29 presentes oficiais com títulos, imagens ilustrativas premium e links de compra.

## Fotos reais dos produtos

Esta versão usa uma API serverless da Vercel em `api/product-image.js` para buscar automaticamente a imagem principal do produto a partir do link de compra. Ela tenta ler `og:image`, `twitter:image`, JSON-LD e imagens do HTML da página.

Não precisa de backend separado. Ao publicar na Vercel, a rota `/api/product-image` fica disponível automaticamente.

Para forçar o uso das fotos dos links em uma base que já tinha os SVGs antigos, rode no Supabase:

```sql
-- arquivo: supabase/migration_imagens_por_link.sql
update public.gifts
set image_url = null
where image_url like '/gifts/%';
```


## Fotos automáticas por título

Esta versão usa a rota `/api/product-image` para buscar uma foto coerente com o título do presente.
Se o banco tiver imagens antigas, rode no Supabase:

```sql
update public.gifts
set image_url = null
where image_url is not null;
```

Assim todos os cards passam a tentar carregar imagens reais pelo nome do item. Se alguma busca externa falhar, o card cai em um fallback local específico do produto.

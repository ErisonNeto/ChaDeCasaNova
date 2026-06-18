-- Atualiza a identidade visual/configurações do evento para a paleta do convite virtual Jeyse & Erison.
-- Rode no SQL Editor se o banco já estiver criado.

update public.admin_settings
   set event_title = 'Chá de Casa Nova',
       welcome_message = 'Escolha com carinho um presente para fazer parte do nosso novo lar.',
       couple_name = 'Jeyse e Erison',
       event_date = '2026-06-14',
       theme_color = '#B96F68';

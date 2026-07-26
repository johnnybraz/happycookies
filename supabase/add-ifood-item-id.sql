-- Adiciona a coluna usada para ligar cada produto do site ao item
-- correspondente no cardápio do iFood (usada pela sincronização automática
-- de estoque). Rode no Supabase: SQL Editor > New query > Run.

alter table products add column if not exists ifood_item_id text;

-- Preenchimento: feito manualmente (por segurança — comparar nomes
-- automaticamente arriscaria marcar o produto errado como esgotado).
-- Exemplo de como preencher um produto, depois que soubermos o ID real:
-- update products set ifood_item_id = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx' where id = 'cookie-ferrero';

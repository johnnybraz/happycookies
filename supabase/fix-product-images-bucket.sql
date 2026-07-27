-- Corrige a visibilidade do bucket em si (diferente da visibilidade das
-- imagens dentro dele, que já estava liberada). Sem isso, o Supabase
-- Storage responde "Bucket not found" mesmo o bucket existindo.
-- Rode no Supabase: SQL Editor > New query > Run.

drop policy if exists "Bucket de imagens é visível" on storage.buckets;
create policy "Bucket de imagens é visível" on storage.buckets
  for select using (id = 'product-images');

select id, name, public from storage.buckets where id = 'product-images';

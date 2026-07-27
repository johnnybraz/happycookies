-- Libera escrita (criar/editar) em products e delivery_zones para usuários
-- LOGADOS (Supabase Auth), e cria o bucket de imagens dos produtos.
-- Rode no Supabase: SQL Editor > New query > Run.
-- (Leitura pública continua igual — essas policies só adicionam permissão de escrita.)

create policy "Usuários logados podem inserir produtos" on products
  for insert to authenticated with check (true);

create policy "Usuários logados podem editar produtos" on products
  for update to authenticated using (true) with check (true);

create policy "Usuários logados podem inserir faixas de frete" on delivery_zones
  for insert to authenticated with check (true);

create policy "Usuários logados podem editar faixas de frete" on delivery_zones
  for update to authenticated using (true) with check (true);

create policy "Usuários logados podem excluir faixas de frete" on delivery_zones
  for delete to authenticated using (true);

-- Bucket de imagens dos produtos (público para leitura, upload só para logados)
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy "Qualquer um pode ver as imagens dos produtos" on storage.objects
  for select using (bucket_id = 'product-images');

create policy "Usuários logados podem enviar imagens de produtos" on storage.objects
  for insert to authenticated with check (bucket_id = 'product-images');

create policy "Usuários logados podem atualizar imagens de produtos" on storage.objects
  for update to authenticated using (bucket_id = 'product-images');

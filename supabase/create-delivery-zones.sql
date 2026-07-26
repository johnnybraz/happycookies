-- Faixas de frete por distância (km) até a loja. Rode no Supabase: SQL Editor > New query > Run.
-- Valores iniciais são só um EXEMPLO (baseado no print do iFood que o Johnny mandou) —
-- edite os valores de "fee" direto no Table Editor do Supabase quando quiser.

create table if not exists delivery_zones (
  id bigint generated always as identity primary key,
  max_km numeric not null,
  fee numeric not null,
  created_at timestamptz not null default now()
);

alter table delivery_zones enable row level security;

create policy "Público pode ler faixas de frete" on delivery_zones
  for select using (true);

insert into delivery_zones (max_km, fee) values
  (0.5, 0.99),
  (1.0, 2.99),
  (1.5, 3.99),
  (2.0, 4.99)
on conflict do nothing;

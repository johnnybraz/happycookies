-- Rode este script uma única vez no Supabase: Project > SQL Editor > New query > cole tudo > Run

create table if not exists products (
  id text primary key,
  name text not null,
  description text,
  price numeric not null,
  image text,
  category text not null,
  available boolean not null default true,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists neighborhoods (
  id bigint generated always as identity primary key,
  name text not null unique,
  delivery_fee numeric not null,
  created_at timestamptz not null default now()
);

alter table products enable row level security;
alter table neighborhoods enable row level security;

-- Permite que o site (chave anon, pública) apenas LEIA os dados.
-- Edição de estoque/preço/bairros continua sendo feita por você,
-- logado no painel do Supabase (Table Editor), não pelo site.
create policy "Público pode ler produtos ativos" on products
  for select using (true);

create policy "Público pode ler bairros" on neighborhoods
  for select using (true);

-- Dados iniciais: os mesmos produtos que já existiam no site (CookiesSection.jsx)
insert into products (id, name, description, price, image, category) values
  ('cookie-kinder', 'Cookie Kinder Bueno 90g', 'Cookie de massa de baunilha, com gotas de chocolate ao leite e branco, recheado com creme de Kinder Bueno White e finalizado com pedaços de Kinder Bueno White.', 16.00, 'images/cookies/kinder-bueno.png', 'novidades'),
  ('cookie-mm', 'Cookie M&M''s 100g', 'Cookie de massa de baunilha, com chocolate M&M''s e gotas de chocolate ao leite, finalizado com M&M''s.', 14.00, 'images/cookies/mms.jpg', 'novidades'),
  ('cookie-tradicional', 'Cookie Tradicional 100g', 'Massa de baunilha leve e deliciosa, enriquecida com gotas de chocolate ao leite que garantem um sabor irresistível a cada mordida. Perfeito para qualquer momento do dia!', 11.00, 'images/cookies/tradicional.jpg', 'tradicionais'),
  ('cookie-red-velvet', 'Cookie Red Velvet 100g', 'Massa de red velvet macia e vibrante, combinada com deliciosas gotas de chocolate branco que se derretem na boca. Um clássico irresistível!', 12.00, 'images/cookies/red-velvet.jpg', 'tradicionais'),
  ('cookie-oreo', 'Cookie Oreo 100g', 'Massa de cacau black encorpada, com a suavidade do chocolate branco, o toque marcante do meio amargo e a crocância única de Oreo. Um doce para surpreender!', 12.00, 'images/cookies/oreo.jpg', 'tradicionais'),
  ('cookie-oreo-branco', 'Cookie Oreo Chocolate Branco 100g', 'Massa de cacau black encorpada, com a suavidade do chocolate branco, o toque marcante do meio amargo e a crocância única de Oreo, com um recheio cremoso de chocolate branco para um toque final perfeito!', 15.00, 'images/cookies/oreo-chocolate-branco.jpg', 'recheados'),
  ('cookie-nutella', 'Cookie Nutella 100g', 'Massa de baunilha com gotas de chocolate ao leite, recheada com a cremosidade e o sabor único de Nutella. Um doce para deixar seu dia mais especial!', 14.00, 'images/cookies/nutella.jpg', 'recheados'),
  ('cookie-red-velvet-branco', 'Cookie Red Velvet Chocolate Branco 100g', 'Massa macia e vibrante de red velvet, com a doçura das gotas de chocolate branco e um recheio cremoso de chocolate branco para um toque final perfeito.', 15.00, 'images/cookies/red-velvet-chocolate-branco.jpg', 'recheados'),
  ('cookie-kit-kat', 'Cookie Kit Kat 100g', 'Uma explosão de sabores! Cookie com massa de baunilha, gotas de chocolate e um recheio irresistível de Kit Kat. Crocante por fora, perfeito por dentro!', 14.00, 'images/cookies/kit-kat.jpg', 'recheados'),
  ('marmitinha-nutella', 'Marmitinha de Nutella 200g', 'Doçura irresistível: uma massa de baunilha macia, recheada generosamente com a mais cremosa Nutella. Perfeito para adoçar seu dia.', 26.00, 'images/cookies/marmitinha-nutella.jpg', 'marmitinhas'),
  ('marmitinha-red-velvet', 'Marmitinha de Red Velvet Chocolate Branco 200g', 'A combinação que você ama: Massa macia e vibrante de red velvet com recheio generoso de chocolate branco cremoso. É impossível resistir!', 27.00, 'images/cookies/marmitinha-chocolate-branco.jpg', 'marmitinhas'),
  ('marmitinha-kit-kat', 'Marmitinha de Kit Kat 200g', 'Delícia crocante! Massa de baunilha macia recheada com um creme irresistível de Kit Kat. Uma explosão de sabor em cada colherada.', 26.00, 'images/cookies/marmitinha-kit-kat.jpg', 'marmitinhas'),
  ('marmitinha-oreo', 'Marmitinha de Oreo Chocolate Branco 200g', 'Massa de cacau black encorpada, com a suavidade do chocolate branco, o toque marcante do meio amargo e a crocância única de Oreo, com muito recheio de chocolate branco para um toque final perfeito!', 27.00, 'images/cookies/marmitinha-oreo-chocolate-branco.jpg', 'marmitinhas'),
  ('coca-cola', 'Coca Cola Lata 350ml', 'Coca Cola original, gelada e refrescante.', 6.00, 'images/bebidas/coca-cola.png', 'bebidas'),
  ('coca-cola-zero', 'Coca Cola Zero Lata 350ml', 'Coca Cola Zero Açúcar, gelada e refrescante.', 6.00, 'images/bebidas/coca-cola-zero.png', 'bebidas')
on conflict (id) do nothing;

-- Bairros de exemplo — troque pelos valores reais que você vai me passar,
-- ou edite direto no Table Editor do Supabase depois.
-- insert into neighborhoods (name, delivery_fee) values
--   ('Jardim Tropical', 5.00),
--   ('Nova Ourinhos', 7.00);

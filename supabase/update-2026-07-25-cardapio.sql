-- Atualização do cardápio (2026-07-25): novos preços, remoção do M&M's / Red Velvet e Oreo puros,
-- e inclusão do Ferrero Rocher e Coco Cremoso.
-- Rode no Supabase: Project > SQL Editor > New query > cole tudo > Run

-- Preços atualizados
update products set price = 13.00 where id = 'cookie-tradicional';
update products set price = 16.00 where id = 'cookie-nutella';
update products set price = 16.00 where id = 'cookie-kit-kat';
update products set price = 18.00 where id = 'cookie-red-velvet-branco';
update products set price = 18.00 where id = 'cookie-oreo-branco';
update products set price = 29.00 where id = 'marmitinha-nutella';
update products set price = 29.00 where id = 'marmitinha-kit-kat';
update products set price = 31.00 where id = 'marmitinha-red-velvet';
update products set price = 31.00 where id = 'marmitinha-oreo';
update products set price = 19.00 where id = 'cookie-kinder';

-- Itens que saíram do cardápio (desativados, não apagados — dá pra reativar depois)
update products set active = false where id in ('cookie-mm', 'cookie-red-velvet', 'cookie-oreo');

-- Novos produtos
insert into products (id, name, description, price, image, category, available, active) values
  ('cookie-ferrero', 'Cookie Ferrero Rocher 100g', 'Massa de cacau, com chocolate meio amargo e ao leite, recheado com bombom de Ferrero Rocher e Nutella, finalizado com camada crocante e farelo de amendoim.', 19.00, 'images/cookies/ferrero.jpg', 'novidades', true, true),
  ('cookie-coco-cremoso', 'Cookie Coco Cremoso 100g', 'Massa branca com gotas de chocolate branco, coberta com coco ralado, com um recheio cremoso de coco.', 17.00, 'images/cookies/coco-cremoso.jpg', 'novidades', true, true)
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  image = excluded.image,
  category = excluded.category,
  available = excluded.available,
  active = excluded.active;

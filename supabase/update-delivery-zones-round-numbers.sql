-- Ajusta as faixas de frete pra valores redondos, na mesma proporção do print
-- do iFood que o Johnny mandou (0,99/2,99/3,99/4,99/... viram 1/3/4/5/...).
-- Rode no Supabase: SQL Editor > New query > cole tudo > Run.

delete from delivery_zones;

insert into delivery_zones (max_km, fee) values
  (0.5, 1),
  (1.0, 3),
  (1.5, 4),
  (3.5, 5),   -- cobre 2, 2.5, 3 e 3.5km, que no print do iFood tinham o mesmo valor
  (4.0, 9),
  (5.0, 14),
  (6.0, 15),
  (7.0, 16),
  (10.0, 18),
  (20.0, 40);

-- Acima de 20km: sem faixa cadastrada, então o site mostra "frete a combinar
-- pelo WhatsApp" automaticamente (não tem como dar errado, só não calcula sozinho).

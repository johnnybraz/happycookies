# Happy Cookies — site + checkout + integrações

Delivery de cookies artesanais em Ourinhos/SP. Site também funciona como página de vendas e cardápio online. Dono/operador: Johnny (não programa — sempre explicar passos técnicos de forma simples e direta quando ele estiver acompanhando).

- Site em produção: `happycookies.netlify.app` (domínio próprio `happycookies.site` está com o registro expirado, ainda não renovado)
- Repositório: `github.com/johnnybraz/happycookies` (branch `main`, deploy automático via Netlify a cada push)
- Também vende pelo iFood (loja própria, fora deste repositório)

## Stack

- **React 18** (Create React App, não Vite) + `react-router-dom` + `zustand` (carrinho, `src/store/cartStore.js`, persistido em localStorage)
- **Supabase** (Postgres + REST) como banco de dados — produtos, estoque, faixas de frete
- **Netlify** para hosting + **Netlify Functions** (`netlify/functions/`) para tudo que precisa rodar no servidor (nunca expor chaves no navegador)
- **GitHub Actions** para jobs agendados (sincronização de estoque com iFood)

## Variáveis de ambiente

Local (`.env.local`, nunca commitado):
- `REACT_APP_SUPABASE_URL`, `REACT_APP_SUPABASE_ANON_KEY` — usadas tanto pelo frontend (React) quanto pelas Netlify Functions. É a chave **anon** (pública, só leitura via RLS).

Só no servidor (Netlify Functions / GitHub Actions, nunca com prefixo `REACT_APP_` para não vazar pro bundle do navegador):
- Nenhuma chave paga é necessária hoje (ver seção de frete abaixo — desistimos do Google Maps).

Segredos do GitHub Actions (Settings → Secrets and variables → Actions), para o workflow de sincronização com iFood:
- `IFOOD_CLIENT_ID`, `IFOOD_CLIENT_SECRET`, `IFOOD_MERCHANT_ID`
- `SUPABASE_URL` (mesma URL do projeto, sem prefixo `REACT_APP_`)
- `SUPABASE_SERVICE_ROLE_KEY` — chave que **escreve** no banco (ignora RLS). Só existe aqui, nunca no código, nunca no navegador.

Netlify (Site configuration → Environment variables): mesmas `REACT_APP_SUPABASE_URL` / `REACT_APP_SUPABASE_ANON_KEY`.

## Estrutura relevante

```
src/
  components/CheckoutModal.jsx   # carrinho, endereço, cálculo de frete, geração do cupom, envio pro WhatsApp
  components/CookiesSection.jsx  # busca produtos do Supabase (categoria, disponibilidade)
  components/ProductCard.jsx     # mostra "Esgotado" quando available=false
  lib/supabaseClient.js          # cliente Supabase tolerante (null se env vars ausentes, evita tela branca)
  pages/Links.jsx                # página /links (estilo Linktree), sem header/footer padrão do site
netlify/functions/
  delivery-fee.js                # geocodifica endereço (ou usa GPS), calcula distância de ROTA e retorna a faixa de frete
scripts/
  sync-ifood-stock.js            # roda via GitHub Actions: atualiza products.available a partir do cardápio do iFood
supabase/
  *.sql                          # scripts para rodar manualmente no SQL Editor do Supabase (não há migration runner)
public/cardapio/
  cardapio.png                   # imagem do cardápio; Johnny substitui esse arquivo (mesmo nome) quando atualizar preços
```

## Banco de dados (Supabase)

- `products`: catálogo. Colunas relevantes: `available` (boolean — controla o selo "Esgotado" e desabilita compra, **não** mostra número de estoque), `active` (aparece ou não no site), `ifood_item_id` (nullable — liga o produto ao item correspondente no iFood, ver seção de sincronização).
- `neighborhoods`: **obsoleta**, não é mais usada pelo checkout (ver histórico do frete abaixo). Não removida do banco, só não é mais lida pelo código.
- `delivery_zones`: `max_km`, `fee` — faixas de frete por distância. Editável direto no Table Editor do Supabase.
- Todas as tabelas têm RLS com policy de leitura pública (`for select using (true)`); nenhuma policy de escrita para `anon` — edição é sempre feita por Johnny direto no Supabase Studio (que usa privilégios de dono, não a anon key) ou pelo script de sincronização (que usa a service_role key).
- Scripts SQL ficam em `supabase/*.sql`, nomeados por data/propósito. Rode manualmente no SQL Editor — não há migration runner automatizado.

## Frete: histórico de decisões (importante para não repetir tentativas já descartadas)

1ª tentativa — valor fixo por bairro (tabela `neighborhoods`): implementada e testada, mas descartada porque um mesmo bairro grande (ex. "Centro") tem pontas muito mais perto ou mais longe da loja, e Ourinhos tem ~147 bairros (inviável cadastrar todos com precisão).

2ª tentativa — Google Maps (Geocoding API): tecnicamente a opção mais precisa e confiável, mas **Johnny não tem cartão de crédito internacional**, exigido mesmo no tier gratuito do Google Cloud. Descartada por esse motivo (não por limitação técnica).

**Solução atual**: `netlify/functions/delivery-fee.js` usa serviços abertos e gratuitos, sem chave/cartão:
- **Photon** (`photon.komoot.io`, baseado em OpenStreetMap) para geocodificar o endereço digitado.
- **OSRM** (`router.project-osrm.org`) para calcular a **distância real de rota** (não linha reta — linha reta subestima bastante em cidades sem ruas diretas; já causou frete cobrado a menor num caso real).
- **GPS do navegador** (`navigator.geolocation`) é tentado primeiro, ao salvar o endereço — se o cliente permitir, usa a localização real (mais confiável que qualquer geocodificação por texto); só cai no fluxo de geocodificação por endereço se o GPS for negado ou indisponível.
- Proteção contra falso-positivo: já ocorreu de uma rua inventada "casar" com outra rua real só por compartilhar uma palavra comum (ex. "Padrão"), dando frete errado. A função `looksLikeSameStreet` em `delivery-fee.js` exige que a maioria das palavras da rua digitada tenha correspondência (com tolerância a erro de grafia via Levenshtein) no nome encontrado — não aceita mais um match por uma única palavra em comum.
- Sem SLA garantido (serviços comunitários gratuitos) — se falhar, cai no fallback "frete a combinar pelo WhatsApp" (não trava o pedido).
- Nenhum dos dois serviços requer chave de API nem cartão.

Se um dia reconsiderar Google Maps (ex. se Johnny conseguir um cartão), a troca é isolada dentro de `delivery-fee.js` — o resto do fluxo (Netlify Function + `CheckoutModal.jsx`) não precisa mudar.

## Sincronização de estoque com iFood (Fase 2 — em andamento)

Objetivo: quando Johnny marca um item como esgotado no iFood, o site reflete isso sozinho (hoje ele atualiza manualmente em `products.available` via Supabase — funciona, mas dá trabalho dobrado).

- `scripts/sync-ifood-stock.js`: autentica na API do iFood (`client_credentials`), busca o catálogo, e atualiza `products.available` **só** para produtos com `ifood_item_id` preenchido. Decisão deliberada: não tenta casar por nome parecido (mesma classe de bug do frete — arriscado demais pra algo que afeta venda).
- `.github/workflows/sync-ifood-stock.yml`: roda a cada 15 minutos + permite rodar manual (`workflow_dispatch`).
- **Status atual**: Johnny criou um aplicativo "Centralizado" chamado "Happy Cookies - Sincronização de Estoque" no Portal do Desenvolvedor do iFood, módulo Catalog (+ Merchant), visibilidade "Não listado". Está em processo de **homologação** (ticket aberto, avaliação do próprio iFood contra a loja de teste). Depois de homologado, ainda será preciso solicitar acesso de **produção** vinculado à loja real da Happy Cookies (a homologação roda contra uma loja de teste fake que o iFood gera automaticamente).
- Quando a produção estiver liberada: preciso consultar o catálogo real, mostrar a lista de itens pro Johnny, preencher `ifood_item_id` em cada produto (`supabase/add-ifood-item-id.sql` já criou a coluna), e então cadastrar os secrets reais no GitHub Actions.

## Outras decisões/gotchas

- **Build com `CI=true`** (o que a Netlify usa) trata warnings do ESLint como erro — sempre rodar `CI=true npx react-scripts build` antes de dar como pronto, não só `npm start`.
- **`netlify dev`** local é instável pra subir o CRA sozinho (timeout às vezes) — se travar, tentar de novo ou rodar `npm start` e `netlify dev --target-port 3000` em paralelo. Para testar só a lógica da function, dá pra chamar `require('./netlify/functions/delivery-fee.js').handler(...)` direto via `node -e`, sem precisar do `netlify dev`.
- Opção de "retirar na loja" foi **removida** — só entrega.
- `public/cardapio/cardapio.png`: nome fixo de propósito (não incluir mês/ano no nome), porque a página `/links` aponta pra esse caminho exato. Se Johnny mandar PDF em vez de imagem, atualizar a extensão em `src/pages/Links.jsx`.
- **Painel administrativo (`/admin`)**: construído. Login via Supabase Auth (email/senha — Johnny criou a própria conta em Authentication → Users, não sei a senha). Duas abas: Cardápio (`ProductsTab`/`ProductForm` em `src/pages/Admin.jsx` — criar/editar produto, upload de foto pro bucket `product-images`, desativar/reativar; nunca exclui de verdade) e Entrega (`DeliveryTab` — editar/excluir/criar faixas de `delivery_zones`). Escrita liberada por RLS pra usuários `authenticated` (`supabase/add-admin-write-policies.sql`), não usa service_role no navegador.
  - Gotcha real que já aconteceu: só liberar `storage.objects` (as imagens dentro do bucket) não basta — a própria tabela `storage.buckets` também tem RLS, e sem uma policy de `select` nela o Supabase Storage responde "Bucket not found" mesmo o bucket existindo. Policy corrigida em `supabase/fix-product-images-bucket.sql`. Se um dia criar um bucket novo, lembrar de liberar os dois (buckets E objects).
  - Rota não fica em nenhum menu do site (acesso direto pela URL); a proteção real é login + RLS, não o link escondido.
- Testes manuais (Playwright, `netlify dev`, etc.) usados durante o desenvolvimento são sempre removidos do projeto depois — não faz parte da stack do site, só ferramenta de verificação pontual.

// Sincroniza o estoque (disponível/esgotado) dos produtos do site com o
// cardápio do iFood. Roda via GitHub Actions (.github/workflows/sync-ifood-stock.yml),
// mas também pode ser rodado localmente para testar (veja instruções no fim do arquivo).
//
// Só mexe em produtos que já têm `ifood_item_id` preenchido no Supabase
// (coluna criada em supabase/add-ifood-item-id.sql) — nunca tenta adivinhar
// por nome parecido, para não marcar o produto errado como esgotado.

const IFOOD_CLIENT_ID = process.env.IFOOD_CLIENT_ID;
const IFOOD_CLIENT_SECRET = process.env.IFOOD_CLIENT_SECRET;
const IFOOD_MERCHANT_ID = process.env.IFOOD_MERCHANT_ID;

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const IFOOD_API_BASE = 'https://merchant-api.ifood.com.br';

async function getAccessToken() {
  const response = await fetch(`${IFOOD_API_BASE}/authentication/v1.0/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grantType: 'client_credentials',
      clientId: IFOOD_CLIENT_ID,
      clientSecret: IFOOD_CLIENT_SECRET
    })
  });

  if (!response.ok) {
    throw new Error(`Falha ao autenticar no iFood (HTTP ${response.status}): ${await response.text()}`);
  }

  const data = await response.json();
  return data.accessToken;
}

async function ifoodGet(path, token) {
  const response = await fetch(`${IFOOD_API_BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!response.ok) {
    throw new Error(`Falha ao chamar ${path} (HTTP ${response.status}): ${await response.text()}`);
  }

  return response.json();
}

// Tenta descobrir o status (AVAILABLE/UNAVAILABLE) de um item do iFood.
// A API pode representar isso de formas ligeiramente diferentes dependendo
// da versão/endpoint — tentamos os formatos mais comuns e, se não
// conseguirmos ter certeza, devolvemos null (o item é ignorado, em vez de
// arriscar marcar errado).
function resolveItemStatus(item) {
  const raw = item.status ?? item.availability ?? item?.item?.status;
  if (typeof raw === 'string') {
    const normalized = raw.toUpperCase();
    if (normalized === 'AVAILABLE' || normalized === 'UNAVAILABLE') {
      return normalized === 'AVAILABLE';
    }
  }
  return null;
}

async function fetchAllIfoodItems(token, merchantId) {
  const catalogs = await ifoodGet(`/catalog/v2.0/merchants/${merchantId}/catalogs`, token);
  const items = [];

  for (const catalog of catalogs) {
    const categories = await ifoodGet(
      `/catalog/v2.0/merchants/${merchantId}/catalogs/${catalog.catalogId}/categories`,
      token
    );

    for (const category of categories) {
      let categoryItems = category.items;

      // Se a listagem de categorias não trouxer os itens já embutidos,
      // busca os detalhes da categoria separadamente.
      if (!categoryItems) {
        const details = await ifoodGet(
          `/catalog/v2.0/merchants/${merchantId}/categories/${category.id}`,
          token
        );
        categoryItems = details.items || [];
      }

      items.push(...categoryItems);
    }
  }

  return items;
}

async function fetchMappedProducts() {
  const url = `${SUPABASE_URL}/rest/v1/products?select=id,name,ifood_item_id,available&ifood_item_id=not.is.null`;
  const response = await fetch(url, {
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
    }
  });

  if (!response.ok) {
    throw new Error(`Falha ao buscar produtos no Supabase (HTTP ${response.status}): ${await response.text()}`);
  }

  return response.json();
}

async function updateProductAvailability(productId, available) {
  const url = `${SUPABASE_URL}/rest/v1/products?id=eq.${productId}`;
  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal'
    },
    body: JSON.stringify({ available })
  });

  if (!response.ok) {
    throw new Error(`Falha ao atualizar produto ${productId} (HTTP ${response.status}): ${await response.text()}`);
  }
}

async function main() {
  const missingEnv = ['IFOOD_CLIENT_ID', 'IFOOD_CLIENT_SECRET', 'IFOOD_MERCHANT_ID', 'SUPABASE_SERVICE_ROLE_KEY']
    .filter(key => !process.env[key]);
  if (missingEnv.length > 0 || !SUPABASE_URL) {
    console.error('Faltam variáveis de ambiente:', missingEnv.length > 0 ? missingEnv.join(', ') : 'SUPABASE_URL');
    process.exit(1);
  }

  console.log('Autenticando no iFood...');
  const token = await getAccessToken();

  console.log('Buscando cardápio do iFood...');
  const ifoodItems = await fetchAllIfoodItems(token, IFOOD_MERCHANT_ID);
  console.log(`${ifoodItems.length} item(ns) encontrado(s) no iFood.`);
  if (ifoodItems.length > 0) {
    console.log('Exemplo de item (para conferir o formato):', JSON.stringify(ifoodItems[0]));
  }

  const ifoodItemsById = new Map(ifoodItems.map(item => [item.id ?? item.itemId, item]));

  console.log('Buscando produtos mapeados no Supabase...');
  const products = await fetchMappedProducts();
  console.log(`${products.length} produto(s) com ifood_item_id cadastrado.`);

  let updated = 0;
  let skipped = 0;
  let notFound = 0;

  for (const product of products) {
    const ifoodItem = ifoodItemsById.get(product.ifood_item_id);

    if (!ifoodItem) {
      console.warn(`Não encontrado no iFood: "${product.name}" (ifood_item_id=${product.ifood_item_id})`);
      notFound++;
      continue;
    }

    const isAvailable = resolveItemStatus(ifoodItem);
    if (isAvailable === null) {
      console.warn(`Não foi possível determinar o status de "${product.name}" — ignorado nesta rodada.`);
      skipped++;
      continue;
    }

    if (isAvailable === product.available) {
      continue; // já está correto, não precisa gravar
    }

    await updateProductAvailability(product.id, isAvailable);
    console.log(`Atualizado: "${product.name}" -> ${isAvailable ? 'disponível' : 'esgotado'}`);
    updated++;
  }

  console.log(`Concluído. ${updated} atualizado(s), ${skipped} ignorado(s), ${notFound} não encontrado(s) no iFood.`);
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});

// Para testar localmente:
// IFOOD_CLIENT_ID=... IFOOD_CLIENT_SECRET=... IFOOD_MERCHANT_ID=... \
// SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/sync-ifood-stock.js

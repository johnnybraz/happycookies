// Calcula o frete a partir da distância de ROTA (de moto/carro, não em linha
// reta) entre o endereço do cliente e o endereço fixo da loja, usando faixas
// de km cadastradas no Supabase (tabela `delivery_zones`).
// Geocodificação via Photon e cálculo de rota via OSRM — ambos serviços
// abertos baseados no OpenStreetMap, gratuitos e sem necessidade de
// chave/cartão. Nenhum dos dois tem SLA garantido; se falharem, a distância
// cai para linha reta (Haversine) como aproximação, e se nada funcionar, cai
// no fallback "frete a combinar pelo WhatsApp".

// Coordenadas de "Rua Narciso Nicolosi, 652 - Jardim Tropical - Ourinhos/SP",
// obtidas via Photon.
const STORE_LAT = -22.9790462;
const STORE_LNG = -49.8827132;

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;

function toRad(value) {
  return (value * Math.PI) / 180;
}

// Distância em linha reta entre dois pontos (fórmula de Haversine), em km.
function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const STREET_STOPWORDS = new Set([
  'rua', 'r', 'avenida', 'av', 'alameda', 'al', 'travessa', 'praca', 'praça',
  'rodovia', 'estrada', 'das', 'dos', 'da', 'do', 'de', 'ourinhos', 'sp', 'brasil'
]);

function normalizeTokens(text) {
  return (text || '')
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '') // remove acentos
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(token => token && !STREET_STOPWORDS.has(token));
}

function levenshtein(a, b) {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[a.length][b.length];
}

// Duas palavras "batem" se forem iguais ou só tiverem um pequeno erro de
// digitação/grafia (tolerância cresce um pouco com o tamanho da palavra).
function tokensMatch(a, b) {
  if (a === b) return true;
  const maxDistance = Math.max(1, Math.floor(Math.max(a.length, b.length) * 0.2));
  return levenshtein(a, b) <= maxDistance;
}

// Confere se a maioria das palavras da rua digitada tem uma palavra parecida
// no nome encontrado — evita aceitar uma rua que só coincide numa palavra
// comum, mas que na real é outro lugar da cidade (já causou frete errado).
function looksLikeSameStreet(typedStreet, foundName) {
  const typedTokens = normalizeTokens(typedStreet);
  const foundTokens = normalizeTokens(foundName);
  if (typedTokens.length === 0 || foundTokens.length === 0) return true;

  const matchedCount = typedTokens.filter(
    typedToken => foundTokens.some(foundToken => tokensMatch(typedToken, foundToken))
  ).length;

  return matchedCount / typedTokens.length >= 0.5;
}

async function geocodeAddress(address, typedStreet) {
  const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(address)}&lat=${STORE_LAT}&lon=${STORE_LNG}&limit=1`;
  const response = await fetch(url, {
    headers: { 'User-Agent': 'HappyCookies/1.0 (atendimento.happycookies@gmail.com)' }
  });
  const data = await response.json();

  const feature = data.features?.[0];
  if (!feature) return null;

  const city = (feature.properties.city || '').toLowerCase();
  if (city && city !== 'ourinhos') return null;

  if (!looksLikeSameStreet(typedStreet, feature.properties.name)) {
    return null;
  }

  const [lng, lat] = feature.geometry.coordinates;
  return { lat, lng };
}

// Distância real percorrendo as ruas (rota de moto/carro), em km. Usa o OSRM
// (servidor público de demonstração, gratuito). Se falhar, devolve null e
// quem chamou usa a distância em linha reta como aproximação.
async function routeDistanceKm(lat1, lng1, lat2, lng2) {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${lng1},${lat1};${lng2},${lat2}?overview=false`;
    const response = await fetch(url);
    const data = await response.json();
    const meters = data.routes?.[0]?.distance;
    return typeof meters === 'number' ? meters / 1000 : null;
  } catch (error) {
    return null;
  }
}

async function fetchDeliveryZones() {
  const url = `${SUPABASE_URL}/rest/v1/delivery_zones?select=max_km,fee&order=max_km.asc`;
  const response = await fetch(url, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`
    }
  });

  if (!response.ok) return [];
  return response.json();
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Método não permitido' }) };
  }

  try {
    const { street, city, state, lat, lng } = JSON.parse(event.body || '{}');

    let location;
    if (typeof lat === 'number' && typeof lng === 'number') {
      // Localização real do celular do cliente (GPS) — a mais confiável,
      // não depende de adivinhar o endereço.
      location = { lat, lng };
    } else {
      // O Photon funciona melhor como busca livre (tipo um campo de pesquisa) do
      // que como parser de endereço estruturado — número e bairro juntos tendem a
      // confundir a busca sem ganhar precisão real (a zona de frete já é por km).
      const fullAddress = [street, city, state, 'Brasil'].filter(Boolean).join(' ');
      location = await geocodeAddress(fullAddress, street);
    }

    if (!location) {
      return { statusCode: 200, body: JSON.stringify({ fee: null, reason: 'address_not_found' }) };
    }

    const distanceKm =
      (await routeDistanceKm(STORE_LAT, STORE_LNG, location.lat, location.lng)) ??
      haversineKm(STORE_LAT, STORE_LNG, location.lat, location.lng);

    const zones = await fetchDeliveryZones();
    const zone = zones.find(z => distanceKm <= Number(z.max_km));

    if (!zone) {
      return {
        statusCode: 200,
        body: JSON.stringify({ fee: null, reason: 'out_of_range', distanceKm })
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ fee: Number(zone.fee), distanceKm })
    };
  } catch (error) {
    return {
      statusCode: 200,
      body: JSON.stringify({ fee: null, reason: 'error', message: error.message })
    };
  }
};

// Calcula o frete a partir da distância (linha reta) entre o endereço do cliente
// e o endereço fixo da loja, usando faixas de km cadastradas no Supabase (tabela
// `delivery_zones`). Geocodificação via Photon (photon.komoot.io) — serviço aberto
// baseado no OpenStreetMap, gratuito e sem necessidade de chave/cartão. Não tem SLA
// garantido; se falhar, cai no fallback "frete a combinar pelo WhatsApp".

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

async function geocodeAddress(address) {
  const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(address)}&lat=${STORE_LAT}&lon=${STORE_LNG}&limit=1`;
  const response = await fetch(url, {
    headers: { 'User-Agent': 'HappyCookies/1.0 (atendimento.happycookies@gmail.com)' }
  });
  const data = await response.json();

  const feature = data.features?.[0];
  if (!feature) return null;

  const city = (feature.properties.city || '').toLowerCase();
  if (city && city !== 'ourinhos') return null;

  const [lng, lat] = feature.geometry.coordinates;
  return { lat, lng };
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
    const { street, city, state } = JSON.parse(event.body || '{}');
    // O Photon funciona melhor como busca livre (tipo um campo de pesquisa) do
    // que como parser de endereço estruturado — número e bairro juntos tendem a
    // confundir a busca sem ganhar precisão real (a zona de frete já é por km).
    const fullAddress = [street, city, state, 'Brasil'].filter(Boolean).join(' ');

    const location = await geocodeAddress(fullAddress);
    if (!location) {
      return { statusCode: 200, body: JSON.stringify({ fee: null, reason: 'address_not_found' }) };
    }

    const distanceKm = haversineKm(STORE_LAT, STORE_LNG, location.lat, location.lng);
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

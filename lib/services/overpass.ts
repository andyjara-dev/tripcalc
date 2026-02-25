import type { NearbyCategory, NearbyPlace } from '@/lib/types/nearby';

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';

// Mapeo de categorías a tags OSM
const CATEGORY_TAGS: Record<NearbyCategory, string[]> = {
  museum: ['["amenity"="museum"]', '["tourism"="museum"]'],
  restaurant: ['["amenity"="restaurant"]'],
  cafe: ['["amenity"="cafe"]'],
  bar: ['["amenity"="bar"]', '["amenity"="pub"]'],
  attraction: ['["tourism"="attraction"]', '["tourism"="artwork"]'],
  park: ['["leisure"="park"]'],
  viewpoint: ['["tourism"="viewpoint"]'],
  pharmacy: ['["amenity"="pharmacy"]'],
  hotel: ['["tourism"="hotel"]'],
  laundry: ['["amenity"="laundry"]', '["shop"="laundry"]', '["shop"="dry_cleaning"]'],
};

/**
 * Calcula distancia en metros entre dos coordenadas (fórmula Haversine)
 */
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // Radio de la Tierra en metros
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Construye una query Overpass para una categoría dada
 */
function buildOverpassQuery(lat: number, lon: number, category: NearbyCategory, radiusMeters: number): string {
  const tags = CATEGORY_TAGS[category];
  const around = `(around:${radiusMeters},${lat},${lon})`;

  // Construir nodos y ways para cada tag
  const nodeWayStatements = tags.flatMap(tag => [
    `node${tag}${around};`,
    `way${tag}${around};`,
  ]);

  return `[out:json][timeout:15];
(
  ${nodeWayStatements.join('\n  ')}
);
out center 20;`;
}

/**
 * Capitaliza la primera letra de cada palabra
 */
function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

/**
 * Construye una descripción útil a partir de los tags OSM según la categoría
 * - Restaurantes/cafés/bares: tipo de cocina, opciones veganas/vegetarianas
 * - Hoteles: estrellas
 * - Museos/atracciones/miradores: entrada gratuita o de pago, descripción corta
 * - Parques: descripción corta
 */
function buildDescription(tags: Record<string, string>, category: NearbyCategory): string | undefined {
  const parts: string[] = [];

  switch (category) {
    case 'restaurant':
    case 'cafe':
    case 'bar': {
      // Tipo de cocina: "italian;pizza" → "Italian, Pizza"
      const cuisine = tags.cuisine;
      if (cuisine) {
        const formatted = cuisine
          .split(';')
          .map(c => capitalize(c.trim().replace(/_/g, ' ')))
          .join(', ');
        parts.push(formatted);
      }
      // Dieta
      if (tags['diet:vegan'] === 'only') {
        parts.push('🌱 Vegan');
      } else if (tags['diet:vegetarian'] === 'only') {
        parts.push('🌱 Vegetarian');
      } else if (tags['diet:vegetarian'] === 'yes') {
        parts.push('🌱 Veg options');
      }
      break;
    }

    case 'hotel': {
      // Estrellas
      const stars = tags.stars || tags['tourism:stars'];
      if (stars) {
        const n = parseInt(stars, 10);
        if (!isNaN(n) && n > 0 && n <= 5) {
          parts.push('⭐'.repeat(n));
        }
      }
      break;
    }

    case 'museum':
    case 'attraction':
    case 'viewpoint': {
      // Tarifa de entrada
      const fee = tags.fee;
      if (fee === 'no' || fee === 'free') {
        parts.push('🆓 Free');
      } else if (fee === 'yes') {
        parts.push('🎟️ Entrance fee');
      }
      // Descripción corta (preferir inglés, fallback genérico)
      const desc = tags['description:en'] || tags['description:es'] || tags.description;
      if (desc && desc.length <= 80) {
        parts.push(desc);
      }
      break;
    }

    case 'park': {
      const desc = tags['description:en'] || tags['description:es'] || tags.description;
      if (desc && desc.length <= 80) {
        parts.push(desc);
      }
      break;
    }

    case 'pharmacy': {
      if (tags.dispensing === 'yes') {
        parts.push('💊 Dispensary');
      }
      break;
    }

    case 'laundry': {
      if (tags.shop === 'dry_cleaning') {
        parts.push('Dry cleaning');
      } else {
        parts.push('Self-service / Drop-off');
      }
      if (tags['service:laundry:self_service'] === 'yes') {
        parts.push('🪙 Coin-op');
      }
      break;
    }
  }

  return parts.length > 0 ? parts.join(' · ') : undefined;
}

/**
 * Parsea un elemento Overpass y lo convierte en NearbyPlace
 */
function parseElement(element: any, category: NearbyCategory, centerLat: number, centerLon: number): NearbyPlace | null {
  const tags = element.tags || {};
  const name = tags.name || tags['name:en'] || tags['name:es'];

  // Solo incluir elementos con nombre
  if (!name) return null;

  // Coordenadas: nodos tienen lat/lon directo, ways tienen center
  const lat = element.lat ?? element.center?.lat;
  const lon = element.lon ?? element.center?.lon;

  if (!lat || !lon) return null;

  // Construir dirección a partir de tags OSM
  let address: string | undefined;
  const street = tags['addr:street'];
  const houseNumber = tags['addr:housenumber'];
  if (street && houseNumber) {
    address = `${street} ${houseNumber}`;
  } else if (street) {
    address = street;
  }

  return {
    id: `${element.type}/${element.id}`,
    name,
    category,
    lat,
    lon,
    address,
    description: buildDescription(tags, category),
    website: tags.website || tags.url || undefined,
    openingHours: tags.opening_hours || undefined,
    distance: haversineDistance(centerLat, centerLon, lat, lon),
  };
}

/**
 * Busca lugares cercanos usando la Overpass API (OpenStreetMap)
 */
export async function searchNearby(
  lat: number,
  lon: number,
  category: NearbyCategory,
  radiusMeters: number
): Promise<NearbyPlace[]> {
  const query = buildOverpassQuery(lat, lon, category, radiusMeters);

  const response = await fetch(OVERPASS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `data=${encodeURIComponent(query)}`,
    signal: AbortSignal.timeout(20000),
  });

  if (!response.ok) {
    throw new Error(`Overpass API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  if (!data.elements || !Array.isArray(data.elements)) {
    return [];
  }

  // Parsear, filtrar nulls y ordenar por distancia
  const places = data.elements
    .map((el: any) => parseElement(el, category, lat, lon))
    .filter((p: NearbyPlace | null): p is NearbyPlace => p !== null)
    .sort((a: NearbyPlace, b: NearbyPlace) => (a.distance ?? 0) - (b.distance ?? 0))
    .slice(0, 20);

  return places;
}

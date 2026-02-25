export type NearbyCategory =
  | 'museum'
  | 'restaurant'
  | 'cafe'
  | 'bar'
  | 'attraction'
  | 'park'
  | 'viewpoint'
  | 'pharmacy'
  | 'hotel'
  | 'laundry';

export const NEARBY_CATEGORIES: NearbyCategory[] = [
  'museum',
  'restaurant',
  'cafe',
  'bar',
  'attraction',
  'park',
  'viewpoint',
  'pharmacy',
  'hotel',
  'laundry',
];

export const CATEGORY_ICONS: Record<NearbyCategory, string> = {
  museum: '🏛️',
  restaurant: '🍽️',
  cafe: '☕',
  bar: '🍺',
  attraction: '🗺️',
  park: '🌳',
  viewpoint: '👁️',
  pharmacy: '💊',
  hotel: '🏨',
  laundry: '👕',
};

export interface NearbyPlace {
  id: string;          // "node/123456" o "way/789"
  name: string;
  category: NearbyCategory;
  lat: number;
  lon: number;
  address?: string;    // del tag addr:street + addr:housenumber
  description?: string; // info útil: cocina, estrellas, entrada gratis, etc.
  website?: string;    // tag website
  openingHours?: string; // tag opening_hours
  distance?: number;   // metros desde el centro de búsqueda
}

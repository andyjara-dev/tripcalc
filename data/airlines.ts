/**
 * Static airline data with luggage rules
 * Used as fallback when database is empty
 */

export interface StaticAirlineLuggage {
  id: string;
  type: string;
  dimensions: string;
  weightKg: number;
  notes: string | null;
}

export interface StaticAirline {
  id: string;
  name: string;
  code: string | null;
  country: string | null;
  region: string | null;
  luggage: StaticAirlineLuggage[];
}

const airlinesData: StaticAirline[] = [
  {
    id: 'latam', name: 'LATAM Airlines', code: 'LA', country: 'Chile', region: 'Latin America',
    luggage: [
      { id: 'latam-checked', type: 'checked', dimensions: '158 lineales', weightKg: 23, notes: null },
      { id: 'latam-carry-on', type: 'carry-on', dimensions: '55x35x25', weightKg: 12, notes: null },
      { id: 'latam-personal', type: 'personal', dimensions: '45x35x20', weightKg: 10, notes: null },
    ],
  },
  {
    id: 'sky', name: 'Sky Airline', code: 'H2', country: 'Chile', region: 'Latin America',
    luggage: [
      { id: 'sky-checked', type: 'checked', dimensions: '158 lineales', weightKg: 23, notes: null },
      { id: 'sky-carry-on', type: 'carry-on', dimensions: '55x35x25', weightKg: 10, notes: null },
      { id: 'sky-personal', type: 'personal', dimensions: '25x35x45', weightKg: 10, notes: null },
    ],
  },
  {
    id: 'jetsmart', name: 'JetSMART', code: 'JA', country: 'Chile', region: 'Latin America',
    luggage: [
      { id: 'jetsmart-checked', type: 'checked', dimensions: '158 lineales', weightKg: 23, notes: null },
      { id: 'jetsmart-carry-on', type: 'carry-on', dimensions: '55x35x25', weightKg: 10, notes: null },
      { id: 'jetsmart-personal', type: 'personal', dimensions: '25x35x45', weightKg: 10, notes: null },
    ],
  },
  {
    id: 'aerolineas-argentinas', name: 'Aerolineas Argentinas', code: 'AR', country: 'Argentina', region: 'Latin America',
    luggage: [
      { id: 'aerolineas-argentinas-checked', type: 'checked', dimensions: '158 lineales', weightKg: 23, notes: null },
      { id: 'aerolineas-argentinas-carry-on', type: 'carry-on', dimensions: '55x35x25', weightKg: 8, notes: null },
      { id: 'aerolineas-argentinas-personal', type: 'personal', dimensions: '40x30x15', weightKg: 3, notes: null },
    ],
  },
  {
    id: 'iberia', name: 'Iberia', code: 'IB', country: 'Spain', region: 'Europe',
    luggage: [
      { id: 'iberia-checked', type: 'checked', dimensions: '158 lineales', weightKg: 23, notes: null },
      { id: 'iberia-carry-on', type: 'carry-on', dimensions: '56x40x25', weightKg: 10, notes: null },
      { id: 'iberia-personal', type: 'personal', dimensions: '40x30x15', weightKg: 3, notes: null },
    ],
  },
  {
    id: 'american-airlines', name: 'American Airlines', code: 'AA', country: 'United States', region: 'North America',
    luggage: [
      { id: 'american-airlines-checked', type: 'checked', dimensions: '158 lineales', weightKg: 23, notes: null },
      { id: 'american-airlines-carry-on', type: 'carry-on', dimensions: '56x36x23', weightKg: 18, notes: null },
      { id: 'american-airlines-personal', type: 'personal', dimensions: '45x35x20', weightKg: 8, notes: null },
    ],
  },
  {
    id: 'avianca', name: 'Avianca', code: 'AV', country: 'Colombia', region: 'Latin America',
    luggage: [
      { id: 'avianca-checked', type: 'checked', dimensions: '158 lineales', weightKg: 23, notes: null },
      { id: 'avianca-carry-on', type: 'carry-on', dimensions: '55x35x25', weightKg: 10, notes: null },
      { id: 'avianca-personal', type: 'personal', dimensions: '40x35x25', weightKg: 2, notes: null },
    ],
  },
  {
    id: 'air-canada', name: 'Air Canada', code: 'AC', country: 'Canada', region: 'North America',
    luggage: [
      { id: 'air-canada-checked', type: 'checked', dimensions: '158 lineales', weightKg: 23, notes: null },
      { id: 'air-canada-carry-on', type: 'carry-on', dimensions: '55x40x23', weightKg: 10, notes: null },
      { id: 'air-canada-personal', type: 'personal', dimensions: '33x43x16', weightKg: 8, notes: null },
    ],
  },
  {
    id: 'copa', name: 'Copa Airlines', code: 'CM', country: 'Panama', region: 'Latin America',
    luggage: [
      { id: 'copa-checked', type: 'checked', dimensions: '158 lineales', weightKg: 23, notes: null },
      { id: 'copa-carry-on', type: 'carry-on', dimensions: '56x36x26', weightKg: 10, notes: null },
      { id: 'copa-personal', type: 'personal', dimensions: '43x25x22', weightKg: 5, notes: null },
    ],
  },
  {
    id: 'united', name: 'United Airlines', code: 'UA', country: 'United States', region: 'North America',
    luggage: [
      { id: 'united-checked', type: 'checked', dimensions: '158 lineales', weightKg: 23, notes: null },
      { id: 'united-carry-on', type: 'carry-on', dimensions: '56x35x23', weightKg: 10, notes: null },
      { id: 'united-personal', type: 'personal', dimensions: '43x25x22', weightKg: 8, notes: null },
    ],
  },
  {
    id: 'air-france', name: 'Air France', code: 'AF', country: 'France', region: 'Europe',
    luggage: [
      { id: 'air-france-checked', type: 'checked', dimensions: '158 lineales', weightKg: 23, notes: null },
      { id: 'air-france-carry-on', type: 'carry-on', dimensions: '55x35x25', weightKg: 12, notes: null },
      { id: 'air-france-personal', type: 'personal', dimensions: '40x30x15', weightKg: 12, notes: null },
    ],
  },
  {
    id: 'delta', name: 'Delta Air Lines', code: 'DL', country: 'United States', region: 'North America',
    luggage: [
      { id: 'delta-checked', type: 'checked', dimensions: '158 lineales', weightKg: 23, notes: null },
      { id: 'delta-carry-on', type: 'carry-on', dimensions: '56x35x23', weightKg: 10, notes: null },
      { id: 'delta-personal', type: 'personal', dimensions: '45x35x20', weightKg: 8, notes: null },
    ],
  },
  {
    id: 'aeromexico', name: 'Aeromexico', code: 'AM', country: 'Mexico', region: 'Latin America',
    luggage: [
      { id: 'aeromexico-checked', type: 'checked', dimensions: '158 lineales', weightKg: 23, notes: null },
      { id: 'aeromexico-carry-on', type: 'carry-on', dimensions: '55x40x25', weightKg: 7, notes: null },
      { id: 'aeromexico-personal', type: 'personal', dimensions: '36x23x43', weightKg: 3, notes: null },
    ],
  },
  {
    id: 'british-airways', name: 'British Airways', code: 'BA', country: 'United Kingdom', region: 'Europe',
    luggage: [
      { id: 'british-airways-checked', type: 'checked', dimensions: '158 lineales', weightKg: 23, notes: null },
      { id: 'british-airways-carry-on', type: 'carry-on', dimensions: '56x45x25', weightKg: 23, notes: null },
      { id: 'british-airways-personal', type: 'personal', dimensions: '40x30x15', weightKg: 23, notes: null },
    ],
  },
  {
    id: 'qantas', name: 'Qantas', code: 'QF', country: 'Australia', region: 'Oceania',
    luggage: [
      { id: 'qantas-checked', type: 'checked', dimensions: '158 lineales', weightKg: 23, notes: null },
      { id: 'qantas-carry-on', type: 'carry-on', dimensions: '56x36x23', weightKg: 7, notes: null },
      { id: 'qantas-personal', type: 'personal', dimensions: '40x30x20', weightKg: 2, notes: null },
    ],
  },
  {
    id: 'klm', name: 'KLM', code: 'KL', country: 'Netherlands', region: 'Europe',
    luggage: [
      { id: 'klm-checked', type: 'checked', dimensions: '158 lineales', weightKg: 23, notes: null },
      { id: 'klm-carry-on', type: 'carry-on', dimensions: '55x35x25', weightKg: 12, notes: null },
      { id: 'klm-personal', type: 'personal', dimensions: '40x30x15', weightKg: 12, notes: null },
    ],
  },
  {
    id: 'qatar', name: 'Qatar Airways', code: 'QR', country: 'Qatar', region: 'Middle East',
    luggage: [
      { id: 'qatar-checked', type: 'checked', dimensions: '158 lineales', weightKg: 23, notes: null },
      { id: 'qatar-carry-on', type: 'carry-on', dimensions: '50x37x25', weightKg: 7, notes: null },
      { id: 'qatar-personal', type: 'personal', dimensions: '40x30x15', weightKg: 3, notes: null },
    ],
  },
  {
    id: 'gol', name: 'Gol Linhas Aereas', code: 'G3', country: 'Brazil', region: 'Latin America',
    luggage: [
      { id: 'gol-checked', type: 'checked', dimensions: '158 lineales', weightKg: 23, notes: null },
      { id: 'gol-carry-on', type: 'carry-on', dimensions: '55x35x25', weightKg: 12, notes: null },
      { id: 'gol-personal', type: 'personal', dimensions: '40x30x20', weightKg: 10, notes: null },
    ],
  },
  {
    id: 'arajet', name: 'Arajet', code: 'DM', country: 'Dominican Republic', region: 'Caribbean',
    luggage: [
      { id: 'arajet-checked', type: 'checked', dimensions: '158 lineales', weightKg: 23, notes: null },
      { id: 'arajet-carry-on', type: 'carry-on', dimensions: '55x40x25', weightKg: 10, notes: null },
      { id: 'arajet-personal', type: 'personal', dimensions: '40x25x20', weightKg: 6, notes: null },
    ],
  },
  {
    id: 'boa', name: 'BoA (Boliviana de Aviacion)', code: 'OB', country: 'Bolivia', region: 'Latin America',
    luggage: [
      { id: 'boa-checked', type: 'checked', dimensions: '158 lineales', weightKg: 23, notes: null },
      { id: 'boa-carry-on', type: 'carry-on', dimensions: '55x20x35', weightKg: 7, notes: null },
      { id: 'boa-personal', type: 'personal', dimensions: '40x30x20', weightKg: 5, notes: null },
    ],
  },
  {
    id: 'ryanair', name: 'Ryanair', code: 'FR', country: 'Ireland', region: 'Europe',
    luggage: [
      { id: 'ryanair-checked', type: 'checked', dimensions: '81x119x119', weightKg: 20, notes: null },
      { id: 'ryanair-carry-on', type: 'carry-on', dimensions: '55x40x20', weightKg: 10, notes: null },
      { id: 'ryanair-personal', type: 'personal', dimensions: '40x30x20', weightKg: 0, notes: null },
    ],
  },
  {
    id: 'easyjet', name: 'easyJet', code: 'U2', country: 'United Kingdom', region: 'Europe',
    luggage: [
      { id: 'easyjet-checked', type: 'checked', dimensions: '275x100x230', weightKg: 23, notes: null },
      { id: 'easyjet-carry-on', type: 'carry-on', dimensions: '56x45x25', weightKg: 15, notes: null },
      { id: 'easyjet-personal', type: 'personal', dimensions: '45x36x20', weightKg: 0, notes: null },
    ],
  },
  {
    id: 'emirates', name: 'Emirates', code: 'EK', country: 'United Arab Emirates', region: 'Middle East',
    luggage: [
      { id: 'emirates-checked', type: 'checked', dimensions: '150', weightKg: 30, notes: null },
      { id: 'emirates-carry-on', type: 'carry-on', dimensions: '55x38x20', weightKg: 7, notes: null },
      { id: 'emirates-personal', type: 'personal', dimensions: '0', weightKg: 0, notes: null },
    ],
  },
  {
    id: 'singapore-airlines', name: 'Singapore Airlines', code: 'SQ', country: 'Singapore', region: 'Asia',
    luggage: [
      { id: 'singapore-airlines-checked', type: 'checked', dimensions: '158', weightKg: 30, notes: null },
      { id: 'singapore-airlines-carry-on', type: 'carry-on', dimensions: '55x40x20', weightKg: 7, notes: null },
      { id: 'singapore-airlines-personal', type: 'personal', dimensions: '40x30x10', weightKg: 0, notes: null },
    ],
  },
  {
    id: 'lufthansa', name: 'Lufthansa', code: 'LH', country: 'Germany', region: 'Europe',
    luggage: [
      { id: 'lufthansa-checked', type: 'checked', dimensions: '158', weightKg: 23, notes: null },
      { id: 'lufthansa-carry-on', type: 'carry-on', dimensions: '55x40x23', weightKg: 8, notes: null },
      { id: 'lufthansa-personal', type: 'personal', dimensions: '40x30x10', weightKg: 0, notes: null },
    ],
  },
  {
    id: 'turkish-airlines', name: 'Turkish Airlines', code: 'TK', country: 'Turkey', region: 'Europe',
    luggage: [
      { id: 'turkish-airlines-checked', type: 'checked', dimensions: '158', weightKg: 23, notes: null },
      { id: 'turkish-airlines-carry-on', type: 'carry-on', dimensions: '55x40x23', weightKg: 8, notes: null },
      { id: 'turkish-airlines-personal', type: 'personal', dimensions: '40x30x15', weightKg: 4, notes: null },
    ],
  },
  {
    id: 'wingo', name: 'Wingo Airlines', code: 'P5', country: 'Colombia', region: 'Latin America',
    luggage: [
      { id: 'wingo-checked', type: 'checked', dimensions: '158', weightKg: 23, notes: null },
      { id: 'wingo-carry-on', type: 'carry-on', dimensions: '55x45x25', weightKg: 12, notes: null },
      { id: 'wingo-personal', type: 'personal', dimensions: '40x35x25', weightKg: 10, notes: null },
    ],
  },
  {
    id: 'viva-air', name: 'Viva Air', code: 'VH', country: 'Colombia', region: 'Latin America',
    luggage: [
      { id: 'viva-air-checked', type: 'checked', dimensions: '158', weightKg: 20, notes: null },
      { id: 'viva-air-carry-on', type: 'carry-on', dimensions: '55x45x25', weightKg: 12, notes: null },
      { id: 'viva-air-personal', type: 'personal', dimensions: '40x35x25', weightKg: 6, notes: null },
    ],
  },
  {
    id: 'air-europa', name: 'Air Europa', code: 'UX', country: 'Spain', region: 'Europe',
    luggage: [
      { id: 'air-europa-checked', type: 'checked', dimensions: '158', weightKg: 23, notes: null },
      { id: 'air-europa-carry-on', type: 'carry-on', dimensions: '55x35x25', weightKg: 10, notes: null },
      { id: 'air-europa-personal', type: 'personal', dimensions: '40x30x15', weightKg: 0, notes: null },
    ],
  },
  {
    id: 'volaris', name: 'Volaris', code: 'Y4', country: 'Mexico', region: 'Latin America',
    luggage: [
      { id: 'volaris-checked', type: 'checked', dimensions: '158', weightKg: 25, notes: null },
      { id: 'volaris-carry-on', type: 'carry-on', dimensions: '56x41x25', weightKg: 10, notes: null },
      { id: 'volaris-personal', type: 'personal', dimensions: '45x35x20', weightKg: 10, notes: null },
    ],
  },
  {
    id: 'norwegian', name: 'Norwegian Air', code: 'DY', country: 'Norway', region: 'Europe',
    luggage: [
      { id: 'norwegian-checked', type: 'checked', dimensions: '250', weightKg: 23, notes: null },
      { id: 'norwegian-carry-on', type: 'carry-on', dimensions: '55x40x23', weightKg: 10, notes: null },
      { id: 'norwegian-personal', type: 'personal', dimensions: '30x40x20', weightKg: 0, notes: null },
    ],
  },
];

export function getAllAirlines() {
  return airlinesData.map(({ luggage, ...airline }) => airline);
}

export function getAirlineById(id: string) {
  return airlinesData.find(a => a.id === id) || null;
}

export function getAirlineLuggage(airlineId: string) {
  const airline = airlinesData.find(a => a.id === airlineId);
  return airline?.luggage || [];
}

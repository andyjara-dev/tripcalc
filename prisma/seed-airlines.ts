import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// CSV data parsed
const airlinesData = [
  {
    name: 'LATAM Airlines',
    code: 'LA',
    country: 'Chile',
    region: 'Latin America',
    luggage: [
      { type: 'checked', dimensions: '158 lineales', weightKg: 23 },
      { type: 'carry-on', dimensions: '55x35x25', weightKg: 12 },
      { type: 'personal', dimensions: '45x35x20', weightKg: 10 },
    ],
  },
  {
    name: 'Sky Airline',
    code: 'H2',
    country: 'Chile',
    region: 'Latin America',
    luggage: [
      { type: 'checked', dimensions: '158 lineales', weightKg: 23 },
      { type: 'carry-on', dimensions: '55x35x25', weightKg: 10 },
      { type: 'personal', dimensions: '25x35x45', weightKg: 10 },
    ],
  },
  {
    name: 'JetSMART',
    code: 'JA',
    country: 'Chile',
    region: 'Latin America',
    luggage: [
      { type: 'checked', dimensions: '158 lineales', weightKg: 23 },
      { type: 'carry-on', dimensions: '55x35x25', weightKg: 10 },
      { type: 'personal', dimensions: '25x35x45', weightKg: 10 },
    ],
  },
  {
    name: 'Aerolineas Argentinas',
    code: 'AR',
    country: 'Argentina',
    region: 'Latin America',
    luggage: [
      { type: 'checked', dimensions: '158 lineales', weightKg: 23 },
      { type: 'carry-on', dimensions: '55x35x25', weightKg: 8 },
      { type: 'personal', dimensions: '40x30x15', weightKg: 3 },
    ],
  },
  {
    name: 'Iberia',
    code: 'IB',
    country: 'Spain',
    region: 'Europe',
    luggage: [
      { type: 'checked', dimensions: '158 lineales', weightKg: 23 },
      { type: 'carry-on', dimensions: '56x40x25', weightKg: 10 },
      { type: 'personal', dimensions: '40x30x15', weightKg: 3 },
    ],
  },
  {
    name: 'American Airlines',
    code: 'AA',
    country: 'United States',
    region: 'North America',
    luggage: [
      { type: 'checked', dimensions: '158 lineales', weightKg: 23 },
      { type: 'carry-on', dimensions: '56x36x23', weightKg: 18 },
      { type: 'personal', dimensions: '45x35x20', weightKg: 8 },
    ],
  },
  {
    name: 'Avianca',
    code: 'AV',
    country: 'Colombia',
    region: 'Latin America',
    luggage: [
      { type: 'checked', dimensions: '158 lineales', weightKg: 23 },
      { type: 'carry-on', dimensions: '55x35x25', weightKg: 10 },
      { type: 'personal', dimensions: '40x35x25', weightKg: 2 },
    ],
  },
  {
    name: 'Air Canada',
    code: 'AC',
    country: 'Canada',
    region: 'North America',
    luggage: [
      { type: 'checked', dimensions: '158 lineales', weightKg: 23 },
      { type: 'carry-on', dimensions: '55x40x23', weightKg: 10 },
      { type: 'personal', dimensions: '33x43x16', weightKg: 8 },
    ],
  },
  {
    name: 'Copa Airlines',
    code: 'CM',
    country: 'Panama',
    region: 'Latin America',
    luggage: [
      { type: 'checked', dimensions: '158 lineales', weightKg: 23 },
      { type: 'carry-on', dimensions: '56x36x26', weightKg: 10 },
      { type: 'personal', dimensions: '36x30x20', weightKg: 5 },
    ],
  },
  {
    name: 'United Airlines',
    code: 'UA',
    country: 'United States',
    region: 'North America',
    luggage: [
      { type: 'checked', dimensions: '158 lineales', weightKg: 23 },
      { type: 'carry-on', dimensions: '56x35x23', weightKg: 10 },
      { type: 'personal', dimensions: '43x25x22', weightKg: 8 },
    ],
  },
  {
    name: 'Air France',
    code: 'AF',
    country: 'France',
    region: 'Europe',
    luggage: [
      { type: 'checked', dimensions: '158 lineales', weightKg: 23 },
      { type: 'carry-on', dimensions: '55x35x25', weightKg: 12 },
      { type: 'personal', dimensions: '40x30x15', weightKg: 12 },
    ],
  },
  {
    name: 'Delta Air Lines',
    code: 'DL',
    country: 'United States',
    region: 'North America',
    luggage: [
      { type: 'checked', dimensions: '158 lineales', weightKg: 23 },
      { type: 'carry-on', dimensions: '56x35x23', weightKg: 10 },
      { type: 'personal', dimensions: '45x35x20', weightKg: 8 },
    ],
  },
  {
    name: 'Aeromexico',
    code: 'AM',
    country: 'Mexico',
    region: 'Latin America',
    luggage: [
      { type: 'checked', dimensions: '158 lineales', weightKg: 23 },
      { type: 'carry-on', dimensions: '55x40x25', weightKg: 7 },
      { type: 'personal', dimensions: '36x23x43', weightKg: 3 },
    ],
  },
  {
    name: 'British Airways',
    code: 'BA',
    country: 'United Kingdom',
    region: 'Europe',
    luggage: [
      { type: 'checked', dimensions: '158 lineales', weightKg: 23 },
      { type: 'carry-on', dimensions: '56x45x25', weightKg: 23 },
      { type: 'personal', dimensions: '40x30x15', weightKg: 23 },
    ],
  },
  {
    name: 'Qantas',
    code: 'QF',
    country: 'Australia',
    region: 'Oceania',
    luggage: [
      { type: 'checked', dimensions: '158 lineales', weightKg: 23 },
      { type: 'carry-on', dimensions: '56x36x23', weightKg: 7 },
      { type: 'personal', dimensions: '40x30x20', weightKg: 2 },
    ],
  },
  {
    name: 'KLM',
    code: 'KL',
    country: 'Netherlands',
    region: 'Europe',
    luggage: [
      { type: 'checked', dimensions: '158 lineales', weightKg: 23 },
      { type: 'carry-on', dimensions: '55x35x25', weightKg: 12 },
      { type: 'personal', dimensions: '40x30x15', weightKg: 12 },
    ],
  },
  {
    name: 'Qatar Airways',
    code: 'QR',
    country: 'Qatar',
    region: 'Middle East',
    luggage: [
      { type: 'checked', dimensions: '158 lineales', weightKg: 23 },
      { type: 'carry-on', dimensions: '50x37x25', weightKg: 7 },
      { type: 'personal', dimensions: '40x30x15', weightKg: 3 },
    ],
  },
  {
    name: 'Gol Linhas Aereas',
    code: 'G3',
    country: 'Brazil',
    region: 'Latin America',
    luggage: [
      { type: 'checked', dimensions: '158 lineales', weightKg: 23 },
      { type: 'carry-on', dimensions: '55x35x25', weightKg: 12 },
      { type: 'personal', dimensions: '40x30x20', weightKg: 10 },
    ],
  },
  {
    name: 'Arajet',
    code: 'DM',
    country: 'Dominican Republic',
    region: 'Caribbean',
    luggage: [
      { type: 'checked', dimensions: '158 lineales', weightKg: 23 },
      { type: 'carry-on', dimensions: '55x40x25', weightKg: 10 },
      { type: 'personal', dimensions: '40x25x20', weightKg: 6 },
    ],
  },
  {
    name: 'BoA (Boliviana de Aviacion)',
    code: 'OB',
    country: 'Bolivia',
    region: 'Latin America',
    luggage: [
      { type: 'checked', dimensions: '158 lineales', weightKg: 23 },
      { type: 'carry-on', dimensions: '55x20x35', weightKg: 7 },
      { type: 'personal', dimensions: '40x30x20', weightKg: 5 },
    ],
  },
  {
    name: 'Ryanair',
    code: 'FR',
    country: 'Ireland',
    region: 'Europe',
    luggage: [
      { type: 'checked', dimensions: '81x119x119', weightKg: 20 },
      { type: 'carry-on', dimensions: '55x40x20', weightKg: 10 },
      { type: 'personal', dimensions: '40x30x20', weightKg: 0 }, // No weight limit specified
    ],
  },
  {
    name: 'easyJet',
    code: 'U2',
    country: 'United Kingdom',
    region: 'Europe',
    luggage: [
      { type: 'checked', dimensions: '275x100x230', weightKg: 23 },
      { type: 'carry-on', dimensions: '56x45x25', weightKg: 15 },
      { type: 'personal', dimensions: '45x36x20', weightKg: 0 }, // No weight limit specified
    ],
  },
  {
    name: 'Emirates',
    code: 'EK',
    country: 'United Arab Emirates',
    region: 'Middle East',
    luggage: [
      { type: 'checked', dimensions: '150', weightKg: 30 }, // Economy: 30kg or 2x23kg depending on route
      { type: 'carry-on', dimensions: '55x38x20', weightKg: 7 },
      { type: 'personal', dimensions: '0', weightKg: 0 }, // Not allowed separately in Economy
    ],
  },
  {
    name: 'Singapore Airlines',
    code: 'SQ',
    country: 'Singapore',
    region: 'Asia',
    luggage: [
      { type: 'checked', dimensions: '158', weightKg: 30 }, // Economy
      { type: 'carry-on', dimensions: '55x40x20', weightKg: 7 },
      { type: 'personal', dimensions: '40x30x10', weightKg: 0 },
    ],
  },
  {
    name: 'Lufthansa',
    code: 'LH',
    country: 'Germany',
    region: 'Europe',
    luggage: [
      { type: 'checked', dimensions: '158', weightKg: 23 }, // Economy
      { type: 'carry-on', dimensions: '55x40x23', weightKg: 8 },
      { type: 'personal', dimensions: '40x30x10', weightKg: 0 },
    ],
  },
  {
    name: 'Turkish Airlines',
    code: 'TK',
    country: 'Turkey',
    region: 'Europe',
    luggage: [
      { type: 'checked', dimensions: '158', weightKg: 23 }, // Economy
      { type: 'carry-on', dimensions: '55x40x23', weightKg: 8 },
      { type: 'personal', dimensions: '40x30x15', weightKg: 4 },
    ],
  },
  {
    name: 'Wingo Airlines',
    code: 'P5',
    country: 'Colombia',
    region: 'Latin America',
    luggage: [
      { type: 'checked', dimensions: '158', weightKg: 23 },
      { type: 'carry-on', dimensions: '55x45x25', weightKg: 12 },
      { type: 'personal', dimensions: '40x35x25', weightKg: 10 },
    ],
  },
  {
    name: 'Viva Air',
    code: 'VH',
    country: 'Colombia',
    region: 'Latin America',
    luggage: [
      { type: 'checked', dimensions: '158', weightKg: 20 },
      { type: 'carry-on', dimensions: '55x45x25', weightKg: 12 },
      { type: 'personal', dimensions: '40x35x25', weightKg: 6 },
    ],
  },
  {
    name: 'Air Europa',
    code: 'UX',
    country: 'Spain',
    region: 'Europe',
    luggage: [
      { type: 'checked', dimensions: '158', weightKg: 23 }, // Economy
      { type: 'carry-on', dimensions: '55x35x25', weightKg: 10 },
      { type: 'personal', dimensions: '40x30x15', weightKg: 0 },
    ],
  },
  {
    name: 'Volaris',
    code: 'Y4',
    country: 'Mexico',
    region: 'Latin America',
    luggage: [
      { type: 'checked', dimensions: '158', weightKg: 25 },
      { type: 'carry-on', dimensions: '56x41x25', weightKg: 10 }, // Basic fare combined weight
      { type: 'personal', dimensions: '45x35x20', weightKg: 10 }, // Combined with carry-on
    ],
  },
  {
    name: 'Norwegian Air',
    code: 'DY',
    country: 'Norway',
    region: 'Europe',
    luggage: [
      { type: 'checked', dimensions: '250', weightKg: 23 }, // LowFare+
      { type: 'carry-on', dimensions: '55x40x23', weightKg: 10 },
      { type: 'personal', dimensions: '30x40x20', weightKg: 0 }, // Included in 10kg combined
    ],
  },
];

async function main() {
  console.log('🛫 Seeding airlines database...');

  for (const airlineData of airlinesData) {
    const { luggage, ...airlineInfo } = airlineData;

    // Create or update airline
    const airline = await prisma.airline.upsert({
      where: { name: airlineInfo.name },
      update: airlineInfo,
      create: airlineInfo,
    });

    console.log(`✓ Created/Updated airline: ${airline.name}`);

    // Create luggage rules
    for (const rule of luggage) {
      await prisma.airlineLuggage.upsert({
        where: {
          // Use composite unique constraint
          id: `${airline.id}-${rule.type}`,
        },
        update: {
          dimensions: rule.dimensions,
          weightKg: rule.weightKg,
        },
        create: {
          id: `${airline.id}-${rule.type}`,
          airlineId: airline.id,
          type: rule.type,
          dimensions: rule.dimensions,
          weightKg: rule.weightKg,
        },
      });
    }

    console.log(`  ✓ Created ${luggage.length} luggage rules`);
  }

  console.log('✅ Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

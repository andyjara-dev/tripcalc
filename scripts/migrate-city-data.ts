/**
 * Migrate city data from TypeScript files to database
 * Usage: npx tsx scripts/migrate-city-data.ts
 */

import { prisma } from '../lib/db';
import { getAllCities } from '../data/cities';

type LegacyCityData = {
  id: string;
  name: string;
  country: string;
  currency: string;
  currencySymbol: string;
  language: string;
  transport: any;
  dailyCosts: any;
  tips: any;
  cash: any;
  lastUpdated: string;
};

async function migrateCityData() {
  console.log('🚀 Starting city data migration...\n');

  const cities = getAllCities() as LegacyCityData[];

  console.log(`Found ${cities.length} cities to migrate\n`);

  for (const cityData of cities) {
    console.log(`\n📍 Processing ${cityData.name}...`);

    // Check if city exists
    let city = await prisma.city.findUnique({
      where: { id: cityData.id },
      include: {
        dailyCosts: true,
        transport: true,
        tips: true,
        cashInfo: true,
      },
    });

    if (!city) {
      console.log(`   ⚠️  City "${cityData.name}" not found in database. Skipping...`);
      continue;
    }

    let stats = {
      dailyCosts: 0,
      transport: 0,
      tips: 0,
      cashInfo: false,
    };

    // Migrate Daily Costs
    console.log('   💰 Migrating daily costs...');
    const travelStyles = ['budget', 'midRange', 'luxury'] as const;

    for (const style of travelStyles) {
      const costs = cityData.dailyCosts[style];
      if (!costs) continue;

      // Check if already exists
      const existing = city.dailyCosts.find(c => c.travelStyle === style);

      if (existing) {
        console.log(`      - ${style}: Already exists, skipping`);
      } else {
        await prisma.cityDailyCost.create({
          data: {
            cityId: city.id,
            travelStyle: style,
            accommodation: Math.round(costs.accommodation * 100),
            food: Math.round(costs.food * 100),
            transport: Math.round(costs.transport * 100),
            activities: Math.round(costs.activities * 100),
          },
        });
        stats.dailyCosts++;
        console.log(`      - ${style}: ✅ Created`);
      }
    }

    // Migrate Transport Options
    console.log('   🚇 Migrating transport options...');

    // Metro
    if (cityData.transport.metro) {
      const metro = cityData.transport.metro;

      if (metro.singleTicket && !city.transport.some(t => t.type === 'metro' && t.name.includes('Single'))) {
        await prisma.cityTransport.create({
          data: {
            cityId: city.id,
            type: 'metro',
            name: 'Metro Single Ticket',
            price: Math.round(metro.singleTicket * 100),
            priceNote: 'Per ride',
          },
        });
        stats.transport++;
        console.log('      - Metro Single Ticket: ✅');
      }

      if (metro.dayPass && !city.transport.some(t => t.type === 'metro' && t.name.includes('Day Pass'))) {
        await prisma.cityTransport.create({
          data: {
            cityId: city.id,
            type: 'metro',
            name: 'Metro Day Pass',
            price: Math.round(metro.dayPass * 100),
            priceNote: 'Unlimited for 1 day',
          },
        });
        stats.transport++;
        console.log('      - Metro Day Pass: ✅');
      }

      if (metro.multiTicket && !city.transport.some(t => t.type === 'metro' && t.name.includes('Multi'))) {
        await prisma.cityTransport.create({
          data: {
            cityId: city.id,
            type: 'metro',
            name: `T-${metro.multiTicket.rides || 10} Card`,
            price: Math.round(metro.multiTicket.price * 100),
            priceNote: `${metro.multiTicket.rides || 10} rides`,
          },
        });
        stats.transport++;
        console.log(`      - T-${metro.multiTicket.rides || 10} Card: ✅`);
      }
    }

    // Bus
    if (cityData.transport.bus) {
      const bus = cityData.transport.bus;

      if (bus.singleTicket && !city.transport.some(t => t.type === 'bus' && t.name.includes('Single'))) {
        await prisma.cityTransport.create({
          data: {
            cityId: city.id,
            type: 'bus',
            name: 'Bus Single Ticket',
            price: Math.round(bus.singleTicket * 100),
            priceNote: 'Per ride',
          },
        });
        stats.transport++;
        console.log('      - Bus Single Ticket: ✅');
      }

      if (bus.dayPass && !city.transport.some(t => t.type === 'bus' && t.name.includes('Day Pass'))) {
        await prisma.cityTransport.create({
          data: {
            cityId: city.id,
            type: 'bus',
            name: 'Bus Day Pass',
            price: Math.round(bus.dayPass * 100),
            priceNote: 'Unlimited for 1 day',
          },
        });
        stats.transport++;
        console.log('      - Bus Day Pass: ✅');
      }
    }

    // Taxi
    if (cityData.transport.taxi) {
      const taxi = cityData.transport.taxi;

      if (taxi.baseRate && !city.transport.some(t => t.type === 'taxi' && t.name.includes('Base'))) {
        await prisma.cityTransport.create({
          data: {
            cityId: city.id,
            type: 'taxi',
            name: 'Taxi Base Fare',
            price: Math.round(taxi.baseRate * 100),
            priceNote: 'Starting fare',
          },
        });
        stats.transport++;
        console.log('      - Taxi Base Fare: ✅');
      }

      if (taxi.perKm && !city.transport.some(t => t.type === 'taxi' && t.name.includes('Per km'))) {
        await prisma.cityTransport.create({
          data: {
            cityId: city.id,
            type: 'taxi',
            name: 'Taxi Per km',
            price: Math.round(taxi.perKm * 100),
            priceNote: 'Per kilometer',
          },
        });
        stats.transport++;
        console.log('      - Taxi Per km: ✅');
      }
    }

    // Uber
    if (cityData.transport.uber?.available && cityData.transport.uber.averageAirportToCity) {
      if (!city.transport.some(t => t.type === 'uber' && t.name.includes('Airport'))) {
        await prisma.cityTransport.create({
          data: {
            cityId: city.id,
            type: 'uber',
            name: 'Uber - Airport to City',
            price: Math.round(cityData.transport.uber.averageAirportToCity * 100),
            priceNote: 'Average fare',
          },
        });
        stats.transport++;
        console.log('      - Uber Airport to City: ✅');
      }
    }

    // Train
    if (cityData.transport.train?.airportToCity) {
      if (!city.transport.some(t => t.type === 'train' && t.name.includes('Airport'))) {
        await prisma.cityTransport.create({
          data: {
            cityId: city.id,
            type: 'train',
            name: 'Airport Train',
            price: Math.round(cityData.transport.train.airportToCity * 100),
            priceNote: 'One way',
          },
        });
        stats.transport++;
        console.log('      - Airport Train: ✅');
      }
    }

    // Colectivo (shared taxis - specific to some cities like Santiago)
    if (cityData.transport.colectivo?.averageFare) {
      if (!city.transport.some(t => t.type === 'other' && t.name.includes('Colectivo'))) {
        await prisma.cityTransport.create({
          data: {
            cityId: city.id,
            type: 'other',
            name: 'Colectivo (Shared Taxi)',
            price: Math.round(cityData.transport.colectivo.averageFare * 100),
            priceNote: 'Average fare',
            description: 'Shared taxi service, common in Santiago',
          },
        });
        stats.transport++;
        console.log('      - Colectivo: ✅');
      }
    }

    // Migrate Tips
    console.log('   💡 Migrating tips...');

    const tipCategories = {
      restaurants: 'food',
      cafes: 'food',
      taxis: 'transport',
      general: 'general',
    };

    for (const [key, category] of Object.entries(tipCategories)) {
      const tipContent = cityData.tips[key];
      if (!tipContent) continue;

      const title = key.charAt(0).toUpperCase() + key.slice(1);
      if (!city.tips.some(t => t.category === category && t.title.includes(title))) {
        await prisma.cityTip.create({
          data: {
            cityId: city.id,
            category,
            title: `Tipping - ${title}`,
            content: tipContent,
            order: Object.keys(tipCategories).indexOf(key),
          },
        });
        stats.tips++;
        console.log(`      - ${title}: ✅`);
      }
    }

    // Migrate Cash Info
    console.log('   💵 Migrating cash info...');

    if (!city.cashInfo && cityData.cash) {
      const cash = cityData.cash;

      // Determine cash needed level
      let cashNeeded: 'low' | 'medium' | 'high' = 'medium';
      if (cash.widelyAccepted === false || cash.recommendedAmount?.includes('widely accepted')) {
        cashNeeded = 'low';
      } else if (cash.recommendedAmount?.toLowerCase().includes('essential') ||
                 cash.recommendedAmount?.toLowerCase().includes('200-300')) {
        cashNeeded = 'high';
      }

      // Determine cards accepted
      let cardsAccepted: 'widely' | 'most-places' | 'limited' = 'widely';
      if (cash.widelyAccepted === false || cash.recommendedAmount?.includes('widely accepted')) {
        cardsAccepted = 'widely';
      } else if (cash.recommendedAmount?.toLowerCase().includes('limited')) {
        cardsAccepted = 'limited';
      } else {
        cardsAccepted = 'most-places';
      }

      // Determine ATM availability
      let atmAvailability: 'everywhere' | 'common' | 'limited' = 'common';
      if (cash.atmAvailability?.toLowerCase().includes('everywhere') ||
          cash.atmAvailability?.toLowerCase().includes('very common')) {
        atmAvailability = 'everywhere';
      } else if (cash.atmAvailability?.toLowerCase().includes('limited')) {
        atmAvailability = 'limited';
      }

      await prisma.cityCashInfo.create({
        data: {
          cityId: city.id,
          cashNeeded,
          cardsAccepted,
          atmAvailability,
          recommendations: cash.recommendedAmount || 'Check local payment customs',
          atmFees: cash.atmFees || null,
        },
      });
      stats.cashInfo = true;
      console.log('      - Cash Info: ✅');
    } else if (city.cashInfo) {
      console.log('      - Cash Info: Already exists, skipping');
    }

    console.log(`\n   ✅ ${cityData.name} migration complete!`);
    console.log(`      Daily Costs: +${stats.dailyCosts}`);
    console.log(`      Transport: +${stats.transport}`);
    console.log(`      Tips: +${stats.tips}`);
    console.log(`      Cash Info: ${stats.cashInfo ? '✅' : 'Already exists'}`);
  }

  console.log('\n\n✅ All cities migrated successfully!');
  console.log('\nRun: npx tsx scripts/verify-city-data.ts to verify');
}

migrateCityData()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

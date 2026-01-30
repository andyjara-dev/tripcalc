/**
 * Seed script to migrate static city data to database
 * Run with: npx tsx prisma/seed-cities.ts
 */

import { PrismaClient } from '@prisma/client';
import { barcelona } from '../data/cities/barcelona';
import { tokyo } from '../data/cities/tokyo';
import { paris } from '../data/cities/paris';
import { newYork } from '../data/cities/new-york';
import { mexicoCity } from '../data/cities/mexico-city';
import type { CityData } from '../data/cities/types';

const prisma = new PrismaClient();

// Helper to convert currency to cents (smallest unit)
function toCents(amount: number): number {
  return Math.round(amount * 100);
}

async function seedCity(cityData: CityData) {
  console.log(`\n📍 Seeding ${cityData.name}...`);

  // 1. Create or update city
  const city = await prisma.city.upsert({
    where: { id: cityData.id },
    create: {
      id: cityData.id,
      name: cityData.name,
      country: cityData.country,
      currency: cityData.currency,
      currencySymbol: cityData.currencySymbol,
      language: cityData.language,
      lastUpdated: cityData.lastUpdated,
      isPublished: true, // Publish existing cities by default
    },
    update: {
      name: cityData.name,
      country: cityData.country,
      currency: cityData.currency,
      currencySymbol: cityData.currencySymbol,
      language: cityData.language,
      lastUpdated: cityData.lastUpdated,
    },
  });

  console.log(`  ✓ City created: ${city.id}`);

  // 2. Create daily costs for each travel style
  const travelStyles = ['budget', 'midRange', 'luxury'] as const;

  for (const style of travelStyles) {
    const costs = cityData.dailyCosts[style];

    await prisma.cityDailyCost.upsert({
      where: {
        // Find existing by city and style combination
        id: `${cityData.id}-${style}`, // Temporary workaround
      },
      create: {
        cityId: city.id,
        travelStyle: style,
        accommodation: toCents(costs.accommodation),
        food: toCents(costs.food),
        transport: toCents(costs.transport),
        activities: toCents(costs.activities),
      },
      update: {
        accommodation: toCents(costs.accommodation),
        food: toCents(costs.food),
        transport: toCents(costs.transport),
        activities: toCents(costs.activities),
      },
    }).catch(async () => {
      // If upsert fails (no existing record), just create
      return await prisma.cityDailyCost.create({
        data: {
          cityId: city.id,
          travelStyle: style,
          accommodation: toCents(costs.accommodation),
          food: toCents(costs.food),
          transport: toCents(costs.transport),
          activities: toCents(costs.activities),
        },
      });
    });
  }

  console.log(`  ✓ Daily costs created (3 styles)`);

  // 3. Create transport options
  // Delete existing transport options first to avoid duplicates
  await prisma.cityTransport.deleteMany({
    where: { cityId: city.id },
  });

  let transportCount = 0;

  if (cityData.transport.metro) {
    const metro = cityData.transport.metro;

    await prisma.cityTransport.create({
      data: {
        cityId: city.id,
        type: 'metro',
        name: 'Single Ticket',
        price: toCents(metro.singleTicket),
        priceNote: 'Per ride',
      },
    });
    transportCount++;

    if (metro.dayPass) {
      await prisma.cityTransport.create({
        data: {
          cityId: city.id,
          type: 'metro',
          name: 'Day Pass',
          price: toCents(metro.dayPass),
          priceNote: 'Unlimited rides for 1 day',
        },
      });
      transportCount++;
    }

    if (metro.multiTicket) {
      await prisma.cityTransport.create({
        data: {
          cityId: city.id,
          type: 'metro',
          name: `T-Casual (${metro.multiTicket.rides} rides)`,
          price: toCents(metro.multiTicket.price),
          priceNote: `${metro.multiTicket.rides} rides`,
        },
      });
      transportCount++;
    }
  }

  if (cityData.transport.bus) {
    const bus = cityData.transport.bus;

    await prisma.cityTransport.create({
      data: {
        cityId: city.id,
        type: 'bus',
        name: 'Single Ticket',
        price: toCents(bus.singleTicket),
        priceNote: 'Per ride',
      },
    });
    transportCount++;

    if (bus.dayPass) {
      await prisma.cityTransport.create({
        data: {
          cityId: city.id,
          type: 'bus',
          name: 'Day Pass',
          price: toCents(bus.dayPass),
          priceNote: 'Unlimited rides for 1 day',
        },
      });
      transportCount++;
    }
  }

  if (cityData.transport.taxi) {
    const taxi = cityData.transport.taxi;

    await prisma.cityTransport.create({
      data: {
        cityId: city.id,
        type: 'taxi',
        name: 'Base Fare',
        price: toCents(taxi.baseRate),
        priceNote: 'Starting fare',
      },
    });
    transportCount++;

    await prisma.cityTransport.create({
      data: {
        cityId: city.id,
        type: 'taxi',
        name: 'Per Kilometer',
        price: toCents(taxi.perKm),
        priceNote: 'Per km',
      },
    });
    transportCount++;

    if (taxi.perMinute) {
      await prisma.cityTransport.create({
        data: {
          cityId: city.id,
          type: 'taxi',
          name: 'Per Minute',
          price: toCents(taxi.perMinute),
          priceNote: 'Waiting time',
        },
      });
      transportCount++;
    }
  }

  if (cityData.transport.uber?.available) {
    const uber = cityData.transport.uber;

    if (uber.averageAirportToCity) {
      await prisma.cityTransport.create({
        data: {
          cityId: city.id,
          type: 'uber',
          name: 'Airport to City Center',
          price: toCents(uber.averageAirportToCity),
          priceNote: 'Average price',
          description: 'Typical Uber fare from airport to city center',
        },
      });
      transportCount++;
    }
  }

  if (cityData.transport.train?.airportToCity) {
    await prisma.cityTransport.create({
      data: {
        cityId: city.id,
        type: 'train',
        name: 'Airport Train',
        price: toCents(cityData.transport.train.airportToCity),
        priceNote: 'Airport to city center',
      },
    });
    transportCount++;
  }

  console.log(`  ✓ Transport options created (${transportCount})`);

  // 4. Create tips
  await prisma.cityTip.deleteMany({
    where: { cityId: city.id },
  });

  const tipCategories = [
    { category: 'restaurants', title: 'Restaurants', content: cityData.tips.restaurants },
    { category: 'cafes', title: 'Cafes', content: cityData.tips.cafes },
    { category: 'taxis', title: 'Taxis', content: cityData.tips.taxis },
    { category: 'general', title: 'General Tipping', content: cityData.tips.general },
  ];

  let tipCount = 0;
  for (const [index, tip] of tipCategories.entries()) {
    await prisma.cityTip.create({
      data: {
        cityId: city.id,
        category: tip.category,
        title: tip.title,
        content: tip.content,
        order: index,
      },
    });
    tipCount++;
  }

  console.log(`  ✓ Tips created (${tipCount})`);

  // 5. Create cash info
  await prisma.cityCashInfo.deleteMany({
    where: { cityId: city.id },
  });

  await prisma.cityCashInfo.create({
    data: {
      cityId: city.id,
      cashNeeded: cityData.cash.widelyAccepted ? 'low' : 'medium',
      cardsAccepted: cityData.cash.widelyAccepted ? 'widely' : 'most-places',
      atmAvailability: cityData.cash.atmAvailability.toLowerCase().includes('everywhere')
        ? 'everywhere'
        : cityData.cash.atmAvailability.toLowerCase().includes('common')
        ? 'common'
        : 'limited',
      recommendations: cityData.cash.recommendedAmount,
      atmFees: cityData.cash.atmFees,
    },
  });

  console.log(`  ✓ Cash info created`);

  console.log(`✅ ${cityData.name} seeded successfully!\n`);
}

async function main() {
  console.log('🌍 Starting city data migration...\n');

  const cities = [barcelona, tokyo, paris, newYork, mexicoCity];

  for (const city of cities) {
    try {
      await seedCity(city);
    } catch (error) {
      console.error(`❌ Error seeding ${city.name}:`, error);
      throw error;
    }
  }

  console.log('✅ All cities seeded successfully!');

  // Print summary
  const cityCount = await prisma.city.count();
  const costsCount = await prisma.cityDailyCost.count();
  const transportCount = await prisma.cityTransport.count();
  const tipsCount = await prisma.cityTip.count();
  const cashCount = await prisma.cityCashInfo.count();

  console.log('\n📊 Database Summary:');
  console.log(`  Cities: ${cityCount}`);
  console.log(`  Daily costs: ${costsCount}`);
  console.log(`  Transport options: ${transportCount}`);
  console.log(`  Tips: ${tipsCount}`);
  console.log(`  Cash info: ${cashCount}`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

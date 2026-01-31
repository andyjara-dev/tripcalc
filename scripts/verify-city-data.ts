/**
 * Verify which city data is migrated to the database
 * Usage: npx tsx scripts/verify-city-data.ts
 */

import { prisma } from '../lib/db';

async function verifyCityData() {
  console.log('🔍 Checking city data in database...\n');

  const cities = await prisma.city.findMany({
    include: {
      dailyCosts: true,
      transport: true,
      tips: true,
      cashInfo: true,
    },
    orderBy: { name: 'asc' },
  });

  if (cities.length === 0) {
    console.log('❌ No cities found in database!');
    return;
  }

  console.log(`Found ${cities.length} cities:\n`);

  for (const city of cities) {
    console.log(`📍 ${city.name} (${city.id})`);
    console.log(`   Country: ${city.country}`);
    console.log(`   Currency: ${city.currencySymbol}${city.currency}`);
    console.log(`   Published: ${city.isPublished ? '✅' : '❌'}`);

    // Check additional data
    console.log(`   Additional Data:`);
    console.log(`      Daily Costs: ${city.dailyCosts.length} travel styles ${city.dailyCosts.length > 0 ? '✅' : '❌'}`);

    if (city.dailyCosts.length > 0) {
      city.dailyCosts.forEach(cost => {
        console.log(`         - ${cost.travelStyle}: ${city.currencySymbol}${(cost.accommodation + cost.food + cost.transport + cost.activities) / 100}/day`);
      });
    }

    console.log(`      Transport: ${city.transport.length} options ${city.transport.length > 0 ? '✅' : '❌'}`);

    if (city.transport.length > 0) {
      const types = [...new Set(city.transport.map(t => t.type))];
      console.log(`         Types: ${types.join(', ')}`);
    }

    console.log(`      Tips: ${city.tips.length} tips ${city.tips.length > 0 ? '✅' : '❌'}`);

    if (city.tips.length > 0) {
      const categories = [...new Set(city.tips.map(t => t.category))];
      console.log(`         Categories: ${categories.join(', ')}`);
    }

    console.log(`      Cash Info: ${city.cashInfo ? '✅' : '❌'}`);

    if (city.cashInfo) {
      console.log(`         Cash Needed: ${city.cashInfo.cashNeeded}`);
      console.log(`         Cards: ${city.cashInfo.cardsAccepted}`);
      console.log(`         ATMs: ${city.cashInfo.atmAvailability}`);
    }

    console.log('');
  }

  // Summary
  const withDailyCosts = cities.filter(c => c.dailyCosts.length > 0).length;
  const withTransport = cities.filter(c => c.transport.length > 0).length;
  const withTips = cities.filter(c => c.tips.length > 0).length;
  const withCashInfo = cities.filter(c => c.cashInfo !== null).length;

  console.log('📊 Summary:');
  console.log(`   Cities with Daily Costs: ${withDailyCosts}/${cities.length}`);
  console.log(`   Cities with Transport: ${withTransport}/${cities.length}`);
  console.log(`   Cities with Tips: ${withTips}/${cities.length}`);
  console.log(`   Cities with Cash Info: ${withCashInfo}/${cities.length}`);

  if (withDailyCosts === cities.length &&
      withTransport === cities.length &&
      withTips === cities.length &&
      withCashInfo === cities.length) {
    console.log('\n✅ All cities have complete data!');
  } else {
    console.log('\n⚠️  Some cities are missing additional data.');
    console.log('   Run: npx tsx scripts/migrate-city-data.ts');
  }
}

verifyCityData()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

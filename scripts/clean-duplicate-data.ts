/**
 * Clean duplicate city data from database
 * Usage: npx tsx scripts/clean-duplicate-data.ts
 */

import { prisma } from '../lib/db';

async function cleanDuplicates() {
  console.log('🧹 Cleaning duplicate city data...\n');

  const cities = await prisma.city.findMany({
    include: {
      dailyCosts: true,
      transport: true,
      tips: true,
      cashInfo: true,
    },
  });

  let totalDeleted = {
    dailyCosts: 0,
    transport: 0,
    tips: 0,
  };

  for (const city of cities) {
    console.log(`\n📍 ${city.name}`);

    // Clean duplicate daily costs
    const dailyCostsByStyle: Record<string, any[]> = {};
    city.dailyCosts.forEach(cost => {
      if (!dailyCostsByStyle[cost.travelStyle]) {
        dailyCostsByStyle[cost.travelStyle] = [];
      }
      dailyCostsByStyle[cost.travelStyle].push(cost);
    });

    for (const [style, costs] of Object.entries(dailyCostsByStyle)) {
      if (costs.length > 1) {
        console.log(`   💰 Found ${costs.length} duplicate "${style}" costs`);

        // Keep the first one, delete the rest
        const toDelete = costs.slice(1);
        for (const cost of toDelete) {
          await prisma.cityDailyCost.delete({ where: { id: cost.id } });
          totalDeleted.dailyCosts++;
          console.log(`      - Deleted duplicate ${style} cost`);
        }
      }
    }

    // Clean duplicate transport options (by type and name)
    const transportByKey: Record<string, any[]> = {};
    city.transport.forEach(t => {
      const key = `${t.type}:${t.name}`;
      if (!transportByKey[key]) {
        transportByKey[key] = [];
      }
      transportByKey[key].push(t);
    });

    for (const [key, transports] of Object.entries(transportByKey)) {
      if (transports.length > 1) {
        console.log(`   🚇 Found ${transports.length} duplicate "${key}" transport options`);

        // Keep the first one, delete the rest
        const toDelete = transports.slice(1);
        for (const transport of toDelete) {
          await prisma.cityTransport.delete({ where: { id: transport.id } });
          totalDeleted.transport++;
          console.log(`      - Deleted duplicate transport option`);
        }
      }
    }

    // Clean duplicate tips (by category and title)
    const tipsByKey: Record<string, any[]> = {};
    city.tips.forEach(tip => {
      const key = `${tip.category}:${tip.title}`;
      if (!tipsByKey[key]) {
        tipsByKey[key] = [];
      }
      tipsByKey[key].push(tip);
    });

    for (const [key, tips] of Object.entries(tipsByKey)) {
      if (tips.length > 1) {
        console.log(`   💡 Found ${tips.length} duplicate "${key}" tips`);

        // Keep the first one, delete the rest
        const toDelete = tips.slice(1);
        for (const tip of toDelete) {
          await prisma.cityTip.delete({ where: { id: tip.id } });
          totalDeleted.tips++;
          console.log(`      - Deleted duplicate tip`);
        }
      }
    }
  }

  console.log('\n\n✅ Cleanup complete!');
  console.log(`\n📊 Total deleted:`);
  console.log(`   Daily Costs: ${totalDeleted.dailyCosts}`);
  console.log(`   Transport: ${totalDeleted.transport}`);
  console.log(`   Tips: ${totalDeleted.tips}`);
  console.log(`\nRun: npm run cities:verify to verify`);
}

cleanDuplicates()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

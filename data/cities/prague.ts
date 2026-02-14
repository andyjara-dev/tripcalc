import { CityData } from './types';

export const prague: CityData = {
  id: 'prague',
  name: 'Prague',
  country: 'Czech Republic',
  currency: 'CZK',
  currencySymbol: 'Kč',
  language: 'Czech',
  latitude: 50.0755,
  longitude: 14.4378,
  transport: {
    metro: {
      singleTicket: 30, // 30-minute ticket
      dayPass: 120, // 24h pass
      multiTicket: {
        rides: 10,
        price: 260
      }
    },
    bus: {
      singleTicket: 30,
      dayPass: 120
    },
    taxi: {
      baseRate: 60,
      perKm: 36,
      perMinute: 8
    },
    uber: {
      available: true, // Bolt also very popular
      averageAirportToCity: 500 // PRG to Old Town
    },
    train: {
      airportToCity: 60 // Airport Express bus
    }
  },
  dailyCosts: {
    budget: {
      accommodation: 500, // Hostel
      food: 400,
      transport: 100,
      activities: 200
    },
    midRange: {
      accommodation: 2500,
      food: 1000,
      transport: 200,
      activities: 500
    },
    luxury: {
      accommodation: 7000,
      food: 2500,
      transport: 600,
      activities: 1500
    }
  },
  tips: {
    restaurants: '10% is standard for table service. Round up at pubs',
    cafes: 'Round up to nearest 10 Kč',
    taxis: 'Round up or 10%',
    general: 'Tipping 10% at restaurants is expected. Check the bill carefully for already-added service charges'
  },
  cash: {
    widelyAccepted: true,
    atmAvailability: 'Very common in tourist areas',
    atmFees: 'Avoid Euronet ATMs (terrible rates). Use bank ATMs: Česká spořitelna, ČSOB, Komerční banka',
    recommendedAmount: 'Many places accept cards but cash is useful. Carry 1000-2000 Kč. NEVER exchange money on the street'
  },
  hiddenCosts: [
    {
      type: 'warning',
      title: 'Exchange Scams',
      description: 'Avoid street exchangers and shops with "0% commission" signs. They have terrible rates. Use bank ATMs instead'
    },
    {
      type: 'fee',
      title: 'Tourist Trap Restaurants',
      description: 'Restaurants in Old Town Square are 2-3x more expensive. Walk 5 minutes away for local prices'
    }
  ],
  lastUpdated: '2026-02'
};

import { CityData } from './types';

export const bangkok: CityData = {
  id: 'bangkok',
  name: 'Bangkok',
  country: 'Thailand',
  currency: 'THB',
  currencySymbol: '฿',
  language: 'Thai',
  latitude: 13.7563,
  longitude: 100.5018,
  transport: {
    metro: {
      singleTicket: 25, // BTS/MRT starting fare
      dayPass: 150, // BTS one-day pass
      multiTicket: {
        rides: 10,
        price: 220
      }
    },
    bus: {
      singleTicket: 8, // Non-AC bus
      dayPass: 40
    },
    taxi: {
      baseRate: 35,
      perKm: 6.50,
      perMinute: 3
    },
    uber: {
      available: true, // Grab is the main app
      averageAirportToCity: 350 // Suvarnabhumi to center
    },
    train: {
      airportToCity: 45 // Airport Rail Link
    }
  },
  dailyCosts: {
    budget: {
      accommodation: 500, // Hostel
      food: 400, // Street food
      transport: 150,
      activities: 200
    },
    midRange: {
      accommodation: 2000,
      food: 1000,
      transport: 400,
      activities: 600
    },
    luxury: {
      accommodation: 6000,
      food: 3000,
      transport: 1000,
      activities: 2000
    }
  },
  tips: {
    restaurants: 'Not expected at street food stalls. 10% at nicer restaurants if no service charge',
    cafes: 'Not expected, tip jar sometimes available',
    taxis: 'Round up to nearest 10 baht',
    general: 'Tipping not traditional in Thailand but increasingly appreciated in tourist areas'
  },
  cash: {
    widelyAccepted: true,
    atmAvailability: 'Very common, especially near tourist areas and 7-Elevens',
    atmFees: '220฿ per withdrawal for foreign cards (charged by Thai bank)',
    recommendedAmount: 'Street food and markets are cash-only. Carry 1000-2000฿ daily. Withdraw larger amounts to reduce ATM fees'
  },
  hiddenCosts: [
    {
      type: 'fee',
      title: 'ATM Foreign Card Fee',
      description: 'Thai banks charge 220฿ (~$6) per ATM withdrawal for foreign cards',
      amount: '220฿/withdrawal'
    },
    {
      type: 'warning',
      title: 'Tuk-Tuk Scams',
      description: 'Always agree on price before getting in. Use Grab app for fair pricing'
    }
  ],
  lastUpdated: '2026-02'
};

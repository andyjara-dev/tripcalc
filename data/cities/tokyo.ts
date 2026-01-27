import { CityData } from './types';

export const tokyo: CityData = {
  id: 'tokyo',
  name: 'Tokyo',
  country: 'Japan',
  currency: 'JPY',
  currencySymbol: '¥',
  language: 'Japanese',
  transport: {
    metro: {
      singleTicket: 180,
      dayPass: 800,
      multiTicket: {
        rides: 10,
        price: 1600
      }
    },
    bus: {
      singleTicket: 210
    },
    taxi: {
      baseRate: 500,
      perKm: 80,
      perMinute: 90
    },
    uber: {
      available: false
    },
    train: {
      airportToCity: 3200 // Narita Express
    }
  },
  dailyCosts: {
    budget: {
      accommodation: 4000,
      food: 2500,
      transport: 1000,
      activities: 1500
    },
    midRange: {
      accommodation: 10000,
      food: 5000,
      transport: 2000,
      activities: 4000
    },
    luxury: {
      accommodation: 30000,
      food: 12000,
      transport: 5000,
      activities: 10000
    }
  },
  tips: {
    restaurants: 'Tipping not customary in Japan - it may even be considered rude',
    cafes: 'No tipping expected',
    taxis: 'No tipping - round down if anything',
    general: 'Tipping culture does not exist in Japan. Excellent service is standard.'
  },
  cash: {
    widelyAccepted: false,
    atmAvailability: 'Many ATMs don\'t accept foreign cards. Use 7-Eleven, FamilyMart, or post office ATMs',
    atmFees: '200-300¥ per transaction',
    recommendedAmount: 'Japan is still very cash-based. Carry 20,000-30,000¥ for daily expenses'
  },
  lastUpdated: '2026-01'
};

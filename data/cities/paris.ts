import { CityData } from './types';

export const paris: CityData = {
  id: 'paris',
  name: 'Paris',
  country: 'France',
  currency: 'EUR',
  currencySymbol: '€',
  language: 'French',
  transport: {
    metro: {
      singleTicket: 2.10,
      dayPass: 8.45,
      multiTicket: {
        rides: 10,
        price: 17.35
      }
    },
    bus: {
      singleTicket: 2.10,
      dayPass: 8.45
    },
    taxi: {
      baseRate: 4.18,
      perKm: 1.21,
      perMinute: 0.40
    },
    uber: {
      available: true,
      averageAirportToCity: 55
    },
    train: {
      airportToCity: 11.80 // RER B to CDG
    }
  },
  dailyCosts: {
    budget: {
      accommodation: 45,
      food: 30,
      transport: 12,
      activities: 18
    },
    midRange: {
      accommodation: 120,
      food: 70,
      transport: 20,
      activities: 40
    },
    luxury: {
      accommodation: 350,
      food: 150,
      transport: 50,
      activities: 100
    }
  },
  tips: {
    restaurants: 'Service included by law. Optional 5-10% for exceptional service',
    cafes: 'Round up or leave small change (€0.50-1)',
    taxis: 'Round up to nearest euro or add 5-10%',
    general: 'Tipping appreciated but not mandatory. Service charge (15%) already included'
  },
  cash: {
    widelyAccepted: false,
    atmAvailability: 'ATMs everywhere in Paris',
    atmFees: '2-5€ for foreign cards, varies by bank',
    recommendedAmount: 'Cards widely accepted. Keep 50-100€ cash for small cafes and markets'
  },
  lastUpdated: '2026-01'
};

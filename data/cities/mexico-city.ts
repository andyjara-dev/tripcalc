import { CityData } from './types';

export const mexicoCity: CityData = {
  id: 'mexico-city',
  name: 'Mexico City',
  country: 'Mexico',
  currency: 'MXN',
  currencySymbol: '$',
  language: 'Spanish',
  latitude: 19.4326,
  longitude: -99.1332,
  transport: {
    metro: {
      singleTicket: 5,
      // No day pass in Mexico City Metro
    },
    bus: {
      singleTicket: 6
    },
    taxi: {
      baseRate: 15,
      perKm: 10,
      perMinute: 2
    },
    uber: {
      available: true,
      averageAirportToCity: 250
    },
    train: {
      airportToCity: 15 // Metrobus Line 4
    }
  },
  dailyCosts: {
    budget: {
      accommodation: 400,
      food: 300,
      transport: 100,
      activities: 200
    },
    midRange: {
      accommodation: 1000,
      food: 600,
      transport: 250,
      activities: 400
    },
    luxury: {
      accommodation: 3000,
      food: 1500,
      transport: 600,
      activities: 1000
    }
  },
  tips: {
    restaurants: '10-15% is standard and expected',
    cafes: '10 pesos or round up for small purchases',
    taxis: 'Round up or add 10%',
    general: 'Tipping is customary. 10-15% is standard for most services'
  },
  cash: {
    widelyAccepted: true,
    atmAvailability: 'ATMs widely available, use bank ATMs for safety',
    atmFees: '30-50 pesos per transaction',
    recommendedAmount: 'Many small places prefer cash. Carry 1,000-2,000 pesos daily'
  },
  hiddenCosts: [],
  lastUpdated: '2026-01'
};

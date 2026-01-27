import { CityData } from './types';

export const newYork: CityData = {
  id: 'new-york',
  name: 'New York',
  country: 'United States',
  currency: 'USD',
  currencySymbol: '$',
  language: 'English',
  transport: {
    metro: {
      singleTicket: 2.90,
      multiTicket: {
        rides: 7,
        price: 34.00 // 7-day unlimited
      }
    },
    bus: {
      singleTicket: 2.90
    },
    taxi: {
      baseRate: 3.00,
      perKm: 1.56,
      perMinute: 0.50
    },
    uber: {
      available: true,
      averageAirportToCity: 65
    },
    train: {
      airportToCity: 10.75 // AirTrain + Subway
    }
  },
  dailyCosts: {
    budget: {
      accommodation: 80,
      food: 45,
      transport: 15,
      activities: 30
    },
    midRange: {
      accommodation: 200,
      food: 90,
      transport: 25,
      activities: 60
    },
    luxury: {
      accommodation: 500,
      food: 200,
      transport: 60,
      activities: 150
    }
  },
  tips: {
    restaurants: '15-20% mandatory for good service, 20%+ for excellent',
    cafes: '$1-2 per drink, or 15-20% for table service',
    taxis: '15-20% of fare',
    general: 'Tipping is expected in the US. Service workers rely on tips for income'
  },
  cash: {
    widelyAccepted: false,
    atmAvailability: 'ATMs everywhere, very common',
    atmFees: '$3-5 per transaction for out-of-network ATMs',
    recommendedAmount: 'Cards accepted almost everywhere. Keep $50-100 for street vendors and small shops'
  },
  lastUpdated: '2026-01'
};

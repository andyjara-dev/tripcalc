import { CityData } from './types';

export const barcelona: CityData = {
  id: 'barcelona',
  name: 'Barcelona',
  country: 'Spain',
  currency: 'EUR',
  currencySymbol: '€',
  language: 'Spanish/Catalan',
  transport: {
    metro: {
      singleTicket: 2.55,
      dayPass: 11.35,
      multiTicket: {
        rides: 10,
        price: 12.15
      }
    },
    bus: {
      singleTicket: 2.55,
      dayPass: 11.35
    },
    taxi: {
      baseRate: 2.50,
      perKm: 1.30,
      perMinute: 0.35
    },
    uber: {
      available: true,
      averageAirportToCity: 35
    },
    train: {
      airportToCity: 5.50
    }
  },
  dailyCosts: {
    budget: {
      accommodation: 40,
      food: 25,
      transport: 10,
      activities: 15
    },
    midRange: {
      accommodation: 80,
      food: 50,
      transport: 20,
      activities: 30
    },
    luxury: {
      accommodation: 200,
      food: 100,
      transport: 40,
      activities: 80
    }
  },
  tips: {
    restaurants: '5-10% optional, appreciated but not mandatory',
    cafes: 'Round up or leave small change',
    taxis: 'Round up to nearest euro',
    general: 'Tipping not mandatory in Spain, but appreciated for good service'
  },
  cash: {
    widelyAccepted: false,
    atmAvailability: 'Very common, found everywhere',
    atmFees: 'Usually 2-5€ for foreign cards',
    recommendedAmount: 'Cards widely accepted. Carry 50-100€ for small vendors and markets'
  },
  hiddenCosts: [],
  lastUpdated: '2026-01'
};

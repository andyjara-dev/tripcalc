import { CityData } from './types';

export const lisbon: CityData = {
  id: 'lisbon',
  name: 'Lisbon',
  country: 'Portugal',
  currency: 'EUR',
  currencySymbol: '€',
  language: 'Portuguese',
  latitude: 38.7223,
  longitude: -9.1393,
  transport: {
    metro: {
      singleTicket: 1.80, // With Viva Viagem card
      dayPass: 6.80, // 24h unlimited
      multiTicket: {
        rides: 10,
        price: 16.00 // Zapping top-up
      }
    },
    bus: {
      singleTicket: 1.80,
      dayPass: 6.80
    },
    taxi: {
      baseRate: 3.25,
      perKm: 0.47,
      perMinute: 0.25
    },
    uber: {
      available: true,
      averageAirportToCity: 12
    },
    train: {
      airportToCity: 1.80 // Metro direct to center
    }
  },
  dailyCosts: {
    budget: {
      accommodation: 30,
      food: 20,
      transport: 8,
      activities: 10
    },
    midRange: {
      accommodation: 80,
      food: 40,
      transport: 15,
      activities: 25
    },
    luxury: {
      accommodation: 200,
      food: 90,
      transport: 35,
      activities: 60
    }
  },
  tips: {
    restaurants: '5-10% is generous. Not mandatory but appreciated',
    cafes: 'Round up or leave small change',
    taxis: 'Round up to nearest euro',
    general: 'Tipping not mandatory in Portugal. 5-10% for good service at restaurants'
  },
  cash: {
    widelyAccepted: false,
    atmAvailability: 'Very common. Multibanco network everywhere',
    atmFees: 'Multibanco ATMs are free for EU cards. Foreign cards may have fees from your bank',
    recommendedAmount: 'Cards widely accepted. Carry €30-50 for small cafes and pastelerias'
  },
  hiddenCosts: [
    {
      type: 'tax',
      title: 'Tourist Tax',
      description: 'City tax of €2 per night (max 7 nights) for visitors over 13',
      amount: '€2/night'
    },
    {
      type: 'surcharge',
      title: 'Tram 28',
      description: 'Famous tram is very crowded and a pickpocket hotspot. Consider alternatives',
    }
  ],
  lastUpdated: '2026-02'
};

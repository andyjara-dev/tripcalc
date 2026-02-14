import { CityData } from './types';

export const rome: CityData = {
  id: 'rome',
  name: 'Rome',
  country: 'Italy',
  currency: 'EUR',
  currencySymbol: '€',
  language: 'Italian',
  latitude: 41.9028,
  longitude: 12.4964,
  transport: {
    metro: {
      singleTicket: 1.50,
      dayPass: 7.00,
      multiTicket: {
        rides: 10,
        price: 15.00
      }
    },
    bus: {
      singleTicket: 1.50,
      dayPass: 7.00
    },
    taxi: {
      baseRate: 3.00,
      perKm: 1.10,
      perMinute: 0.30
    },
    uber: {
      available: true, // UberBlack only, limited
      averageAirportToCity: 48 // Fiumicino flat rate
    },
    train: {
      airportToCity: 14 // Leonardo Express
    }
  },
  dailyCosts: {
    budget: {
      accommodation: 35,
      food: 25,
      transport: 8,
      activities: 15
    },
    midRange: {
      accommodation: 90,
      food: 50,
      transport: 15,
      activities: 35
    },
    luxury: {
      accommodation: 250,
      food: 110,
      transport: 40,
      activities: 80
    }
  },
  tips: {
    restaurants: 'Coperto (cover charge) of €1-3 is standard. Extra tip of 5-10% for great service',
    cafes: 'Not expected. Drinking at the bar is cheaper than sitting at a table',
    taxis: 'Round up to nearest euro',
    general: 'Service charge (coperto) is normal, not rude. Additional tips are appreciated but not expected'
  },
  cash: {
    widelyAccepted: true,
    atmAvailability: 'Common throughout the city',
    atmFees: '€2-4 for foreign cards. Avoid Euronet ATMs (high fees)',
    recommendedAmount: 'Many small trattorias are cash-only. Carry €50-100 daily'
  },
  hiddenCosts: [
    {
      type: 'tax',
      title: 'Tourist Tax',
      description: 'City tax of €3-7 per night depending on hotel star rating',
      amount: '€3-7/night'
    },
    {
      type: 'surcharge',
      title: 'Coperto',
      description: 'Cover charge of €1-3 per person at most restaurants',
      amount: '€1-3/person'
    }
  ],
  lastUpdated: '2026-02'
};

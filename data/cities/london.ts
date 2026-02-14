import { CityData } from './types';

export const london: CityData = {
  id: 'london',
  name: 'London',
  country: 'United Kingdom',
  currency: 'GBP',
  currencySymbol: '£',
  language: 'English',
  latitude: 51.5074,
  longitude: -0.1278,
  transport: {
    metro: {
      singleTicket: 6.70, // Zone 1 peak, Oyster/contactless much cheaper
      dayPass: 8.10, // Zone 1-2 daily cap
      multiTicket: {
        rides: 10,
        price: 27.50 // Oyster pay-as-you-go average
      }
    },
    bus: {
      singleTicket: 1.75, // Flat fare with Oyster
      dayPass: 5.25 // Bus daily cap
    },
    taxi: {
      baseRate: 3.80,
      perKm: 2.00,
      perMinute: 0.40
    },
    uber: {
      available: true,
      averageAirportToCity: 55 // Heathrow to central
    },
    train: {
      airportToCity: 25 // Heathrow Express
    }
  },
  dailyCosts: {
    budget: {
      accommodation: 35, // Hostel dorm
      food: 25,
      transport: 15,
      activities: 10 // Many free museums
    },
    midRange: {
      accommodation: 120,
      food: 55,
      transport: 20,
      activities: 35
    },
    luxury: {
      accommodation: 350,
      food: 130,
      transport: 50,
      activities: 100
    }
  },
  tips: {
    restaurants: '10-12.5% optional, often added as service charge',
    cafes: 'Not expected, tip jar sometimes available',
    taxis: 'Round up to nearest pound or 10%',
    general: 'Check if service charge is already included before tipping'
  },
  cash: {
    widelyAccepted: false,
    atmAvailability: 'Extremely common, many free ATMs',
    atmFees: 'Most ATMs are free for UK/EU cards. Foreign cards may charge £1.50-3',
    recommendedAmount: 'London is nearly cashless. Contactless accepted almost everywhere. Carry £20-50 for small markets'
  },
  hiddenCosts: [
    {
      type: 'surcharge',
      title: 'Congestion Charge',
      description: 'Driving in central London costs £15/day on weekdays',
      amount: '£15/day'
    },
    {
      type: 'tax',
      title: 'VAT',
      description: '20% VAT included in all prices. Non-EU visitors may claim refund on shopping',
      amount: '20%'
    }
  ],
  lastUpdated: '2026-02'
};

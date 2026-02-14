import { CityData } from './types';

export const dubai: CityData = {
  id: 'dubai',
  name: 'Dubai',
  country: 'United Arab Emirates',
  currency: 'AED',
  currencySymbol: 'د.إ',
  language: 'Arabic/English',
  latitude: 25.2048,
  longitude: 55.2708,
  transport: {
    metro: {
      singleTicket: 5, // Silver class, within zone
      dayPass: 22,
      multiTicket: {
        rides: 10,
        price: 40 // Nol Silver card
      }
    },
    bus: {
      singleTicket: 5,
      dayPass: 22
    },
    taxi: {
      baseRate: 12,
      perKm: 2.19,
      perMinute: 0.58
    },
    uber: {
      available: true, // Uber and Careem
      averageAirportToCity: 55 // DXB to Downtown
    },
    train: {
      airportToCity: 8 // Metro Red Line
    }
  },
  dailyCosts: {
    budget: {
      accommodation: 150, // Budget hotel
      food: 80,
      transport: 30,
      activities: 50
    },
    midRange: {
      accommodation: 400,
      food: 180,
      transport: 60,
      activities: 150
    },
    luxury: {
      accommodation: 1500,
      food: 500,
      transport: 150,
      activities: 400
    }
  },
  tips: {
    restaurants: '10-15% if no service charge. Many add 10% automatically',
    cafes: 'Not expected but appreciated',
    taxis: 'Round up to nearest 5 AED',
    general: 'Tipping is common and appreciated. Hotel staff expect 5-10 AED per service'
  },
  cash: {
    widelyAccepted: false,
    atmAvailability: 'Very common, in every mall and bank branch',
    atmFees: 'Most major banks are free. Foreign cards may charge 5-10 AED',
    recommendedAmount: 'Dubai is very card-friendly. Carry 100-200 AED for small shops and taxis'
  },
  hiddenCosts: [
    {
      type: 'tax',
      title: 'Tourism Dirham',
      description: 'Hotel tax of 7-20 AED per room per night depending on hotel category',
      amount: '7-20 AED/night'
    },
    {
      type: 'tax',
      title: 'VAT',
      description: '5% VAT on most goods and services',
      amount: '5%'
    },
    {
      type: 'surcharge',
      title: 'Attraction Prices',
      description: 'Dubai attractions are expensive: Burj Khalifa 169 AED, Dubai Frame 50 AED, Aquaventure 350 AED'
    }
  ],
  lastUpdated: '2026-02'
};

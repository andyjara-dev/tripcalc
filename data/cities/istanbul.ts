import { CityData } from './types';

export const istanbul: CityData = {
  id: 'istanbul',
  name: 'Istanbul',
  country: 'Turkey',
  currency: 'TRY',
  currencySymbol: '₺',
  language: 'Turkish',
  latitude: 41.0082,
  longitude: 28.9784,
  transport: {
    metro: {
      singleTicket: 20, // Istanbulkart fare
      dayPass: 130,
      multiTicket: {
        rides: 10,
        price: 170 // Discounted transfers with Istanbulkart
      }
    },
    bus: {
      singleTicket: 20,
      dayPass: 130
    },
    taxi: {
      baseRate: 35,
      perKm: 20,
      perMinute: 5
    },
    uber: {
      available: true, // BiTaksi app more common
      averageAirportToCity: 450 // IST to Sultanahmet
    },
    train: {
      airportToCity: 150 // Havaist bus + metro combo
    }
  },
  dailyCosts: {
    budget: {
      accommodation: 600, // Hostel
      food: 400,
      transport: 100,
      activities: 200
    },
    midRange: {
      accommodation: 2500,
      food: 1000,
      transport: 250,
      activities: 500
    },
    luxury: {
      accommodation: 8000,
      food: 3000,
      transport: 700,
      activities: 1500
    }
  },
  tips: {
    restaurants: '5-10% is standard. Some add service charge',
    cafes: 'Round up or leave small change',
    taxis: 'Round up to nearest 10₺',
    general: 'Tipping is appreciated and expected in tourist areas. Hamam attendants expect 20-50₺'
  },
  cash: {
    widelyAccepted: true,
    atmAvailability: 'Very common throughout the city',
    atmFees: 'Usually free from major banks. Some charge 10-20₺',
    recommendedAmount: 'Cash preferred in bazaars and smaller shops. Carry 500-1000₺. Credit cards widely accepted in restaurants and hotels'
  },
  hiddenCosts: [
    {
      type: 'fee',
      title: 'Museum Pass',
      description: 'Individual entry tickets add up fast. Museum Pass Istanbul (€35) covers major sites for 5 days',
      amount: '€35/5 days'
    },
    {
      type: 'warning',
      title: 'Currency Fluctuation',
      description: 'Turkish Lira fluctuates significantly. Check exchange rates daily and exchange in small amounts'
    }
  ],
  lastUpdated: '2026-02'
};

import { CityData } from './types';

export const marrakech: CityData = {
  id: 'marrakech',
  name: 'Marrakech',
  country: 'Morocco',
  currency: 'MAD',
  currencySymbol: 'MAD',
  language: 'Arabic/French/Berber',
  latitude: 31.6295,
  longitude: -7.9811,
  transport: {
    bus: {
      singleTicket: 4, // City bus
      dayPass: 15
    },
    taxi: {
      baseRate: 7, // Petit taxi (within city)
      perKm: 3,
      perMinute: 1.50
    },
    uber: {
      available: false, // Careem available but limited
    },
  },
  dailyCosts: {
    budget: {
      accommodation: 200, // Hostel/basic riad
      food: 120,
      transport: 50,
      activities: 80
    },
    midRange: {
      accommodation: 600, // Mid-range riad
      food: 300,
      transport: 120,
      activities: 200
    },
    luxury: {
      accommodation: 2000,
      food: 700,
      transport: 300,
      activities: 500
    }
  },
  tips: {
    restaurants: '10% for table service. In tourist restaurants, check if already included',
    cafes: 'Leave 2-5 MAD for mint tea service',
    taxis: 'Round up to nearest 5 MAD',
    general: 'Tipping is expected and important. Guides: 100-200 MAD/day. Riad staff: 20-50 MAD. Hammam attendants: 30-50 MAD'
  },
  cash: {
    widelyAccepted: true,
    atmAvailability: 'Common in the new city (Gueliz). Fewer in the Medina',
    atmFees: '20-30 MAD per withdrawal for foreign cards',
    recommendedAmount: 'Marrakech is primarily cash-based. The Medina and souks are almost entirely cash. Carry 500-1000 MAD daily'
  },
  hiddenCosts: [
    {
      type: 'warning',
      title: 'Haggling Expected',
      description: 'In souks, the first price is typically 3-5x the actual value. Haggling is expected and part of the culture'
    },
    {
      type: 'fee',
      title: 'Unofficial Guides',
      description: 'People may offer to "help" you find your way and then demand payment. Politely decline or agree on a price upfront'
    },
    {
      type: 'tax',
      title: 'Tourist Tax',
      description: 'Hotel tourist tax of 5-25 MAD per night depending on hotel classification',
      amount: '5-25 MAD/night'
    }
  ],
  lastUpdated: '2026-02'
};

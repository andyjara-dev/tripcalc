import { CityData } from './types';

export const seoul: CityData = {
  id: 'seoul',
  name: 'Seoul',
  country: 'South Korea',
  currency: 'KRW',
  currencySymbol: '₩',
  language: 'Korean',
  latitude: 37.5665,
  longitude: 126.9780,
  transport: {
    metro: {
      singleTicket: 1400, // T-money card fare (10km)
      dayPass: 5500, // Climate Card or M-Pass
      multiTicket: {
        rides: 10,
        price: 12500 // T-money discounted
      }
    },
    bus: {
      singleTicket: 1200,
      dayPass: 5500
    },
    taxi: {
      baseRate: 4800,
      perKm: 1000,
      perMinute: 200
    },
    uber: {
      available: true, // Kakao T is the main app
      averageAirportToCity: 65000 // Incheon to Gangnam
    },
    train: {
      airportToCity: 9500 // AREX Express from Incheon
    }
  },
  dailyCosts: {
    budget: {
      accommodation: 30000, // Goshiwon/hostel
      food: 20000,
      transport: 5000,
      activities: 10000
    },
    midRange: {
      accommodation: 100000,
      food: 40000,
      transport: 10000,
      activities: 25000
    },
    luxury: {
      accommodation: 300000,
      food: 100000,
      transport: 30000,
      activities: 60000
    }
  },
  tips: {
    restaurants: 'Not expected and can be considered rude. Service is included',
    cafes: 'No tipping',
    taxis: 'No tipping expected. Driver may refuse tips',
    general: 'Tipping is NOT part of Korean culture. Excellent service is the standard. Do not tip'
  },
  cash: {
    widelyAccepted: false,
    atmAvailability: 'Very common, convenience stores and banks everywhere',
    atmFees: 'Global ATMs in convenience stores charge ₩3,000-5,000. Bank ATMs often free for major cards',
    recommendedAmount: 'Korea is extremely cashless. Samsung Pay/Kakao Pay everywhere. Carry ₩30,000-50,000 for street food markets'
  },
  hiddenCosts: [
    {
      type: 'tax',
      title: 'VAT',
      description: '10% VAT included in prices. Tax refund available on purchases over ₩30,000 at participating stores',
      amount: '10%'
    },
    {
      type: 'fee',
      title: 'Palace Pass',
      description: 'Integrated Palace Pass (₩10,000) covers 4 palaces + Jongmyo Shrine. Much cheaper than individual tickets',
      amount: '₩10,000'
    }
  ],
  lastUpdated: '2026-02'
};

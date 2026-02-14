import { CityData } from './types';

export const buenosAires: CityData = {
  id: 'buenos-aires',
  name: 'Buenos Aires',
  country: 'Argentina',
  currency: 'ARS',
  currencySymbol: '$',
  language: 'Spanish',
  latitude: -34.6037,
  longitude: -58.3816,
  transport: {
    metro: {
      singleTicket: 757, // Subte with SUBE card
      dayPass: 3785, // 5 rides equivalent
      multiTicket: {
        rides: 10,
        price: 6056 // Discounted with SUBE
      }
    },
    bus: {
      singleTicket: 757, // Colectivo with SUBE
    },
    taxi: {
      baseRate: 1900,
      perKm: 1900,
      perMinute: 190
    },
    uber: {
      available: true, // Technically in a gray legal area, but widely used
      averageAirportToCity: 35000 // Ezeiza to center
    },
    colectivo: {
      averageFare: 757
    }
  },
  dailyCosts: {
    budget: {
      accommodation: 15000,
      food: 12000,
      transport: 3000,
      activities: 5000
    },
    midRange: {
      accommodation: 45000,
      food: 25000,
      transport: 8000,
      activities: 15000
    },
    luxury: {
      accommodation: 120000,
      food: 60000,
      transport: 20000,
      activities: 40000
    }
  },
  tips: {
    restaurants: '10% is standard and expected',
    cafes: 'Leave small change or round up',
    taxis: 'Round up to nearest 500 pesos',
    general: '10% tip at restaurants is the norm. Porters and hotel staff expect small tips'
  },
  cash: {
    widelyAccepted: true,
    atmAvailability: 'Common but withdrawal limits are very low (often 30,000-60,000 ARS)',
    atmFees: 'High fees for foreign cards (up to 2500 ARS per withdrawal). Low withdrawal limits force multiple transactions',
    recommendedAmount: 'Bring USD cash and exchange at "cuevas" (informal exchange houses) for much better rates than official. Check "dólar blue" rate daily'
  },
  hiddenCosts: [
    {
      type: 'warning',
      title: 'Dual Exchange Rate',
      description: 'The official exchange rate and blue dollar rate can differ significantly. Paying in USD cash often gets you much more value'
    },
    {
      type: 'fee',
      title: 'ATM Limits',
      description: 'ATMs have very low withdrawal limits (30,000-60,000 ARS) and charge high fees per transaction',
      amount: '~2500 ARS/withdrawal'
    },
    {
      type: 'surcharge',
      title: 'Credit Card Rate',
      description: 'Credit cards use the official rate which is worse than blue dollar rate. Pay cash when possible for better value'
    }
  ],
  lastUpdated: '2026-02'
};

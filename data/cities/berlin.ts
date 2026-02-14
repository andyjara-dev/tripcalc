import { CityData } from './types';

export const berlin: CityData = {
  id: 'berlin',
  name: 'Berlin',
  country: 'Germany',
  currency: 'EUR',
  currencySymbol: '€',
  language: 'German/English',
  latitude: 52.5200,
  longitude: 13.4050,
  transport: {
    metro: {
      singleTicket: 3.50, // AB zone
      dayPass: 9.50, // AB zone day ticket
      multiTicket: {
        rides: 4,
        price: 10.80 // 4-trip ticket
      }
    },
    bus: {
      singleTicket: 3.50,
      dayPass: 9.50
    },
    taxi: {
      baseRate: 3.90,
      perKm: 2.30,
      perMinute: 0.60
    },
    uber: {
      available: true, // FreeNow and Bolt also popular
      averageAirportToCity: 35 // BER to center
    },
    train: {
      airportToCity: 4.40 // S-Bahn/FEX from BER
    }
  },
  dailyCosts: {
    budget: {
      accommodation: 30, // Hostel
      food: 20,
      transport: 9,
      activities: 10
    },
    midRange: {
      accommodation: 85,
      food: 40,
      transport: 15,
      activities: 25
    },
    luxury: {
      accommodation: 220,
      food: 90,
      transport: 35,
      activities: 60
    }
  },
  tips: {
    restaurants: '5-10% is standard. Round up for smaller bills',
    cafes: 'Round up to nearest euro',
    taxis: 'Round up or 10%',
    general: 'Tell the waiter the total you want to pay (including tip) rather than leaving money on the table'
  },
  cash: {
    widelyAccepted: true,
    atmAvailability: 'Common, Sparkasse and Deutsche Bank everywhere',
    atmFees: 'Free for EU cards at most banks. Foreign cards €3-5',
    recommendedAmount: 'Germany is surprisingly cash-heavy. Many restaurants and shops are cash-only ("Nur Bargeld"). Carry €50-80 daily'
  },
  hiddenCosts: [
    {
      type: 'tax',
      title: 'City Tax',
      description: '5% of net room rate per night for private stays (not business)',
      amount: '5%/night'
    },
    {
      type: 'warning',
      title: 'Cash-Only Culture',
      description: 'Many restaurants, cafes, and shops only accept cash (EC/Girocard). Visa/Mastercard not universally accepted'
    }
  ],
  lastUpdated: '2026-02'
};

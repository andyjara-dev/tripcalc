import { CityData } from './types';

export const amsterdam: CityData = {
  id: 'amsterdam',
  name: 'Amsterdam',
  country: 'Netherlands',
  currency: 'EUR',
  currencySymbol: '€',
  language: 'Dutch/English',
  latitude: 52.3676,
  longitude: 4.9041,
  transport: {
    metro: {
      singleTicket: 3.40, // GVB single ticket (1h)
      dayPass: 9.00,
      multiTicket: {
        rides: 10,
        price: 28.00
      }
    },
    bus: {
      singleTicket: 3.40,
      dayPass: 9.00
    },
    taxi: {
      baseRate: 3.19,
      perKm: 2.35,
      perMinute: 0.39
    },
    uber: {
      available: true,
      averageAirportToCity: 40 // Schiphol to center
    },
    train: {
      airportToCity: 5.80 // NS train Schiphol to Centraal
    }
  },
  dailyCosts: {
    budget: {
      accommodation: 40, // Hostel
      food: 25,
      transport: 10,
      activities: 15
    },
    midRange: {
      accommodation: 120,
      food: 50,
      transport: 15,
      activities: 35
    },
    luxury: {
      accommodation: 300,
      food: 110,
      transport: 40,
      activities: 80
    }
  },
  tips: {
    restaurants: '5-10% for good service. Not obligatory',
    cafes: 'Not expected, rounding up is nice',
    taxis: 'Round up to nearest euro or 5-10%',
    general: 'Dutch are not big tippers. Service is included in prices. Small tips appreciated'
  },
  cash: {
    widelyAccepted: false,
    atmAvailability: 'Common, many ABN AMRO and ING ATMs',
    atmFees: 'Free for EU cards. Foreign cards €2-5 per withdrawal',
    recommendedAmount: 'Amsterdam is very card-friendly, many places are card-ONLY. Carry €30-50 for markets'
  },
  hiddenCosts: [
    {
      type: 'tax',
      title: 'Tourist Tax',
      description: 'City tax of 7% on hotel room rate per night',
      amount: '7%/night'
    },
    {
      type: 'fee',
      title: 'Museum Reservations',
      description: 'Most major museums require timed-entry reservations. Book Anne Frank House weeks ahead',
    },
    {
      type: 'surcharge',
      title: 'Bike Rental',
      description: 'Best way to get around. €12-15/day for a standard bike',
      amount: '€12-15/day'
    }
  ],
  lastUpdated: '2026-02'
};

import { CityData } from './types';

export const singapore: CityData = {
  id: 'singapore',
  name: 'Singapore',
  country: 'Singapore',
  currency: 'SGD',
  currencySymbol: 'S$',
  language: 'English/Mandarin/Malay/Tamil',
  latitude: 1.3521,
  longitude: 103.8198,
  transport: {
    metro: {
      singleTicket: 1.70, // MRT starting fare
      dayPass: 10.00, // Singapore Tourist Pass 1 day
      multiTicket: {
        rides: 10,
        price: 15.00 // Average with EZ-Link card
      }
    },
    bus: {
      singleTicket: 1.50,
      dayPass: 10.00
    },
    taxi: {
      baseRate: 4.10,
      perKm: 0.74,
      perMinute: 0.33
    },
    uber: {
      available: true, // Grab is the dominant app
      averageAirportToCity: 25 // Changi to center
    },
    train: {
      airportToCity: 2.20 // MRT from Changi
    }
  },
  dailyCosts: {
    budget: {
      accommodation: 40, // Hostel
      food: 20, // Hawker centers
      transport: 8,
      activities: 15
    },
    midRange: {
      accommodation: 150,
      food: 50,
      transport: 15,
      activities: 40
    },
    luxury: {
      accommodation: 400,
      food: 150,
      transport: 40,
      activities: 100
    }
  },
  tips: {
    restaurants: 'Not expected. 10% service charge usually added to bill',
    cafes: 'Not expected',
    taxis: 'Not expected, round up if you wish',
    general: 'Tipping is not part of Singapore culture. Service charge is included. No need to tip extra'
  },
  cash: {
    widelyAccepted: false,
    atmAvailability: 'Everywhere, especially in MRT stations and malls',
    atmFees: 'DBS/OCBC/UOB ATMs usually free. Foreign cards S$5-8',
    recommendedAmount: 'Singapore is very cashless (PayNow, NETS). Hawker centers increasingly accept cards. Carry S$30-50 for small stalls'
  },
  hiddenCosts: [
    {
      type: 'tax',
      title: 'GST',
      description: '9% Goods and Services Tax on all purchases. Tourists can claim GST refund on purchases over S$100',
      amount: '9%'
    },
    {
      type: 'surcharge',
      title: 'Service Charge',
      description: 'Most restaurants add 10% service charge + 9% GST (marked as "++"). Final price is ~19% more than listed',
      amount: '~19% total'
    },
    {
      type: 'fee',
      title: 'Alcohol Prices',
      description: 'Alcohol is heavily taxed in Singapore. A beer at a bar costs S$12-18. Buy from supermarkets to save'
    }
  ],
  lastUpdated: '2026-02'
};

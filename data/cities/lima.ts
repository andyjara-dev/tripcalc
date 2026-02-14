import { CityData } from './types';

export const lima: CityData = {
  id: 'lima',
  name: 'Lima',
  country: 'Peru',
  currency: 'PEN',
  currencySymbol: 'S/',
  language: 'Spanish',
  latitude: -12.0464,
  longitude: -77.0428,
  transport: {
    metro: {
      singleTicket: 1.50, // Metropolitano/Metro Line 1
      dayPass: 7.50,
    },
    bus: {
      singleTicket: 1.20, // Combi/micro
    },
    taxi: {
      baseRate: 5.00,
      perKm: 2.00,
      perMinute: 0.50
    },
    uber: {
      available: true, // Uber and InDriver very popular
      averageAirportToCity: 35 // Jorge Chávez to Miraflores
    },
    colectivo: {
      averageFare: 1.50
    }
  },
  dailyCosts: {
    budget: {
      accommodation: 40, // Hostel in Miraflores
      food: 25, // Menú del día + street food
      transport: 8,
      activities: 10
    },
    midRange: {
      accommodation: 120,
      food: 60,
      transport: 20,
      activities: 30
    },
    luxury: {
      accommodation: 300,
      food: 150,
      transport: 50,
      activities: 80
    }
  },
  tips: {
    restaurants: '10% tip is standard. Some add service charge (servicio)',
    cafes: 'Not expected, round up if you wish',
    taxis: 'Not expected, round up slightly',
    general: '10% at restaurants is the norm. Check if "servicio" is already on the bill'
  },
  cash: {
    widelyAccepted: true,
    atmAvailability: 'Common in Miraflores, San Isidro, Barranco. Less in other areas',
    atmFees: 'BCP and Interbank charge S/12-18 per withdrawal for foreign cards',
    recommendedAmount: 'Many restaurants accept cards in tourist areas. Markets and small shops are cash-only. Carry S/100-200 daily. Both soles and USD accepted'
  },
  hiddenCosts: [
    {
      type: 'warning',
      title: 'Taxi Safety',
      description: 'Always use apps (Uber, InDriver) or registered taxis. Never hail random taxis on the street'
    },
    {
      type: 'fee',
      title: 'ATM Fees',
      description: 'Peruvian banks charge S/12-18 per ATM withdrawal for foreign cards. Withdraw larger amounts',
      amount: 'S/12-18/withdrawal'
    },
    {
      type: 'surcharge',
      title: 'Gastronomy Prices',
      description: 'Lima is a world-class food city. Top restaurants (Central, Maido) cost S/600-900 per person. Make reservations months ahead'
    }
  ],
  lastUpdated: '2026-02'
};

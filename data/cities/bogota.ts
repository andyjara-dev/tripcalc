import { CityData } from './types';

export const bogota: CityData = {
  id: 'bogota',
  name: 'Bogota',
  country: 'Colombia',
  currency: 'COP',
  currencySymbol: '$',
  language: 'Spanish',
  latitude: 4.7110,
  longitude: -74.0721,
  transport: {
    metro: {
      singleTicket: 2950, // TransMilenio
    },
    bus: {
      singleTicket: 2950, // SITP
    },
    taxi: {
      baseRate: 4800,
      perKm: 1200,
      perMinute: 450
    },
    uber: {
      available: true, // Uber, InDriver, DiDi
      averageAirportToCity: 40000 // El Dorado to Zona T
    },
  },
  dailyCosts: {
    budget: {
      accommodation: 50000, // Hostel in La Candelaria
      food: 40000,
      transport: 12000,
      activities: 15000
    },
    midRange: {
      accommodation: 200000,
      food: 80000,
      transport: 30000,
      activities: 40000
    },
    luxury: {
      accommodation: 600000,
      food: 200000,
      transport: 80000,
      activities: 120000
    }
  },
  tips: {
    restaurants: '10% tip ("propina voluntaria") is suggested on the bill. You can accept or decline',
    cafes: 'Not expected, leave loose change',
    taxis: 'Round up to nearest 1000 COP',
    general: 'At restaurants, the waiter will ask "¿Desea incluir el servicio?" Say "sí" for 10% tip. It is voluntary but customary'
  },
  cash: {
    widelyAccepted: true,
    atmAvailability: 'Common in Chapinero, Zona T, Usaquén. Bancolombia and Davivienda are reliable',
    atmFees: 'COP 15,000-20,000 per withdrawal for foreign cards. Withdraw max amounts',
    recommendedAmount: 'Cash is king for small purchases, street food, and taxis. Carry COP 100,000-200,000 daily. Cards accepted at malls and nice restaurants'
  },
  hiddenCosts: [
    {
      type: 'fee',
      title: 'ATM Fees',
      description: 'Colombian banks charge COP 15,000-20,000 per ATM withdrawal. Maximum withdrawal often limited to COP 600,000-800,000',
      amount: 'COP 15,000-20,000'
    },
    {
      type: 'warning',
      title: 'Altitude',
      description: 'Bogota is at 2,640m (8,660ft). You may feel altitude effects the first day. Take it easy and stay hydrated'
    },
    {
      type: 'surcharge',
      title: 'IVA Tax',
      description: '19% IVA included in prices. Foreign tourists can claim IVA refund on purchases at participating stores',
      amount: '19%'
    }
  ],
  lastUpdated: '2026-02'
};

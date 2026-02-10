import { CityData } from './types';

export const newYork: CityData = {
  id: 'new-york',
  name: 'New York',
  country: 'United States',
  currency: 'USD',
  currencySymbol: '$',
  language: 'English',
  latitude: 40.7128,
  longitude: -74.0060,
  transport: {
    metro: {
      singleTicket: 3.00,  // Tarifa básica MTA 2026 (efectiva desde enero 4, 2026)[web:2][web:3][web:8]
      multiTicket: {
        rides: 7,
        price: 35.00  // 7-day rolling fare cap MTA 2026[web:2][web:5]
      }
    },
    bus: {
      singleTicket: 3.00  // Tarifa básica unificada subway/bus local MTA 2026[web:2][web:3][web:8]
    },
    taxi: {
      baseRate: 3.00,  // Tarifa inicial confirmada para 2026[web:9]
      perKm: 1.56,
      perMinute: 0.50
    },
    uber: {
      available: true,
      averageAirportToCity: 100  // Promedio actualizado 2025-2026 (rangos $80-$180 según demanda)[web:14][web:15]
    },
    train: {
      airportToCity: 11.50  // AirTrain JFK ($8.50) + Subway ($3.00)[web:21][web:2][web:3]
    }
  },
  dailyCosts: {
    budget: {
      accommodation: 85,  // Ajustado por inflación 2026[web:20]
      food: 50,  // Ajustado según costos de comida 2026[web:10]
      transport: 15,
      activities: 30
    },
    midRange: {
      accommodation: 210,  // Promedio hoteles mid-range 2026[web:20]
      food: 100,  // Ajustado según costos de restaurantes 2026[web:10]
      transport: 25,
      activities: 60
    },
    luxury: {
      accommodation: 520,  // Ajustado según hoteles de lujo 2026[web:20]
      food: 210,
      transport: 60,
      activities: 150
    }
  },
  tips: {
    restaurants: '15-20% mandatory for good service, 20%+ for excellent',
    cafes: '$1-2 per drink, or 15-20% for table service',
    taxis: '15-20% of fare',
    general: 'Tipping is expected in the US. Service workers rely on tips for income'
  },
  cash: {
    widelyAccepted: false,
    atmAvailability: 'ATMs everywhere, very common',
    atmFees: '$3-5 per transaction for out-of-network ATMs',
    recommendedAmount: 'Cards accepted almost everywhere (OMNY contactless widely used). Keep $50-100 for street vendors and small shops'
  },
  hiddenCosts: [
    {
      type: 'tax',
      title: 'Hotel Occupancy Tax',
      description: 'Hotels in NYC charge 14.75% in combined city and state taxes, plus $3.50/night room fee.',
      amount: '14.75% + $3.50/night'
    },
    {
      type: 'surcharge',
      title: 'Congestion Pricing',
      description: 'Vehicles entering Manhattan south of 60th St are charged a toll during peak hours.',
      amount: '$15'
    }
  ],
  lastUpdated: '2026-01-27'
};

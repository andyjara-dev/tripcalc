import { CityData } from './types';

export const santiago: CityData = {
  id: 'santiago',
  name: 'Santiago',
  country: 'Chile',
  currency: 'CLP',
  currencySymbol: '$',
  language: 'Spanish',
  transport: {
    metro: {
      singleTicket: 800,
      dayPass: 0, // No existe day pass en Metro de Santiago
      multiTicket: {
        rides: 10,
        price: 7500 // Aproximado con tarjeta Bip!
      }
    },
    bus: {
      singleTicket: 740,
      dayPass: 0 // No existe day pass en RED/Transantiago
    },
    taxi: {
      baseRate: 400,
      perKm: 680,
      perMinute: 150
    },
    uber: {
      available: true,
      averageAirportToCity: 18000 // Aeropuerto a centro aprox
    },
    train: {
      airportToCity: 0 // No hay tren directo al aeropuerto
    },
    colectivo: {
      averageFare: 1000 // Taxis colectivos (transporte compartido)
    }
  },
  dailyCosts: {
    budget: {
      accommodation: 18000, // Hostal/habitación compartida
      food: 12000, // Mercados, menú del día, comida callejera
      transport: 3000, // Metro y bus principalmente
      activities: 8000 // Museos gratuitos, parques, cerros
    },
    midRange: {
      accommodation: 45000, // Hotel 3* o Airbnb privado
      food: 30000, // Restaurantes locales, cafés
      transport: 8000, // Mix de metro, bus y Uber ocasional
      activities: 20000 // Museos, tours, viñas cercanas
    },
    luxury: {
      accommodation: 120000, // Hotel 4-5* o boutique
      food: 70000, // Restaurantes premium, vinos
      transport: 25000, // Uber/taxi frecuente, transfers privados
      activities: 50000 // Tours privados, viñas premium, esquí cercano
    }
  },
  tips: {
    restaurants: '10% sugerido, a veces incluido en la cuenta',
    cafes: 'Propina opcional, redondear o dejar cambio',
    taxis: 'No obligatorio, redondear es común',
    general: 'Propina no es obligatoria pero apreciada. En restaurantes 10% es estándar.'
  },
  cash: {
    widelyAccepted: false, // Tarjetas ampliamente aceptadas
    atmAvailability: 'Muy común, cajeros en todas partes',
    atmFees: 'Bancos chilenos: sin comisión. Bancos extranjeros: 3.000-5.000 CLP',
    recommendedAmount: 'Tarjetas ampliamente aceptadas en Santiago. Llevar 20.000-50.000 CLP para ferias, transporte público (Bip!) y pequeños comercios.'
  },
  hiddenCosts: [
    {
      type: 'fee',
      title: 'Tarjeta Bip!',
      amount: '1.550 CLP',
      description: 'Tarjeta recargable necesaria para Metro y buses RED. Se compra una vez y se recarga.'
    },
    {
      type: 'surcharge',
      title: 'Propina restaurantes',
      amount: '10%',
      description: 'Propina del 10% es estándar en restaurantes, a veces ya incluida en la cuenta como "servicio".'
    }
  ],
  lastUpdated: '2026-01'
};

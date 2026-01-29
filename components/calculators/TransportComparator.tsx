'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { CityData } from '@/data/cities';

interface TransportComparatorProps {
  city: CityData;
}

interface TransportOption {
  name: string;
  price: number;
  duration?: string;
  notes?: string;
}

export default function TransportComparator({ city }: TransportComparatorProps) {
  const t = useTranslations('calculator');
  const [trips, setTrips] = useState(1);

  const getTransportIcon = (name: string) => {
    if (name.includes('Metro') || name.includes('metro')) return '🚇';
    if (name.includes('Bus') || name.includes('Autobús')) return '🚌';
    if (name.includes('Taxi')) return '🚕';
    if (name.includes('Uber')) return '🚗';
    return '🚆';
  };

  const options: TransportOption[] = [];

  // Metro
  if (city.transport.metro) {
    options.push({
      name: t('metroSingle'),
      price: city.transport.metro.singleTicket * trips,
      notes: `${city.currencySymbol}${city.transport.metro.singleTicket.toFixed(2)} ${t('perTrip')}`,
    });

    if (city.transport.metro.dayPass) {
      const dayPassValue = Math.ceil(trips / 10) * city.transport.metro.dayPass;
      options.push({
        name: t('metroDayPass'),
        price: dayPassValue,
        notes: `${city.currencySymbol}${city.transport.metro.dayPass.toFixed(2)} ${t('unlimited')}`,
      });
    }

    if (city.transport.metro.multiTicket) {
      const packetsNeeded = Math.ceil(trips / city.transport.metro.multiTicket.rides);
      options.push({
        name: t('metroMulti', { count: city.transport.metro.multiTicket.rides }),
        price: packetsNeeded * city.transport.metro.multiTicket.price,
        notes: `${city.currencySymbol}${city.transport.metro.multiTicket.price.toFixed(2)} ${t('perPack')}`,
      });
    }
  }

  // Bus
  if (city.transport.bus) {
    options.push({
      name: t('busSingle'),
      price: city.transport.bus.singleTicket * trips,
      notes: `${city.currencySymbol}${city.transport.bus.singleTicket.toFixed(2)} ${t('perTrip')}`,
    });
  }

  // Taxi
  if (city.transport.taxi) {
    const avgTripKm = 5; // Average trip distance
    const avgTripMin = 15; // Average trip duration
    const taxiCost = city.transport.taxi.baseRate +
                     (avgTripKm * city.transport.taxi.perKm) +
                     (city.transport.taxi.perMinute ? avgTripMin * city.transport.taxi.perMinute : 0);

    options.push({
      name: t('taxi'),
      price: taxiCost * trips,
      notes: `~${city.currencySymbol}${taxiCost.toFixed(2)} ${t('avgTrip', { km: avgTripKm })}`,
    });
  }

  // Uber
  if (city.transport.uber?.available && city.transport.uber.averageAirportToCity) {
    const avgUberTrip = city.transport.uber.averageAirportToCity * 0.3; // Estimate city trip as 30% of airport trip
    options.push({
      name: t('uberRideshare'),
      price: avgUberTrip * trips,
      notes: `~${city.currencySymbol}${avgUberTrip.toFixed(2)} ${t('avgCityTrip')}`,
    });
  }

  // Sort by price
  options.sort((a, b) => a.price - b.price);

  const cheapest = options[0];
  const mostExpensive = options[options.length - 1];
  const savings = mostExpensive ? mostExpensive.price - cheapest.price : 0;

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-900 mb-8">{t('transportComparison')}</h2>

      {/* Trip Counter */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">{t('numberOfTrips')}</label>
        <input
          type="range"
          min="1"
          max="20"
          value={trips}
          onChange={(e) => setTrips(Number(e.target.value))}
          className="w-full accent-gray-900"
        />
        <div className="text-center text-lg font-semibold text-gray-900 mt-2">{trips} {t('trips')}</div>
      </div>

      {/* Options */}
      <div className="space-y-3 mb-6">
        {options.map((option, index) => (
          <div
            key={option.name}
            className={`p-4 rounded-lg border-2 ${
              index === 0
                ? 'border-green-500 bg-green-50'
                : 'border-gray-200'
            }`}
          >
            <div className="flex justify-between items-center mb-2">
              <span className="flex items-center gap-3 font-semibold text-gray-900">
                <span className="text-3xl" role="img" aria-label={option.name}>
                  {getTransportIcon(option.name)}
                </span>
                <span>{option.name}</span>
              </span>
              <span className="text-2xl font-bold text-gray-900">
                {city.currencySymbol}{option.price.toFixed(2)}
              </span>
            </div>
            {option.notes && (
              <div className="text-sm text-gray-700 ml-12">{option.notes}</div>
            )}
            {index === 0 && (
              <div className="text-sm font-semibold text-green-700 mt-2 ml-12">
                ✓ {t('bestValue')}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Savings Summary */}
      {savings > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-sm text-gray-700 mb-1">
            {t('potentialSavings')} {cheapest.name}:
          </div>
          <div className="text-2xl font-bold text-blue-600">
            {city.currencySymbol}{savings.toFixed(2)}
          </div>
          <div className="text-sm text-gray-700 mt-1">
            {t('vsMostExpensive')}
          </div>
        </div>
      )}
    </div>
  );
}

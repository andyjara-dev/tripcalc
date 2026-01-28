'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { CityData } from '@/data/cities';

interface AirportTransferCalculatorProps {
  city: CityData;
}

interface TransferOption {
  name: string;
  price: number;
  duration: string;
  comfort: number; // 1-5
  convenience: number; // 1-5
  notes: string;
}

export default function AirportTransferCalculator({ city }: AirportTransferCalculatorProps) {
  const t = useTranslations('calculator');
  const [people, setPeople] = useState(1);
  const [luggage, setLuggage] = useState(1);

  const options: TransferOption[] = [];

  // Train/Metro
  if (city.transport.train?.airportToCity) {
    options.push({
      name: t('trainMetro'),
      price: city.transport.train.airportToCity * people,
      duration: t('durations.trainAirport'),
      comfort: 3,
      convenience: 4,
      notes: t('fastFrequent'),
    });
  } else if (city.transport.metro) {
    options.push({
      name: t('metro'),
      price: city.transport.metro.singleTicket * people,
      duration: t('durations.metroAirport'),
      comfort: 2,
      convenience: 3,
      notes: t('cheapestMayTransfer'),
    });
  }

  // Bus
  if (city.transport.bus) {
    const busCost = city.transport.bus.singleTicket * 1.5; // Airport bus usually more expensive
    options.push({
      name: t('airportBus'),
      price: busCost * people,
      duration: t('durations.busAirport'),
      comfort: 3,
      convenience: 4,
      notes: t('comfortableDirect'),
    });
  }

  // Taxi
  if (city.transport.taxi) {
    const avgAirportDistance = 20; // km
    const avgAirportDuration = 30; // minutes
    const taxiCost = city.transport.taxi.baseRate +
                     (avgAirportDistance * city.transport.taxi.perKm) +
                     (city.transport.taxi.perMinute ? avgAirportDuration * city.transport.taxi.perMinute : 0);

    // Taxi price doesn't scale linearly with people (usually flat rate)
    const taxiTotal = people <= 4 ? taxiCost : taxiCost * Math.ceil(people / 4);

    options.push({
      name: t('taxi'),
      price: taxiTotal,
      duration: t('durations.taxiAirport'),
      comfort: 4,
      convenience: 5,
      notes: t('doorToDoor'),
    });
  }

  // Uber
  if (city.transport.uber?.available && city.transport.uber.averageAirportToCity) {
    const uberCost = people <= 4
      ? city.transport.uber.averageAirportToCity
      : city.transport.uber.averageAirportToCity * Math.ceil(people / 4);

    options.push({
      name: t('uberRideshare'),
      price: uberCost,
      duration: t('durations.uberAirport'),
      comfort: 4,
      convenience: 5,
      notes: t('bookInApp'),
    });
  }

  // Sort by price
  options.sort((a, b) => a.price - b.price);

  const cheapest = options[0];
  const pricePerPerson = options.map(opt => ({
    ...opt,
    pricePerPerson: opt.price / people,
  }));

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-900 mb-8">{t('airportTransferCalc')}</h2>

      {/* Inputs */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t('numberOfPeople')}</label>
          <select
            value={people}
            onChange={(e) => setPeople(Number(e.target.value))}
            className="w-full border border-gray-300 rounded-lg p-2 text-gray-900"
          >
            {[1, 2, 3, 4, 5, 6].map(n => (
              <option key={n} value={n}>{n} {n === 1 ? t('person') : t('people')}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t('piecesOfLuggage')}</label>
          <select
            value={luggage}
            onChange={(e) => setLuggage(Number(e.target.value))}
            className="w-full border border-gray-300 rounded-lg p-2 text-gray-900"
          >
            {[0, 1, 2, 3, 4].map(n => (
              <option key={n} value={n}>{n} {n === 1 ? t('bag') : t('bags')}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Options */}
      <div className="space-y-4 mb-6">
        {options.map((option, index) => (
          <div
            key={option.name}
            className={`p-4 rounded-lg border-2 ${
              index === 0
                ? 'border-green-500 bg-green-50'
                : 'border-gray-200'
            }`}
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="font-bold text-lg text-gray-900">{option.name}</div>
                <div className="text-sm text-gray-600">{option.duration}</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">
                  {city.currencySymbol}{option.price.toFixed(2)}
                </div>
                <div className="text-sm text-gray-600">
                  {city.currencySymbol}{(option.price / people).toFixed(2)}{t('perPerson')}
                </div>
              </div>
            </div>

            {/* Ratings */}
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">{t('comfort')}:</span>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={i < option.comfort ? 'text-yellow-400' : 'text-gray-300'}>
                      ★
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">{t('convenience')}:</span>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={i < option.convenience ? 'text-yellow-400' : 'text-gray-300'}>
                      ★
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="text-sm text-gray-600">{option.notes}</div>

            {index === 0 && (
              <div className="text-sm font-semibold text-green-700 mt-2">
                ✓ {t('cheapestOption')}
              </div>
            )}

            {luggage > 2 && (option.name.includes('Metro') || option.name.includes('metro')) && (
              <div className="text-sm text-orange-600 mt-2">
                ⚠ {t('mayBeDifficult', { count: luggage })}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Recommendation */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="font-semibold mb-2">💡 {t('recommendation')}</div>
        {people === 1 && luggage <= 1 ? (
          <p className="text-sm">
            {t('soloTraveler')}
          </p>
        ) : people >= 3 ? (
          <p className="text-sm">
            {t('groupTraveler')}
          </p>
        ) : luggage > 2 ? (
          <p className="text-sm">
            {t('heavyLuggage')}
          </p>
        ) : (
          <p className="text-sm">
            {t('generalRecommendation')}
          </p>
        )}
      </div>
    </div>
  );
}

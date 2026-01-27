'use client';

import { useState } from 'react';
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
  const [people, setPeople] = useState(1);
  const [luggage, setLuggage] = useState(1);

  const options: TransferOption[] = [];

  // Train/Metro
  if (city.transport.train?.airportToCity) {
    options.push({
      name: 'Train/Metro',
      price: city.transport.train.airportToCity * people,
      duration: '30-45 min',
      comfort: 3,
      convenience: 4,
      notes: 'Fast, frequent, good with light luggage',
    });
  } else if (city.transport.metro) {
    options.push({
      name: 'Metro',
      price: city.transport.metro.singleTicket * people,
      duration: '45-60 min',
      comfort: 2,
      convenience: 3,
      notes: 'Cheapest option, may require transfers',
    });
  }

  // Bus
  if (city.transport.bus) {
    const busCost = city.transport.bus.singleTicket * 1.5; // Airport bus usually more expensive
    options.push({
      name: 'Airport Bus',
      price: busCost * people,
      duration: '45-60 min',
      comfort: 3,
      convenience: 4,
      notes: 'Comfortable, direct route, luggage space',
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
      name: 'Taxi',
      price: taxiTotal,
      duration: '25-40 min',
      comfort: 4,
      convenience: 5,
      notes: 'Door to door, good for 1-4 people',
    });
  }

  // Uber
  if (city.transport.uber?.available && city.transport.uber.averageAirportToCity) {
    const uberCost = people <= 4
      ? city.transport.uber.averageAirportToCity
      : city.transport.uber.averageAirportToCity * Math.ceil(people / 4);

    options.push({
      name: 'Uber/Rideshare',
      price: uberCost,
      duration: '25-40 min',
      comfort: 4,
      convenience: 5,
      notes: 'Book in app, usually cheaper than taxi',
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
    <div className="bg-white border rounded-lg p-6 shadow-sm">
      <h2 className="text-2xl font-bold mb-6">Airport Transfer Calculator</h2>

      {/* Inputs */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-2">Number of People</label>
          <select
            value={people}
            onChange={(e) => setPeople(Number(e.target.value))}
            className="w-full border rounded-lg p-2"
          >
            {[1, 2, 3, 4, 5, 6].map(n => (
              <option key={n} value={n}>{n} {n === 1 ? 'person' : 'people'}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Pieces of Luggage</label>
          <select
            value={luggage}
            onChange={(e) => setLuggage(Number(e.target.value))}
            className="w-full border rounded-lg p-2"
          >
            {[0, 1, 2, 3, 4].map(n => (
              <option key={n} value={n}>{n} {n === 1 ? 'bag' : 'bags'}</option>
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
                <div className="font-bold text-lg">{option.name}</div>
                <div className="text-sm text-gray-600">{option.duration}</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">
                  {city.currencySymbol}{option.price.toFixed(2)}
                </div>
                <div className="text-sm text-gray-600">
                  {city.currencySymbol}{(option.price / people).toFixed(2)}/person
                </div>
              </div>
            </div>

            {/* Ratings */}
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Comfort:</span>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={i < option.comfort ? 'text-yellow-400' : 'text-gray-300'}>
                      ★
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Convenience:</span>
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
                ✓ Cheapest Option
              </div>
            )}

            {luggage > 2 && option.name.includes('Metro') && (
              <div className="text-sm text-orange-600 mt-2">
                ⚠ May be difficult with {luggage} bags
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Recommendation */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="font-semibold mb-2">💡 Recommendation:</div>
        {people === 1 && luggage <= 1 ? (
          <p className="text-sm">
            For solo travelers with light luggage, public transport is the most economical choice.
          </p>
        ) : people >= 3 ? (
          <p className="text-sm">
            For groups of 3+, a taxi or Uber becomes competitive when splitting the cost.
          </p>
        ) : luggage > 2 ? (
          <p className="text-sm">
            With multiple bags, consider taxi/Uber for comfort and convenience.
          </p>
        ) : (
          <p className="text-sm">
            Public transport offers the best value. Taxi/Uber if you prioritize comfort.
          </p>
        )}
      </div>
    </div>
  );
}

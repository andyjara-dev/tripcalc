'use client';

import { useState } from 'react';
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
  const [trips, setTrips] = useState(1);

  const options: TransportOption[] = [];

  // Metro
  if (city.transport.metro) {
    options.push({
      name: 'Metro (Single)',
      price: city.transport.metro.singleTicket * trips,
      notes: `${city.currencySymbol}${city.transport.metro.singleTicket.toFixed(2)} per trip`,
    });

    if (city.transport.metro.dayPass) {
      const dayPassValue = Math.ceil(trips / 10) * city.transport.metro.dayPass;
      options.push({
        name: 'Metro (Day Pass)',
        price: dayPassValue,
        notes: `${city.currencySymbol}${city.transport.metro.dayPass.toFixed(2)} unlimited daily`,
      });
    }

    if (city.transport.metro.multiTicket) {
      const packetsNeeded = Math.ceil(trips / city.transport.metro.multiTicket.rides);
      options.push({
        name: `Metro (${city.transport.metro.multiTicket.rides}-trip pack)`,
        price: packetsNeeded * city.transport.metro.multiTicket.price,
        notes: `${city.currencySymbol}${city.transport.metro.multiTicket.price.toFixed(2)} per pack`,
      });
    }
  }

  // Bus
  if (city.transport.bus) {
    options.push({
      name: 'Bus (Single)',
      price: city.transport.bus.singleTicket * trips,
      notes: `${city.currencySymbol}${city.transport.bus.singleTicket.toFixed(2)} per trip`,
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
      name: 'Taxi',
      price: taxiCost * trips,
      notes: `~${city.currencySymbol}${taxiCost.toFixed(2)} per ${avgTripKm}km trip`,
    });
  }

  // Uber
  if (city.transport.uber?.available && city.transport.uber.averageAirportToCity) {
    const avgUberTrip = city.transport.uber.averageAirportToCity * 0.3; // Estimate city trip as 30% of airport trip
    options.push({
      name: 'Uber/Rideshare',
      price: avgUberTrip * trips,
      notes: `~${city.currencySymbol}${avgUberTrip.toFixed(2)} average city trip`,
    });
  }

  // Sort by price
  options.sort((a, b) => a.price - b.price);

  const cheapest = options[0];
  const mostExpensive = options[options.length - 1];
  const savings = mostExpensive ? mostExpensive.price - cheapest.price : 0;

  return (
    <div className="bg-white border rounded-lg p-6 shadow-sm">
      <h2 className="text-2xl font-bold mb-6">Transport Cost Comparison</h2>

      {/* Trip Counter */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Number of Trips</label>
        <input
          type="range"
          min="1"
          max="20"
          value={trips}
          onChange={(e) => setTrips(Number(e.target.value))}
          className="w-full"
        />
        <div className="text-center text-lg font-semibold mt-2">{trips} trips</div>
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
            <div className="flex justify-between items-center mb-1">
              <span className="font-semibold">{option.name}</span>
              <span className="text-xl font-bold">
                {city.currencySymbol}{option.price.toFixed(2)}
              </span>
            </div>
            {option.notes && (
              <div className="text-sm text-gray-600">{option.notes}</div>
            )}
            {index === 0 && (
              <div className="text-sm font-semibold text-green-700 mt-2">
                ✓ Best Value
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Savings Summary */}
      {savings > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-sm text-gray-700 mb-1">
            Potential Savings with {cheapest.name}:
          </div>
          <div className="text-2xl font-bold text-blue-600">
            {city.currencySymbol}{savings.toFixed(2)}
          </div>
          <div className="text-sm text-gray-600 mt-1">
            vs. most expensive option
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect, useRef } from 'react';

type Airline = {
  id: string;
  name: string;
  code: string | null;
  country: string | null;
  region: string | null;
};

type Props = {
  value: string; // airline ID
  onChange: (airlineId: string, airlineName: string) => void;
  placeholder?: string;
  label?: string;
};

export default function AirlineAutocomplete({ value, onChange, placeholder, label }: Props) {
  const [airlines, setAirlines] = useState<Airline[]>([]);
  const [filteredAirlines, setFilteredAirlines] = useState<Airline[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Load airlines on mount
  useEffect(() => {
    async function loadAirlines() {
      try {
        const response = await fetch('/api/airlines');
        const data = await response.json();
        setAirlines(data.airlines || []);
        setFilteredAirlines(data.airlines || []);
      } catch (error) {
        console.error('Error loading airlines:', error);
      } finally {
        setLoading(false);
      }
    }
    loadAirlines();
  }, []);

  // Set initial search term from value
  useEffect(() => {
    if (value && airlines.length > 0) {
      const airline = airlines.find(a => a.id === value);
      if (airline) {
        setSearchTerm(airline.name);
      }
    }
  }, [value, airlines]);

  // Filter airlines based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredAirlines(airlines);
    } else {
      const filtered = airlines.filter(airline =>
        airline.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (airline.code && airline.code.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (airline.country && airline.country.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredAirlines(filtered);
    }
  }, [searchTerm, airlines]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (airline: Airline) => {
    setSearchTerm(airline.name);
    setIsOpen(false);
    onChange(airline.id, airline.name);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setIsOpen(true);
  };

  return (
    <div ref={wrapperRef} className="relative">
      {label && (
        <label className="block text-sm font-medium text-gray-900 mb-2">
          {label} ✈️
        </label>
      )}

      <input
        type="text"
        value={searchTerm}
        onChange={handleInputChange}
        onFocus={() => setIsOpen(true)}
        placeholder={placeholder || 'Buscar aerolínea...'}
        disabled={loading}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white disabled:bg-gray-100"
      />

      {isOpen && filteredAirlines.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filteredAirlines.map((airline) => (
            <button
              key={airline.id}
              type="button"
              onClick={() => handleSelect(airline)}
              className="w-full px-4 py-2 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none transition"
            >
              <div className="font-medium text-gray-900">{airline.name}</div>
              <div className="text-xs text-gray-600">
                {airline.code && <span className="mr-2">({airline.code})</span>}
                {airline.country && <span>{airline.country}</span>}
                {airline.region && <span className="ml-2 text-gray-500">• {airline.region}</span>}
              </div>
            </button>
          ))}
        </div>
      )}

      {isOpen && searchTerm && filteredAirlines.length === 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4 text-center text-gray-600">
          No se encontraron aerolíneas
        </div>
      )}
    </div>
  );
}

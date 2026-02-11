'use client';

/**
 * LocationAutocomplete Component
 * Input field with address autocomplete using geocoding API
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslations } from 'next-intl';
import type { GeoLocation } from '@/lib/types/itinerary';
import type { CityBounds } from '@/lib/services/geocoding';

interface LocationAutocompleteProps {
  value?: GeoLocation;
  onChange: (location: GeoLocation | null) => void;
  placeholder?: string;
  cityBounds?: CityBounds;
  disabled?: boolean;
}

export default function LocationAutocomplete({
  value,
  onChange,
  placeholder,
  cityBounds,
  disabled = false,
}: LocationAutocompleteProps) {
  const t = useTranslations('itinerary');
  const [inputValue, setInputValue] = useState(value?.address || '');
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Update input when value prop changes
  useEffect(() => {
    if (value?.address && value.address !== inputValue) {
      setInputValue(value.address);
    }
  }, [value]);

  // Geocode address with debounce
  const geocodeAddress = useCallback(
    async (address: string) => {
      if (!address || address.trim().length < 3) {
        onChange(null);
        setError(null);
        return;
      }

      setIsGeocoding(true);
      setError(null);

      try {
        const response = await fetch('/api/itinerary/geocode', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            address: address.trim(),
            cityBounds,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          if (response.status === 404) {
            setError(t('addressNotFound'));
          } else if (response.status === 429) {
            setError(t('rateLimitExceeded'));
          } else {
            setError(t('geocodingFailed'));
          }
          onChange(null);
          return;
        }

        if (data.success && data.location) {
          onChange(data.location);
          setError(null);
        } else {
          setError(t('geocodingFailed'));
          onChange(null);
        }
      } catch (err) {
        console.error('Geocoding error:', err);
        setError(t('geocodingFailed'));
        onChange(null);
      } finally {
        setIsGeocoding(false);
      }
    },
    [onChange, cityBounds, t]
  );

  // Handle input change with debounce
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer (500ms debounce)
    debounceTimerRef.current = setTimeout(() => {
      geocodeAddress(newValue);
    }, 500);
  };

  // Handle blur (immediate geocode if not already geocoded)
  const handleBlur = () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (inputValue && !value) {
      geocodeAddress(inputValue);
    }
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return (
    <div className="relative w-full">
      <div className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          placeholder={placeholder || t('enterAddress')}
          disabled={disabled}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
            error
              ? 'border-red-300 focus:ring-red-500'
              : value
              ? 'border-green-300 focus:ring-green-500'
              : 'border-gray-300 focus:ring-blue-500'
          } ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
        />

        {/* Status icon */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          {isGeocoding && (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          )}
          {!isGeocoding && value && !error && (
            <span className="text-green-600 text-lg">✓</span>
          )}
          {!isGeocoding && error && (
            <span className="text-red-600 text-lg">⚠</span>
          )}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}

      {/* Success hint */}
      {value && !error && (
        <p className="mt-1 text-sm text-green-600">
          📍 {t('locationFound')}
        </p>
      )}
    </div>
  );
}

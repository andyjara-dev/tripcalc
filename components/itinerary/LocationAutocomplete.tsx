'use client';

/**
 * LocationAutocomplete Component
 * Input field with address autocomplete using geocoding API
 * Supports pasting coordinates (e.g. from Google Maps: "41.3851, 2.1734")
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

// Detect if text looks like coordinates (lat, lon)
// Supports: "41.3851, 2.1734", "-33.4489,-70.6693", "41.3851 2.1734"
function parseCoordinates(text: string): { lat: number; lon: number } | null {
  const trimmed = text.trim();
  // Match: optional minus, digits, optional decimal, separator (comma and/or space), same pattern
  const match = trimmed.match(
    /^(-?\d{1,3}(?:\.\d+)?)\s*[,\s]\s*(-?\d{1,3}(?:\.\d+)?)$/
  );
  if (!match) return null;

  const lat = parseFloat(match[1]);
  const lon = parseFloat(match[2]);

  // Validate ranges
  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) return null;

  return { lat, lon };
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
  // Track if location was set externally (map pick, saved location, coordinates)
  // to avoid re-geocoding on blur
  const resolvedExternallyRef = useRef(!!value);

  // Update input when value prop changes (e.g. from map pick or saved location)
  useEffect(() => {
    if (value?.address && value.address !== inputValue) {
      setInputValue(value.address);
      resolvedExternallyRef.current = true;
      setError(null);
    }
  }, [value]);

  // Reverse geocode coordinates
  const reverseGeocodeCoords = useCallback(
    async (lat: number, lon: number) => {
      setIsGeocoding(true);
      setError(null);

      try {
        const response = await fetch('/api/itinerary/reverse-geocode', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lat, lon }),
        });

        const data = await response.json();

        if (!response.ok || !data.success || !data.location) {
          // Even if reverse geocode fails, use coordinates as address
          const location: GeoLocation = {
            lat,
            lon,
            address: `${lat.toFixed(6)}, ${lon.toFixed(6)}`,
            placeId: `coords_${lat}_${lon}`,
          };
          onChange(location);
          resolvedExternallyRef.current = true;
          setInputValue(location.address);
          setError(null);
          return;
        }

        onChange(data.location);
        resolvedExternallyRef.current = true;
        setInputValue(data.location.address);
        setError(null);
      } catch (err) {
        console.error('Reverse geocoding error:', err);
        // Fallback: use raw coordinates
        const location: GeoLocation = {
          lat,
          lon,
          address: `${lat.toFixed(6)}, ${lon.toFixed(6)}`,
          placeId: `coords_${lat}_${lon}`,
        };
        onChange(location);
        resolvedExternallyRef.current = true;
        setInputValue(location.address);
        setError(null);
      } finally {
        setIsGeocoding(false);
      }
    },
    [onChange]
  );

  // Geocode address with debounce
  const geocodeAddress = useCallback(
    async (address: string) => {
      if (!address || address.trim().length < 3) {
        onChange(null);
        setError(null);
        return;
      }

      // Check if it's coordinates first
      const coords = parseCoordinates(address);
      if (coords) {
        reverseGeocodeCoords(coords.lat, coords.lon);
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
    [onChange, cityBounds, t, reverseGeocodeCoords]
  );

  // Handle paste - detect coordinates immediately
  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLInputElement>) => {
      const pasted = e.clipboardData.getData('text');
      const coords = parseCoordinates(pasted);
      if (coords) {
        e.preventDefault();
        setInputValue(pasted.trim());
        // Clear any pending debounce
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }
        reverseGeocodeCoords(coords.lat, coords.lon);
      }
    },
    [reverseGeocodeCoords]
  );

  // Handle input change with debounce
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    // User is typing manually, clear external resolution flag
    resolvedExternallyRef.current = false;

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

    // Don't re-geocode if location was set externally (map pick, saved location)
    // or if we already have a resolved value
    if (inputValue && !value && !resolvedExternallyRef.current) {
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
          onPaste={handlePaste}
          placeholder={placeholder || t('enterAddress')}
          disabled={disabled}
          className={`w-full px-3 py-2 text-gray-900 border rounded-lg focus:outline-none focus:ring-2 ${
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

      {/* Coordinates hint (when empty) */}
      {!value && !error && !isGeocoding && !inputValue && (
        <p className="mt-1 text-xs text-gray-500">
          {t('coordsHint')}
        </p>
      )}
    </div>
  );
}

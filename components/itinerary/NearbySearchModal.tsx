'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import type { GeoLocation } from '@/lib/types/itinerary';
import type { NearbyCategory, NearbyPlace } from '@/lib/types/nearby';
import { NEARBY_CATEGORIES, CATEGORY_ICONS } from '@/lib/types/nearby';
import type { MapMarker } from './LeafletMap';

// Importar mapa dinámicamente (SSR false, como Leaflet requiere)
const LeafletMap = dynamic(() => import('./LeafletMap'), { ssr: false });

const RADIUS_OPTIONS = [200, 500, 1000, 2000] as const;
type RadiusOption = typeof RADIUS_OPTIONS[number];

function formatRadius(r: RadiusOption): string {
  return r >= 1000 ? `${r / 1000}km` : `${r}m`;
}

function formatDistance(meters: number): string {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)}km`;
  }
  return `${meters}m`;
}

interface NearbySearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  centerLocation: GeoLocation;
  onAddToItinerary: (place: NearbyPlace) => void;
}

export default function NearbySearchModal({
  isOpen,
  onClose,
  centerLocation,
  onAddToItinerary,
}: NearbySearchModalProps) {
  const t = useTranslations('nearby');

  const [selectedCategory, setSelectedCategory] = useState<NearbyCategory | null>(null);
  const [radius, setRadius] = useState<RadiusOption>(500);
  const [results, setResults] = useState<NearbyPlace[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  const search = useCallback(async (category: NearbyCategory, searchRadius: RadiusOption) => {
    setIsLoading(true);
    setError(null);
    setResults([]);
    setHighlightedId(null);

    try {
      const params = new URLSearchParams({
        lat: centerLocation.lat.toString(),
        lon: centerLocation.lon.toString(),
        category,
        radius: searchRadius.toString(),
      });

      const res = await fetch(`/api/nearby?${params}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || t('error'));
      }

      setResults(data.places || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('error'));
    } finally {
      setIsLoading(false);
    }
  }, [centerLocation, t]);

  // Buscar automáticamente al cambiar categoría o radio
  useEffect(() => {
    if (selectedCategory && isOpen) {
      search(selectedCategory, radius);
    }
  }, [selectedCategory, radius, isOpen, search]);

  // Resetear al abrir
  useEffect(() => {
    if (isOpen) {
      setSelectedCategory(null);
      setResults([]);
      setError(null);
      setAddedIds(new Set());
      setHighlightedId(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAdd = (place: NearbyPlace) => {
    onAddToItinerary(place);
    setAddedIds(prev => new Set([...prev, place.id]));
  };

  // Construir markers para el mapa
  const centerMarker: MapMarker = {
    id: '__center__',
    position: [centerLocation.lat, centerLocation.lon],
    label: centerLocation.address,
    number: 0,
  };

  const resultMarkers: MapMarker[] = results.map((place, index) => ({
    id: place.id,
    position: [place.lat, place.lon],
    label: place.name,
    number: index + 1,
    onClick: () => setHighlightedId(place.id),
  }));

  const allMarkers = [centerMarker, ...resultMarkers];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative min-h-screen flex items-start justify-center pt-4 pb-4 px-4">
        <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                🔍 {t('title')}
              </h2>
              <p className="text-sm text-gray-600 mt-0.5">
                {t('subtitle', { address: centerLocation.address.substring(0, 50) })}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              ✕
            </button>
          </div>

          <div className="p-4 space-y-4">
            {/* Layout 2 columnas en desktop */}
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Panel izquierdo: categorías + radio */}
              <div className="lg:w-64 flex-shrink-0 space-y-4">
                {/* Categorías */}
                <div>
                  <div className="grid grid-cols-3 lg:grid-cols-2 gap-2">
                    {NEARBY_CATEGORIES.map(cat => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`flex flex-col items-center gap-1 px-2 py-2 rounded-lg border text-xs font-medium transition-all ${
                          selectedCategory === cat
                            ? 'bg-purple-600 text-white border-purple-600'
                            : 'bg-white text-gray-700 border-gray-200 hover:bg-purple-50 hover:border-purple-300'
                        }`}
                      >
                        <span className="text-xl">{CATEGORY_ICONS[cat]}</span>
                        <span>{t(`categories.${cat}`)}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Radio */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('radius')}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {RADIUS_OPTIONS.map(r => (
                      <button
                        key={r}
                        onClick={() => setRadius(r)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                          radius === r
                            ? 'bg-gray-900 text-white border-gray-900'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {formatRadius(r)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Mini mapa */}
              <div className="flex-1 min-w-0">
                <div className="rounded-lg overflow-hidden border border-gray-200">
                  <LeafletMap
                    center={[centerLocation.lat, centerLocation.lon]}
                    zoom={14}
                    markers={allMarkers}
                    height="280px"
                    onMarkerClick={(id) => {
                      if (id !== '__center__') {
                        setHighlightedId(id);
                        // Scroll al resultado correspondiente
                        const el = document.getElementById(`nearby-result-${id}`);
                        el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Resultados */}
            <div>
              {/* Estado: sin categoría seleccionada */}
              {!selectedCategory && (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-3xl mb-2">🔍</div>
                  <p className="font-medium text-gray-700">{t('selectCategory')}</p>
                </div>
              )}

              {/* Loading */}
              {isLoading && (
                <div className="text-center py-8">
                  <div className="inline-block w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mb-3" />
                  <p className="text-gray-600 font-medium">{t('loading')}</p>
                </div>
              )}

              {/* Error */}
              {error && !isLoading && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                  <p className="text-red-700 font-medium">⚠️ {error}</p>
                  {selectedCategory && (
                    <button
                      onClick={() => search(selectedCategory, radius)}
                      className="mt-2 text-sm text-red-600 hover:text-red-700 underline"
                    >
                      {t('error')}
                    </button>
                  )}
                </div>
              )}

              {/* Sin resultados */}
              {!isLoading && !error && selectedCategory && results.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-3xl mb-2">🗺️</div>
                  <p className="font-medium text-gray-700">{t('noResults')}</p>
                </div>
              )}

              {/* Lista de resultados */}
              {!isLoading && results.length > 0 && (
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {results.map((place, index) => {
                    const isAdded = addedIds.has(place.id);
                    const isHighlighted = highlightedId === place.id;

                    return (
                      <div
                        key={place.id}
                        id={`nearby-result-${place.id}`}
                        onClick={() => setHighlightedId(place.id)}
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                          isHighlighted
                            ? 'bg-purple-50 border-purple-300 ring-1 ring-purple-200'
                            : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                        }`}
                      >
                        {/* Número */}
                        <div className="w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0">
                          {index + 1}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-base">{CATEGORY_ICONS[place.category]}</span>
                            <span className="font-semibold text-gray-900 truncate">{place.name}</span>
                          </div>
                          {place.address && (
                            <p className="text-xs text-gray-500 mt-0.5 truncate">{place.address}</p>
                          )}
                          {place.openingHours && (
                            <p className="text-xs text-gray-400 truncate">🕐 {place.openingHours}</p>
                          )}
                        </div>

                        {/* Distancia */}
                        {place.distance !== undefined && (
                          <span className="text-xs font-medium text-gray-600 flex-shrink-0 whitespace-nowrap">
                            📍 {formatDistance(place.distance)}
                          </span>
                        )}

                        {/* Botón agregar */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAdd(place);
                          }}
                          disabled={isAdded}
                          className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                            isAdded
                              ? 'bg-green-100 text-green-700 border border-green-300 cursor-default'
                              : 'bg-purple-600 text-white hover:bg-purple-700 border border-purple-600'
                          }`}
                        >
                          {isAdded ? `✓ ${t('added')}` : `➕ ${t('addButton')}`}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Footer con atribución */}
          <div className="px-4 py-2 border-t border-gray-100 bg-gray-50 rounded-b-xl">
            <p className="text-xs text-gray-400 text-center">{t('dataSource')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

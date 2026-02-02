'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import CityAutocomplete from './CityAutocomplete';
import DateRangePicker from './DateRangePicker';
import AirlineAutocomplete from './AirlineAutocomplete';

type PackingParams = {
  preset?: string; // Luggage preset key
  airlineId?: string; // Airline ID if using airline-specific rules
  luggageType: 'carry-on' | 'checked' | 'backpack' | 'custom';
  weightLimit: number;
  dimensions?: string;
  duration: number;
  tripType: 'business' | 'leisure' | 'adventure' | 'beach' | 'ski' | 'city';
  climate?: 'cold' | 'mild' | 'warm' | 'hot' | 'mixed';
  gender: 'male' | 'female' | 'unisex';
  activities?: string[];
  // Advanced mode fields
  destination?: string;
  startDate?: string;
  endDate?: string;
};

type Props = {
  onGenerate: (params: PackingParams) => void | Promise<void>;
  onPresetChange?: (preset: string) => void; // Notify parent when preset changes
  loading: boolean;
  locale: string;
  initialParams?: Partial<PackingParams>;
};

const LUGGAGE_PRESETS = {
  'ryanair-carryon': { type: 'carry-on' as const, weight: 10, dimensions: '40x20x25' },
  'standard-carryon': { type: 'carry-on' as const, weight: 7, dimensions: '55x40x20' },
  'copa-carryon': { type: 'carry-on' as const, weight: 10, dimensions: '56x36x26' },
  'latam-carryon': { type: 'carry-on' as const, weight: 8, dimensions: '55x35x25' },
  'checked-20kg': { type: 'checked' as const, weight: 20, dimensions: '75x50x30' },
  'checked-23kg': { type: 'checked' as const, weight: 23, dimensions: '80x55x35' },
  'backpack-small': { type: 'backpack' as const, weight: 8, dimensions: '45x35x20' },
  'custom': { type: 'custom' as const, weight: 10, dimensions: '55x40x20' },
};

export default function LuggageConfig({ onGenerate, onPresetChange, loading, locale, initialParams }: Props) {
  const t = useTranslations('luggage.config');
  const hasNotifiedInitialPreset = useRef(false);

  // Mode toggle
  const [advancedMode, setAdvancedMode] = useState(false);

  // Airline mode
  const [useAirline, setUseAirline] = useState(false);
  const [selectedAirlineId, setSelectedAirlineId] = useState('');
  const [selectedAirlineName, setSelectedAirlineName] = useState('');
  const [airlineLuggageRules, setAirlineLuggageRules] = useState<any[]>([]);
  const [selectedAirlineLuggageType, setSelectedAirlineLuggageType] = useState('');

  // Common fields
  const [preset, setPreset] = useState('standard-carryon');
  const [luggageType, setLuggageType] = useState<PackingParams['luggageType']>('carry-on');
  const [weightLimit, setWeightLimit] = useState(7);
  const [dimensions, setDimensions] = useState('55x40x20');
  const [tripType, setTripType] = useState<PackingParams['tripType']>('leisure');
  const [gender, setGender] = useState<PackingParams['gender']>('unisex');

  // Simple mode fields
  const [duration, setDuration] = useState(5);
  const [climate, setClimate] = useState<PackingParams['climate']>('mild');

  // Advanced mode fields
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [calculatedDuration, setCalculatedDuration] = useState(0);

  // Calculate duration when dates change
  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      setCalculatedDuration(Math.max(1, diff));
    }
  }, [startDate, endDate]);

  // Load airline luggage rules when airline is selected
  useEffect(() => {
    async function loadAirlineLuggage() {
      if (!selectedAirlineId) {
        setAirlineLuggageRules([]);
        return;
      }

      try {
        const response = await fetch(`/api/airlines/${selectedAirlineId}/luggage`);
        const data = await response.json();
        setAirlineLuggageRules(data.luggageRules || []);

        // Try to find matching rule based on initial params, or select first rule
        if (data.luggageRules && data.luggageRules.length > 0) {
          let selectedRule = data.luggageRules[0];

          // If we have initial params, try to find matching rule
          if (initialParams?.weightLimit && initialParams?.dimensions) {
            const matchingRule = data.luggageRules.find((rule: any) =>
              rule.weightKg === initialParams.weightLimit &&
              rule.dimensions === initialParams.dimensions
            );
            if (matchingRule) {
              selectedRule = matchingRule;
            }
          }

          setSelectedAirlineLuggageType(selectedRule.id);

          // Only update luggage settings if not already set from initialParams
          if (!initialParams) {
            const luggageTypeMap: Record<string, 'carry-on' | 'checked' | 'backpack'> = {
              'carry-on': 'carry-on',
              'checked': 'checked',
              'personal': 'backpack',
            };
            setLuggageType(luggageTypeMap[selectedRule.type] || 'carry-on');
            setWeightLimit(selectedRule.weightKg);
            setDimensions(selectedRule.dimensions);
          }
        }
      } catch (error) {
        console.error('Error loading airline luggage rules:', error);
      }
    }

    loadAirlineLuggage();
  }, [selectedAirlineId, initialParams]);

  // Pre-populate form with initial params
  useEffect(() => {
    if (initialParams) {
      // Handle airline-specific mode
      if (initialParams.airlineId) {
        setUseAirline(true);
        setSelectedAirlineId(initialParams.airlineId);
      } else if (initialParams.preset) {
        setUseAirline(false);
        setPreset(initialParams.preset);
      }

      if (initialParams.luggageType) setLuggageType(initialParams.luggageType);
      if (initialParams.weightLimit) setWeightLimit(initialParams.weightLimit);
      if (initialParams.dimensions) setDimensions(initialParams.dimensions);
      if (initialParams.duration) setDuration(initialParams.duration);
      if (initialParams.tripType) setTripType(initialParams.tripType);
      if (initialParams.climate) setClimate(initialParams.climate);
      if (initialParams.gender) setGender(initialParams.gender);
      if (initialParams.destination) {
        setDestination(initialParams.destination);
        setAdvancedMode(true);
      }
      if (initialParams.startDate) setStartDate(initialParams.startDate);
      if (initialParams.endDate) setEndDate(initialParams.endDate);
    }
  }, [initialParams]);

  // Notify parent of preset on initial load if not set
  useEffect(() => {
    if (onPresetChange && initialParams && !initialParams.preset && !hasNotifiedInitialPreset.current) {
      onPresetChange(preset);
      hasNotifiedInitialPreset.current = true;
    }
  }, [onPresetChange, initialParams, preset]);

  const handlePresetChange = (presetKey: string) => {
    setPreset(presetKey);
    const presetData = LUGGAGE_PRESETS[presetKey as keyof typeof LUGGAGE_PRESETS];
    setLuggageType(presetData.type);
    setWeightLimit(presetData.weight);
    setDimensions(presetData.dimensions);

    // Notify parent of preset change
    if (onPresetChange) {
      onPresetChange(presetKey);
    }
  };

  const handleAirlineLuggageChange = (ruleId: string) => {
    setSelectedAirlineLuggageType(ruleId);
    const rule = airlineLuggageRules.find(r => r.id === ruleId);
    if (rule) {
      const luggageTypeMap: Record<string, 'carry-on' | 'checked' | 'backpack'> = {
        'carry-on': 'carry-on',
        'checked': 'checked',
        'personal': 'backpack',
      };
      setLuggageType(luggageTypeMap[rule.type] || 'carry-on');
      setWeightLimit(rule.weightKg);
      setDimensions(rule.dimensions);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const baseParams = {
      preset: useAirline ? undefined : preset, // Don't send preset if using airline
      airlineId: useAirline ? selectedAirlineId : undefined,
      luggageType,
      weightLimit,
      dimensions,
      tripType,
      gender,
    };

    if (advancedMode) {
      // Advanced mode: use destination + dates
      onGenerate({
        ...baseParams,
        destination: destination || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        duration: calculatedDuration || duration,
        // Don't send climate in advanced mode - Gemini will estimate it
      });
    } else {
      // Simple mode: use manual duration + climate
      onGenerate({
        ...baseParams,
        duration,
        climate,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Mode Toggle */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
        <div>
          <h3 className="font-semibold text-gray-900">
            {advancedMode ? '🌍 ' + t('advancedMode') : '⚡ ' + t('simpleMode')}
          </h3>
          <p className="text-sm text-gray-600">
            {advancedMode ? t('advancedModeDescription') : t('simpleModeDescription')}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setAdvancedMode(!advancedMode)}
          className="px-4 py-2 bg-white border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 font-medium transition"
        >
          {advancedMode ? t('switchToSimple') : t('switchToAdvanced')}
        </button>
      </div>

      {/* Airline Selector Toggle */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
        <div>
          <h3 className="font-semibold text-gray-900">
            {useAirline ? '✈️ Aerolínea específica' : '📦 Medidas genéricas'}
          </h3>
          <p className="text-sm text-gray-600">
            {useAirline ? 'Selecciona tu aerolínea para usar sus medidas exactas' : 'Usa medidas genéricas o presets comunes'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setUseAirline(!useAirline)}
          className="px-4 py-2 bg-white border-2 border-green-600 text-green-600 rounded-lg hover:bg-green-50 font-medium transition"
        >
          {useAirline ? '📦 Usar genéricos' : '✈️ Usar aerolínea'}
        </button>
      </div>

      {/* Airline-Specific Fields */}
      {useAirline && (
        <div className="space-y-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <AirlineAutocomplete
            value={selectedAirlineId}
            onChange={(id, name) => {
              setSelectedAirlineId(id);
              setSelectedAirlineName(name);
            }}
            label="Selecciona tu aerolínea"
            placeholder="Buscar aerolínea..."
          />

          {airlineLuggageRules.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Tipo de equipaje 🧳
              </label>
              <div className="grid grid-cols-1 gap-3">
                {airlineLuggageRules.map((rule) => (
                  <button
                    key={rule.id}
                    type="button"
                    onClick={() => handleAirlineLuggageChange(rule.id)}
                    className={`p-4 border-2 rounded-lg text-left transition ${
                      selectedAirlineLuggageType === rule.id
                        ? 'bg-green-600 text-white border-green-600'
                        : 'bg-white text-gray-900 border-gray-300 hover:border-green-400'
                    }`}
                  >
                    <div className="font-medium">
                      {rule.type === 'checked' && '🛄 Maleta facturada'}
                      {rule.type === 'carry-on' && '🧳 Maleta de mano'}
                      {rule.type === 'personal' && '🎒 Artículo personal'}
                    </div>
                    <div className="text-sm mt-1 opacity-90">
                      {rule.dimensions} • {rule.weightKg}kg
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {selectedAirlineId && airlineLuggageRules.length === 0 && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
              ⚠️ No se encontraron reglas de equipaje para esta aerolínea
            </div>
          )}
        </div>
      )}

      {/* Advanced Mode Fields */}
      {advancedMode && (
        <div className="space-y-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <CityAutocomplete
            value={destination}
            onChange={setDestination}
            placeholder={t('destinationPlaceholder')}
            label={t('destination')}
          />

          <DateRangePicker
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            startLabel={t('startDate')}
            endLabel={t('endDate')}
          />

          {startDate && endDate && calculatedDuration > 0 && (
            <div className="p-3 bg-white rounded-lg border border-blue-300">
              <p className="text-sm text-gray-600">
                📊 {t('estimatedDuration')}: <span className="font-bold text-blue-600">{calculatedDuration} {calculatedDuration === 1 ? t('day') : t('days')}</span>
              </p>
              {destination && (
                <p className="text-xs text-gray-500 mt-1">
                  ✨ {t('aiWillEstimateClimate')}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Preset Selector - Only show when NOT using airline */}
      {!useAirline && (
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            {t('preset')} ✈️
          </label>
          <select
            value={preset}
            onChange={(e) => handlePresetChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
          >
            <option value="ryanair-carryon">🧳 Ryanair Carry-on (10kg, 40x20x25cm)</option>
            <option value="standard-carryon">✈️ Standard Carry-on (7kg, 55x40x20cm)</option>
            <option value="copa-carryon">🛫 Copa Airlines Carry-on (10kg, 56x36x26cm)</option>
            <option value="latam-carryon">🛬 LATAM Airlines Carry-on (8kg, 55x35x25cm)</option>
            <option value="checked-20kg">🛄 Checked Baggage 20kg (75x50x30cm)</option>
            <option value="checked-23kg">🛄 Checked Baggage 23kg (80x55x35cm)</option>
            <option value="backpack-small">🎒 Small Backpack (8kg, 45x35x20cm)</option>
            <option value="custom">⚙️ {t('custom')}</option>
          </select>
        </div>
      )}

      {/* Custom Fields */}
      {!useAirline && preset === 'custom' && (
        <div className="grid grid-cols-2 gap-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              {t('customWeight')}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max="50"
                value={weightLimit}
                onChange={(e) => setWeightLimit(parseInt(e.target.value) || 1)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              />
              <span className="text-gray-900 font-medium">kg</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              {t('customDimensions')}
            </label>
            <input
              type="text"
              value={dimensions}
              onChange={(e) => setDimensions(e.target.value)}
              placeholder="55x40x20"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
            />
          </div>
        </div>
      )}

      {/* Simple Mode: Duration Slider */}
      {!advancedMode && (
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            {t('duration')}: <span className="font-bold text-blue-600">{duration} {duration === 1 ? t('day') : t('days')}</span>
          </label>
          <input
            type="range"
            min="1"
            max="30"
            value={duration}
            onChange={(e) => setDuration(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between text-xs text-gray-600 mt-1">
            <span>1 {t('day')}</span>
            <span>30 {t('days')}</span>
          </div>
        </div>
      )}

      {/* Trip Type */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          {t('tripType.label')}
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {(['business', 'leisure', 'adventure', 'beach', 'ski', 'city'] as const).map(type => (
            <button
              key={type}
              type="button"
              onClick={() => setTripType(type)}
              className={`px-4 py-3 border-2 rounded-lg font-medium transition ${
                tripType === type
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-900 border-gray-300 hover:border-blue-400'
              }`}
            >
              {t(`tripType.${type}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Simple Mode: Climate Selector */}
      {!advancedMode && (
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            {t('climate.label')}
          </label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {(['cold', 'mild', 'warm', 'hot', 'mixed'] as const).map(clim => (
              <button
                key={clim}
                type="button"
                onClick={() => setClimate(clim)}
                className={`px-4 py-3 border-2 rounded-lg font-medium transition ${
                  climate === clim
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-900 border-gray-300 hover:border-blue-400'
                }`}
              >
                {t(`climate.${clim}`)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Gender */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          {t('gender.label')}
        </label>
        <div className="grid grid-cols-3 gap-3">
          {(['male', 'female', 'unisex'] as const).map(g => (
            <button
              key={g}
              type="button"
              onClick={() => setGender(g)}
              className={`px-4 py-3 border-2 rounded-lg font-medium transition ${
                gender === g
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-900 border-gray-300 hover:border-blue-400'
              }`}
            >
              {t(`gender.${g}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading || (advancedMode && (!startDate || !endDate))}
        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition shadow-lg hover:shadow-xl"
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <span className="animate-spin mr-2">🔄</span>
            {t('generating')}
          </span>
        ) : (
          <span className="flex items-center justify-center">
            <span className="mr-2">✨</span>
            {t('generate')}
          </span>
        )}
      </button>
    </form>
  );
}

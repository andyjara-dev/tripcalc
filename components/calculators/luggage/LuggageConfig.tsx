'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

type PackingParams = {
  luggageType: 'carry-on' | 'checked' | 'backpack' | 'custom';
  weightLimit: number;
  dimensions?: string;
  duration: number;
  tripType: 'business' | 'leisure' | 'adventure' | 'beach' | 'ski' | 'city';
  climate: 'cold' | 'mild' | 'warm' | 'hot' | 'mixed';
  gender: 'male' | 'female' | 'unisex';
  activities?: string[];
};

type Props = {
  onGenerate: (params: PackingParams) => void;
  loading: boolean;
  locale: string;
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

export default function LuggageConfig({ onGenerate, loading, locale }: Props) {
  const t = useTranslations('luggage.config');

  const [preset, setPreset] = useState('standard-carryon');
  const [luggageType, setLuggageType] = useState<PackingParams['luggageType']>('carry-on');
  const [weightLimit, setWeightLimit] = useState(7);
  const [dimensions, setDimensions] = useState('55x40x20');
  const [duration, setDuration] = useState(5);
  const [tripType, setTripType] = useState<PackingParams['tripType']>('leisure');
  const [climate, setClimate] = useState<PackingParams['climate']>('mild');
  const [gender, setGender] = useState<PackingParams['gender']>('unisex');

  const handlePresetChange = (presetKey: string) => {
    setPreset(presetKey);
    const presetData = LUGGAGE_PRESETS[presetKey as keyof typeof LUGGAGE_PRESETS];
    setLuggageType(presetData.type);
    setWeightLimit(presetData.weight);
    setDimensions(presetData.dimensions);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const params: PackingParams = {
      luggageType,
      weightLimit,
      dimensions,
      duration,
      tripType,
      climate,
      gender,
    };

    onGenerate(params);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Preset Selector */}
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

      {/* Custom Fields - Show only when custom is selected */}
      {preset === 'custom' && (
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

      {/* Weight Limit */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          {t('weightLimit')}: <span className="font-bold text-blue-600">{weightLimit}kg</span>
        </label>
        <input
          type="range"
          min="3"
          max="32"
          value={weightLimit}
          onChange={(e) => setWeightLimit(parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
        <div className="flex justify-between text-xs text-gray-600 mt-1">
          <span>3kg</span>
          <span>32kg</span>
        </div>
      </div>

      {/* Duration */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          {t('duration')}: <span className="font-bold text-blue-600">{duration} {t('days')}</span>
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

      {/* Climate */}
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
        disabled={loading}
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

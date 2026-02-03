# Phase 7 - Premium Luggage Calculator with AI

## Status: PLANNED

## Overview
AI-powered luggage packing calculator that suggests clothing items based on weight/size limits. Premium feature that helps users optimize their packing for carry-on or checked baggage.

## Premium Feature
✅ **Requires Premium Subscription** - Uses AI API (costs money)
✅ Free users see preview with "Upgrade to Premium" prompt
✅ Admin users have automatic access

## User Flow

1. User navigates to Luggage Calculator
2. If not premium: Shows feature preview + upgrade prompt
3. If premium: Shows full calculator
4. User selects:
   - Luggage type (carry-on / checked)
   - Weight limit (kg)
   - Size dimensions (cm)
   - Trip duration (days)
   - Trip type (business, leisure, adventure, beach, etc.)
   - Weather/climate
   - Gender (for clothing suggestions)
5. AI generates packing list with:
   - Specific clothing items
   - Estimated weight per item
   - Total weight
   - Tips for maximizing space
   - Items to avoid

## Features

### 1. Luggage Configuration
- **Type selector:**
  - Carry-on (hand luggage)
  - Checked baggage
  - Backpack
  - Custom

- **Weight limits (common presets):**
  - Ryanair carry-on: 10kg
  - Standard carry-on: 7-10kg
  - Checked baggage: 20-23kg
  - Custom: User-defined

- **Size limits:**
  - Width x Height x Depth (cm)
  - Common presets for airlines
  - Custom dimensions

### 2. Trip Context
- **Duration:** 1-30 days (affects quantity)
- **Type:** Business, Leisure, Adventure, Beach, Ski, City break
- **Climate:** Cold, Mild, Warm, Hot, Mixed
- **Activities:** Formal events, Hiking, Swimming, etc.
- **Gender:** Male, Female, Unisex

### 3. AI Suggestions
- **Clothing items with weights:**
  - T-shirts (150-200g each)
  - Jeans (500-700g)
  - Sweater (300-500g)
  - Jacket (600-1200g)
  - Underwear (50-80g)
  - Socks (50-100g pair)
  - Shoes (400-800g per pair)
  - Etc.

- **Accessories:**
  - Toiletries bag (200-500g)
  - Electronics (phone charger, laptop, etc.)
  - Travel documents

- **Smart recommendations:**
  - "Pack versatile items that can be mixed"
  - "Wear heaviest items during travel"
  - "Use packing cubes to save space"
  - "Roll clothes instead of folding"

### 4. Weight Tracker
- Real-time weight calculation
- Visual progress bar
- Warning if over limit
- Suggestions to reduce weight

### 5. Save & Export
- Save packing list to trip
- Export as PDF checklist
- Share packing list with travel companions

## Technical Architecture

### AI Integration

**Option 1: Anthropic Claude API (Recommended)**
```typescript
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function generatePackingList(params: PackingParams) {
  const message = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 2000,
    messages: [{
      role: 'user',
      content: `Generate a detailed packing list for a ${params.duration}-day ${params.tripType} trip.

Constraints:
- Luggage: ${params.luggageType}
- Weight limit: ${params.weightLimit}kg
- Dimensions: ${params.dimensions}
- Climate: ${params.climate}
- Gender: ${params.gender}

Provide a JSON response with this structure:
{
  "items": [
    {
      "category": "Clothing",
      "name": "T-shirt",
      "quantity": 3,
      "weightPerItem": 150,
      "totalWeight": 450,
      "essential": true
    }
  ],
  "totalWeight": 8500,
  "tips": ["Tip 1", "Tip 2"],
  "warnings": ["Warning if applicable"]
}

Important:
- Stay under ${params.weightLimit}kg total
- Be realistic about space
- Prioritize versatile items
- Include toiletries and accessories
- Consider the climate and activities`,
    }],
  });

  return JSON.parse(message.content[0].text);
}
```

**Option 2: OpenAI GPT-4**
```typescript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function generatePackingList(params: PackingParams) {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      {
        role: 'system',
        content: 'You are a travel packing expert. Generate optimized packing lists based on luggage constraints.',
      },
      {
        role: 'user',
        content: `...same prompt as above...`,
      },
    ],
    response_format: { type: 'json_object' },
  });

  return JSON.parse(completion.choices[0].message.content);
}
```

### Data Models

**Prisma Schema Addition:**

```prisma
model PackingList {
  id        String   @id @default(cuid())
  userId    String
  tripId    String?  // Optional: link to a trip

  // Configuration
  luggageType   String   // "carry-on", "checked", "backpack"
  weightLimit   Int      // in grams
  dimensions    String   // "55x40x20"
  duration      Int      // days
  tripType      String   // "business", "leisure", etc.
  climate       String   // "cold", "warm", etc.
  gender        String   // "male", "female", "unisex"

  // AI Response
  items         Json     // Array of items with weights
  totalWeight   Int      // Total weight in grams
  tips          Json     // Array of tips
  warnings      Json?    // Array of warnings

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  trip Trip? @relation(fields: [tripId], references: [id], onDelete: SetNull)

  @@index([userId])
  @@index([tripId])
}
```

**TypeScript Interfaces:**

```typescript
export interface PackingParams {
  luggageType: 'carry-on' | 'checked' | 'backpack' | 'custom';
  weightLimit: number; // kg
  dimensions: string; // "55x40x20"
  duration: number; // days
  tripType: 'business' | 'leisure' | 'adventure' | 'beach' | 'ski' | 'city';
  climate: 'cold' | 'mild' | 'warm' | 'hot' | 'mixed';
  gender: 'male' | 'female' | 'unisex';
  activities?: string[];
}

export interface PackingItem {
  category: string; // "Clothing", "Accessories", "Toiletries", "Electronics"
  name: string;
  quantity: number;
  weightPerItem: number; // grams
  totalWeight: number; // grams
  essential: boolean;
  notes?: string;
}

export interface PackingListResponse {
  items: PackingItem[];
  totalWeight: number; // grams
  remainingWeight: number; // grams
  tips: string[];
  warnings?: string[];
}
```

## File Structure

```
/app/[locale]/calculators/luggage/
├── page.tsx                    # Main luggage calculator page
└── loading.tsx                 # Loading state

/components/calculators/luggage/
├── LuggageCalculator.tsx       # Main calculator component
├── LuggageConfig.tsx           # Configuration form
├── PackingList.tsx             # AI-generated list display
├── WeightTracker.tsx           # Visual weight progress
├── PackingItem.tsx             # Individual item with checkbox
├── PremiumGate.tsx             # Paywall for non-premium users
└── ExportPackingList.tsx       # Export to PDF

/app/api/luggage/
├── generate/route.ts           # POST: Generate packing list with AI
├── save/route.ts               # POST: Save packing list
└── [id]/route.ts               # GET/DELETE: Retrieve/delete list

/lib/ai/
├── packing-assistant.ts        # AI packing logic
└── prompts/luggage.ts          # Prompt templates
```

## Implementation Tasks

### 1. Create Luggage Calculator Page
**File:** `/app/[locale]/calculators/luggage/page.tsx`

```typescript
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Header from '@/components/Header';
import LuggageCalculator from '@/components/calculators/luggage/LuggageCalculator';
import PremiumGate from '@/components/calculators/luggage/PremiumGate';
import { isPremiumUser } from '@/lib/auth-helpers';

export default async function LuggageCalculatorPage() {
  const session = await auth();
  const hasPremium = await isPremiumUser(session);

  if (!hasPremium) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header ... />
        <PremiumGate />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header ... />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">
            {t('title')}
            <span className="ml-2 text-sm bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full">
              👑 Premium
            </span>
          </h1>
          <p className="text-gray-600 mb-8">{t('description')}</p>

          <LuggageCalculator />
        </div>
      </main>
    </div>
  );
}
```

### 2. Premium Gate Component
**File:** `/components/calculators/luggage/PremiumGate.tsx`

```typescript
'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';

export default function PremiumGate() {
  const t = useTranslations('luggage.premium');

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        {/* Feature Preview */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">🧳</div>
            <h1 className="text-3xl font-bold mb-2">{t('title')}</h1>
            <p className="text-gray-600">{t('subtitle')}</p>
          </div>

          {/* Preview Screenshot/Demo */}
          <div className="bg-gray-100 rounded-lg p-6 mb-6 relative">
            <div className="blur-sm">
              {/* Blurred preview of calculator */}
              <div className="space-y-4">
                <div className="h-12 bg-gray-200 rounded"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
                <div className="h-24 bg-gray-200 rounded"></div>
              </div>
            </div>

            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-white rounded-lg shadow-xl p-8 text-center max-w-md">
                <div className="text-5xl mb-4">👑</div>
                <h2 className="text-2xl font-bold mb-2">{t('upgradeTitle')}</h2>
                <p className="text-gray-600 mb-6">{t('upgradeDescription')}</p>

                <Link
                  href="/premium"
                  className="inline-block bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition"
                >
                  {t('upgradeButton')}
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Feature List */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold mb-4">{t('features.title')}</h3>
          <ul className="space-y-3">
            {['aiSuggestions', 'weightCalculation', 'customLimits', 'saveExport'].map(key => (
              <li key={key} className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>{t(`features.${key}`)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}
```

### 3. Main Calculator Component
**File:** `/components/calculators/luggage/LuggageCalculator.tsx`

```typescript
'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import LuggageConfig from './LuggageConfig';
import PackingList from './PackingList';
import WeightTracker from './WeightTracker';
import type { PackingParams, PackingListResponse } from '@/types/luggage';

export default function LuggageCalculator() {
  const t = useTranslations('luggage');
  const [loading, setLoading] = useState(false);
  const [packingList, setPackingList] = useState<PackingListResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (params: PackingParams) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/luggage/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to generate packing list');
      }

      const data = await response.json();
      setPackingList(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Configuration Form */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">{t('config.title')}</h2>
        <LuggageConfig onGenerate={handleGenerate} loading={loading} />
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="animate-spin text-4xl mb-4">🧳</div>
          <p className="text-gray-600">{t('generating')}</p>
          <p className="text-sm text-gray-500 mt-2">{t('aiThinking')}</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Results */}
      {packingList && !loading && (
        <>
          <WeightTracker
            totalWeight={packingList.totalWeight}
            weightLimit={packingList.totalWeight + packingList.remainingWeight}
          />

          <PackingList data={packingList} />
        </>
      )}
    </div>
  );
}
```

### 4. Configuration Form
**File:** `/components/calculators/luggage/LuggageConfig.tsx`

```typescript
'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { PackingParams } from '@/types/luggage';

const LUGGAGE_PRESETS = {
  'ryanair-carryon': { type: 'carry-on', weight: 10, dimensions: '40x20x25' },
  'standard-carryon': { type: 'carry-on', weight: 7, dimensions: '55x40x20' },
  'checked-20kg': { type: 'checked', weight: 20, dimensions: '75x50x30' },
  'checked-23kg': { type: 'checked', weight: 23, dimensions: '80x55x35' },
};

export default function LuggageConfig({ onGenerate, loading }) {
  const t = useTranslations('luggage.config');

  const [preset, setPreset] = useState('standard-carryon');
  const [luggageType, setLuggageType] = useState('carry-on');
  const [weightLimit, setWeightLimit] = useState(7);
  const [dimensions, setDimensions] = useState('55x40x20');
  const [duration, setDuration] = useState(5);
  const [tripType, setTripType] = useState('leisure');
  const [climate, setClimate] = useState('mild');
  const [gender, setGender] = useState('unisex');

  const handlePresetChange = (presetKey: string) => {
    setPreset(presetKey);
    const presetData = LUGGAGE_PRESETS[presetKey];
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
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('preset')}
        </label>
        <select
          value={preset}
          onChange={(e) => handlePresetChange(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="ryanair-carryon">Ryanair Carry-on (10kg)</option>
          <option value="standard-carryon">Standard Carry-on (7kg)</option>
          <option value="checked-20kg">Checked Baggage (20kg)</option>
          <option value="checked-23kg">Checked Baggage (23kg)</option>
        </select>
      </div>

      {/* Weight Limit */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('weightLimit')}: {weightLimit}kg
        </label>
        <input
          type="range"
          min="5"
          max="32"
          value={weightLimit}
          onChange={(e) => setWeightLimit(parseInt(e.target.value))}
          className="w-full"
        />
      </div>

      {/* Duration */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('duration')}: {duration} {t('days')}
        </label>
        <input
          type="range"
          min="1"
          max="30"
          value={duration}
          onChange={(e) => setDuration(parseInt(e.target.value))}
          className="w-full"
        />
      </div>

      {/* Trip Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('tripType.label')}
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {['business', 'leisure', 'adventure', 'beach', 'ski', 'city'].map(type => (
            <button
              key={type}
              type="button"
              onClick={() => setTripType(type)}
              className={`px-4 py-2 border rounded-lg ${
                tripType === type
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-blue-500'
              }`}
            >
              {t(`tripType.${type}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Climate */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('climate.label')}
        </label>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {['cold', 'mild', 'warm', 'hot', 'mixed'].map(clim => (
            <button
              key={clim}
              type="button"
              onClick={() => setClimate(clim)}
              className={`px-4 py-2 border rounded-lg ${
                climate === clim
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-blue-500'
              }`}
            >
              {t(`climate.${clim}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Gender */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('gender.label')}
        </label>
        <div className="grid grid-cols-3 gap-3">
          {['male', 'female', 'unisex'].map(g => (
            <button
              key={g}
              type="button"
              onClick={() => setGender(g)}
              className={`px-4 py-2 border rounded-lg ${
                gender === g
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-blue-500'
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
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {loading ? t('generating') : t('generate')}
      </button>
    </form>
  );
}
```

### 5. API Route for AI Generation
**File:** `/app/api/luggage/generate/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, isPremiumUser } from '@/lib/auth-helpers';
import { generatePackingList } from '@/lib/ai/packing-assistant';
import { z } from 'zod';

const packingParamsSchema = z.object({
  luggageType: z.enum(['carry-on', 'checked', 'backpack', 'custom']),
  weightLimit: z.number().min(1).max(50),
  dimensions: z.string(),
  duration: z.number().min(1).max(30),
  tripType: z.enum(['business', 'leisure', 'adventure', 'beach', 'ski', 'city']),
  climate: z.enum(['cold', 'mild', 'warm', 'hot', 'mixed']),
  gender: z.enum(['male', 'female', 'unisex']),
});

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();

    // Check premium status
    const hasPremium = await isPremiumUser(session);
    if (!hasPremium) {
      return NextResponse.json(
        { error: 'Premium subscription required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = packingParamsSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid parameters', details: validation.error },
        { status: 400 }
      );
    }

    // Generate packing list with AI
    const packingList = await generatePackingList(validation.data);

    return NextResponse.json(packingList);
  } catch (error) {
    console.error('Error generating packing list:', error);
    return NextResponse.json(
      { error: 'Failed to generate packing list' },
      { status: 500 }
    );
  }
}
```

### 6. AI Packing Assistant
**File:** `/lib/ai/packing-assistant.ts`

```typescript
import Anthropic from '@anthropic-ai/sdk';
import type { PackingParams, PackingListResponse } from '@/types/luggage';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function generatePackingList(params: PackingParams): Promise<PackingListResponse> {
  const prompt = `You are a professional travel packing expert. Generate a detailed, realistic packing list for the following trip:

**Luggage Constraints:**
- Type: ${params.luggageType}
- Weight limit: ${params.weightLimit}kg (${params.weightLimit * 1000}g total)
- Dimensions: ${params.dimensions}cm

**Trip Details:**
- Duration: ${params.duration} days
- Type: ${params.tripType}
- Climate: ${params.climate}
- Gender: ${params.gender}

**Instructions:**
1. Suggest specific clothing items with realistic weights in grams
2. Include all categories: clothing, shoes, accessories, toiletries, electronics
3. Stay under the ${params.weightLimit}kg weight limit (leave some buffer)
4. Consider the trip duration for quantity (e.g., underwear for each day)
5. Optimize for versatile items that can be mixed and matched
6. Include practical packing tips
7. Add warnings if the weight is tight

**Weight Reference Guide:**
- T-shirt: 150-200g
- Long sleeve shirt: 200-300g
- Jeans: 500-700g
- Shorts: 200-300g
- Sweater: 300-500g
- Light jacket: 400-600g
- Winter coat: 800-1200g
- Underwear: 50-80g each
- Socks: 50-100g per pair
- Sneakers: 400-600g per shoe
- Boots: 600-900g per shoe
- Toiletries bag: 300-500g
- Towel (microfiber): 150-250g

Respond ONLY with valid JSON in this exact format:
{
  "items": [
    {
      "category": "Clothing",
      "name": "T-shirt",
      "quantity": 3,
      "weightPerItem": 150,
      "totalWeight": 450,
      "essential": true,
      "notes": "Optional note"
    }
  ],
  "totalWeight": 8500,
  "remainingWeight": 1500,
  "tips": [
    "Wear your heaviest items during travel",
    "Use packing cubes to maximize space"
  ],
  "warnings": []
}`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4000,
      temperature: 0.7,
      messages: [{
        role: 'user',
        content: prompt,
      }],
    });

    const responseText = message.content[0].type === 'text'
      ? message.content[0].text
      : '';

    // Parse JSON response
    const packingList = JSON.parse(responseText);

    // Validate response structure
    if (!packingList.items || !Array.isArray(packingList.items)) {
      throw new Error('Invalid AI response structure');
    }

    return packingList as PackingListResponse;
  } catch (error) {
    console.error('AI generation error:', error);
    throw new Error('Failed to generate packing list with AI');
  }
}
```

## Cost Estimates

### AI API Costs (Anthropic Claude)
- Model: claude-3-5-sonnet-20241022
- Input: ~500 tokens per request
- Output: ~2000 tokens per response
- Cost: ~$0.015 per generation (3¢ + 15¢)
- Monthly (100 users, 2 generations each): ~$3.00

### OpenAI Alternative
- Model: gpt-4-turbo-preview
- Similar cost: ~$0.02-0.03 per generation

**Recommendation:** Anthropic Claude (better at structured outputs, JSON mode)

## Pricing Strategy

### Premium Tier
- $4.99/month or $49.99/year
- Includes:
  - Luggage calculator (unlimited)
  - AI trip planning (coming soon)
  - Advanced expense tracking
  - Priority support

### Free Tier Preview
- Show feature description
- Demo with blurred results
- Clear "Upgrade to Premium" CTA

## Translations

### messages/en.json

```json
{
  "luggage": {
    "title": "Luggage Calculator",
    "description": "AI-powered packing assistant to optimize your luggage",
    "generating": "Generating your packing list...",
    "aiThinking": "AI is analyzing your trip requirements",
    "config": {
      "title": "Configure Your Luggage",
      "preset": "Airline Preset",
      "weightLimit": "Weight Limit",
      "duration": "Trip Duration",
      "days": "days",
      "tripType": {
        "label": "Trip Type",
        "business": "Business",
        "leisure": "Leisure",
        "adventure": "Adventure",
        "beach": "Beach",
        "ski": "Ski",
        "city": "City Break"
      },
      "climate": {
        "label": "Climate",
        "cold": "Cold",
        "mild": "Mild",
        "warm": "Warm",
        "hot": "Hot",
        "mixed": "Mixed"
      },
      "gender": {
        "label": "Clothing Style",
        "male": "Male",
        "female": "Female",
        "unisex": "Unisex"
      },
      "generate": "Generate Packing List"
    },
    "premium": {
      "title": "Smart Luggage Calculator",
      "subtitle": "AI-powered packing suggestions",
      "upgradeTitle": "Premium Feature",
      "upgradeDescription": "Get personalized packing lists with weight optimization",
      "upgradeButton": "Upgrade to Premium",
      "features": {
        "title": "Premium Features",
        "aiSuggestions": "AI-powered clothing suggestions",
        "weightCalculation": "Accurate weight calculations",
        "customLimits": "Custom airline weight limits",
        "saveExport": "Save and export packing lists"
      }
    }
  }
}
```

### messages/es.json

```json
{
  "luggage": {
    "title": "Calculadora de Equipaje",
    "description": "Asistente inteligente para optimizar tu equipaje",
    "generating": "Generando tu lista de empaque...",
    "aiThinking": "La IA está analizando los requisitos de tu viaje",
    "config": {
      "title": "Configura Tu Equipaje",
      "preset": "Preset de Aerolínea",
      "weightLimit": "Límite de Peso",
      "duration": "Duración del Viaje",
      "days": "días",
      "tripType": {
        "label": "Tipo de Viaje",
        "business": "Negocios",
        "leisure": "Ocio",
        "adventure": "Aventura",
        "beach": "Playa",
        "ski": "Esquí",
        "city": "Ciudad"
      },
      "climate": {
        "label": "Clima",
        "cold": "Frío",
        "mild": "Templado",
        "warm": "Cálido",
        "hot": "Caluroso",
        "mixed": "Mixto"
      },
      "gender": {
        "label": "Estilo de Ropa",
        "male": "Hombre",
        "female": "Mujer",
        "unisex": "Unisex"
      },
      "generate": "Generar Lista de Empaque"
    },
    "premium": {
      "title": "Calculadora Inteligente de Equipaje",
      "subtitle": "Sugerencias de empaque con IA",
      "upgradeTitle": "Función Premium",
      "upgradeDescription": "Obtén listas de empaque personalizadas con optimización de peso",
      "upgradeButton": "Actualizar a Premium",
      "features": {
        "title": "Funciones Premium",
        "aiSuggestions": "Sugerencias de ropa con IA",
        "weightCalculation": "Cálculos precisos de peso",
        "customLimits": "Límites personalizados de aerolíneas",
        "saveExport": "Guardar y exportar listas"
      }
    }
  }
}
```

## Implementation Timeline

### Week 1: Foundation (20 hours)
- [ ] Add PackingList model to Prisma schema
- [ ] Create luggage calculator page routes
- [ ] Build PremiumGate component
- [ ] Set up AI integration (Anthropic/OpenAI)
- [ ] Create basic configuration form

### Week 2: AI Integration (15 hours)
- [ ] Implement generatePackingList function
- [ ] Create API routes (/api/luggage/generate)
- [ ] Test AI prompts and refine outputs
- [ ] Handle error cases and retries
- [ ] Add loading states

### Week 3: UI Components (15 hours)
- [ ] Build PackingList display component
- [ ] Create WeightTracker visualization
- [ ] Add PackingItem checkboxes
- [ ] Implement save/export functionality
- [ ] Mobile responsive design

### Week 4: Polish & Testing (10 hours)
- [ ] Add all translations (EN/ES)
- [ ] Test with various trip configurations
- [ ] Verify weight calculations
- [ ] User testing and feedback
- [ ] Performance optimization

**Total: ~60 hours (~2 weeks full-time)**

## Success Metrics

- **Accuracy:** AI suggestions stay under weight limit 95%+ of the time
- **Adoption:** 30%+ of premium users try luggage calculator
- **Satisfaction:** 4.5+ star rating from users
- **Cost:** <$10/month in AI API costs initially

## Future Enhancements

- [ ] Visual packing guide (how to arrange items)
- [ ] Packing checklist with item images
- [ ] Integration with trip planner
- [ ] Collaborative packing lists (families)
- [ ] Packing history and favorites
- [ ] Laundry planning for long trips
- [ ] Carry-on only challenge mode

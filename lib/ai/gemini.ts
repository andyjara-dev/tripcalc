/**
 * Google Gemini AI Integration
 * Free tier: 60 requests/min, 1500 requests/day
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export type PackingParams = {
  luggageType: 'carry-on' | 'checked' | 'backpack' | 'custom';
  weightLimit: number; // kg
  dimensions?: string; // "55x40x20"
  duration: number; // days
  tripType: 'business' | 'leisure' | 'adventure' | 'beach' | 'ski' | 'city';
  climate: 'cold' | 'mild' | 'warm' | 'hot' | 'mixed';
  gender: 'male' | 'female' | 'unisex';
  activities?: string[];
};

export type PackingItem = {
  category: string; // "Clothing", "Accessories", "Toiletries", "Electronics"
  name: string;
  quantity: number;
  weightPerItem: number; // grams
  totalWeight: number; // grams
  essential: boolean;
  notes?: string;
};

export type PackingListResponse = {
  items: PackingItem[];
  totalWeight: number; // grams
  remainingWeight: number; // grams
  tips: string[];
  warnings: string[];
};

/**
 * Generate packing list using Gemini AI
 */
export async function generatePackingList(
  params: PackingParams
): Promise<PackingListResponse> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 2048,
    },
  });

  const prompt = buildPackingPrompt(params);

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in AI response');
    }

    const packingList = JSON.parse(jsonMatch[0]) as PackingListResponse;

    // Validate response
    if (!packingList.items || !Array.isArray(packingList.items)) {
      throw new Error('Invalid packing list structure');
    }

    return packingList;
  } catch (error) {
    console.error('Gemini AI error:', error);
    throw new Error('Failed to generate packing list with AI');
  }
}

/**
 * Build optimized prompt for packing list generation
 */
function buildPackingPrompt(params: PackingParams): string {
  const weightLimitGrams = params.weightLimit * 1000;
  const activitiesText = params.activities?.length
    ? `\n- Activities: ${params.activities.join(', ')}`
    : '';

  return `You are a professional travel packing expert. Generate a detailed, realistic packing list for the following trip:

**Luggage Constraints:**
- Type: ${params.luggageType}
- Weight limit: ${params.weightLimit}kg (${weightLimitGrams}g total)
${params.dimensions ? `- Dimensions: ${params.dimensions}cm` : ''}

**Trip Details:**
- Duration: ${params.duration} days
- Type: ${params.tripType}
- Climate: ${params.climate}
- Gender preference: ${params.gender}${activitiesText}

**Instructions:**
1. Suggest specific clothing items with realistic weights in grams
2. Include all categories: clothing, shoes, accessories, toiletries, electronics
3. Stay UNDER the ${params.weightLimit}kg weight limit (leave at least 500g buffer)
4. Consider the trip duration for quantity (e.g., ${Math.ceil(params.duration / 2)} underwear for ${params.duration} days if doing laundry)
5. Optimize for versatile items that can be mixed and matched
6. Include practical packing tips specific to this trip
7. Add warnings if space/weight is tight

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
- Toiletries bag (travel size): 200-400g
- Microfiber towel: 150-250g
- Laptop: 1200-2000g
- Phone charger: 100-150g

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
      "notes": "Quick-dry fabric recommended"
    }
  ],
  "totalWeight": ${Math.round(weightLimitGrams * 0.9)},
  "remainingWeight": ${Math.round(weightLimitGrams * 0.1)},
  "tips": [
    "Wear your heaviest items during travel",
    "Use packing cubes to maximize space",
    "Roll clothes instead of folding to save space"
  ],
  "warnings": []
}

IMPORTANT:
- totalWeight must be LESS than ${weightLimitGrams}g
- Be realistic about quantities for ${params.duration} days
- Consider ${params.climate} climate for clothing choices
- Prioritize essential items if space is limited`;
}

/**
 * Validate Gemini API key
 */
export function isGeminiConfigured(): boolean {
  return !!process.env.GEMINI_API_KEY;
}

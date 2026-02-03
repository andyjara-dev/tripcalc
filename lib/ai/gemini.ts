/**
 * Google Gemini AI Integration
 * Free tier: 60 requests/min, 1500 requests/day
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { nanoid } from 'nanoid';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export type PackingParams = {
  luggageType: 'carry-on' | 'checked' | 'backpack' | 'custom';
  weightLimit: number; // kg
  dimensions?: string; // "55x40x20"
  duration: number; // days
  tripType: 'business' | 'leisure' | 'adventure' | 'beach' | 'ski' | 'city';
  climate?: 'cold' | 'mild' | 'warm' | 'hot' | 'mixed'; // Optional in advanced mode
  gender: 'male' | 'female' | 'unisex';
  activities?: string[];
  locale?: 'en' | 'es';
  // Advanced mode fields
  destination?: string; // "Santiago, Chile"
  startDate?: string; // "2026-02-15"
  endDate?: string; // "2026-02-22"
};

export type PackingItem = {
  id: string; // Unique identifier (nanoid)
  category: string; // "Clothing", "Accessories", "Toiletries", "Electronics"
  name: string;
  quantity: number;
  weightPerItem: number; // grams
  totalWeight: number; // grams
  essential: boolean;
  notes?: string;
  source: 'ai' | 'manual'; // Origin tracking
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
    model: 'gemini-2.5-flash',
    generationConfig: {
      temperature: 0.7,
      topK: 64,
      topP: 0.95,
      maxOutputTokens: 16384,
      responseMimeType: 'application/json',
    },
  });

  const prompt = buildPackingPrompt(params);

  try {
    console.log('🔵 Sending prompt to Gemini:', prompt.substring(0, 200) + '...');

    // Add timeout to prevent zombie processes
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Gemini API timeout (30s)')), 30000)
    );

    const result = await Promise.race([
      model.generateContent(prompt),
      timeoutPromise
    ]) as any;

    const response = await result.response;
    const text = response.text();

    console.log('🟢 Gemini raw response:', text);
    console.log('🟢 Response length:', text.length);

    // Since we set responseMimeType to 'application/json', response should already be JSON
    let packingList: PackingListResponse;

    try {
      packingList = JSON.parse(text) as PackingListResponse;
    } catch (parseError) {
      console.error('❌ JSON parse error:', parseError);
      console.error('❌ Raw text:', text);
      throw new Error('No JSON found in AI response');
    }

    // Validate response
    if (!packingList.items || !Array.isArray(packingList.items)) {
      console.error('❌ Invalid structure:', packingList);
      throw new Error('Invalid packing list structure');
    }

    // Post-process items to ensure they have id and source fields
    packingList.items = packingList.items.map((item) => ({
      ...item,
      id: nanoid(), // Always generate new ID
      source: 'ai' as const, // Mark as AI-generated
    }));

    console.log('✅ Successfully parsed packing list with', packingList.items.length, 'items');
    return packingList;
  } catch (error) {
    console.error('❌ Gemini AI error:', error);
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

  const language = params.locale === 'es' ? 'Spanish' : 'English';
  const languageInstruction = params.locale === 'es'
    ? 'IMPORTANTE: Toda la respuesta debe estar en ESPAÑOL. Los nombres de items, notas, consejos y advertencias deben estar en español.'
    : 'IMPORTANT: All responses must be in ENGLISH. Item names, notes, tips, and warnings must be in English.';

  // Determine if using advanced mode (destination + dates)
  const isAdvancedMode = params.destination && params.startDate && params.endDate;

  let tripContextText = '';
  if (isAdvancedMode) {
    // Advanced mode: AI estimates climate based on destination + dates
    tripContextText = `
**DESTINATION & DATES:**
- Destination: ${params.destination}
- Travel dates: ${params.startDate} to ${params.endDate}
- Duration: ${params.duration} days
- Trip type: ${params.tripType}

CRITICAL: Based on the destination "${params.destination}" and travel dates (${params.startDate} to ${params.endDate}):
1. Estimate the expected weather and climate conditions for this specific location and time of year
2. Consider seasonal variations, typical temperature ranges, and weather patterns
3. Adjust clothing and gear recommendations accordingly
4. Mention the estimated climate in your packing tips
    `;
  } else {
    // Simple mode: User provides climate manually
    tripContextText = `
**TRIP DETAILS:**
- Duration: ${params.duration} days
- Type: ${params.tripType}
- Climate: ${params.climate}${activitiesText}
    `;
  }

  return `You are a professional travel packing expert. Generate a detailed, realistic packing list for the following trip.

**LANGUAGE: ${language}**
${languageInstruction}

${tripContextText}

**Luggage Constraints:**
- Type: ${params.luggageType}
- Weight limit: ${params.weightLimit}kg (${weightLimitGrams}g total)
${params.dimensions ? `- Dimensions: ${params.dimensions}cm` : ''}
- Gender preference: ${params.gender}

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

Respond ONLY with valid JSON in this exact format (remember to use ${language}):
{
  "items": [
    {
      "category": "${params.locale === 'es' ? 'Ropa' : 'Clothing'}",
      "name": "${params.locale === 'es' ? 'Camiseta' : 'T-shirt'}",
      "quantity": 3,
      "weightPerItem": 150,
      "totalWeight": 450,
      "essential": true,
      "notes": "${params.locale === 'es' ? 'Se recomienda tela de secado rápido' : 'Quick-dry fabric recommended'}"
    }
  ],
  "totalWeight": ${Math.round(weightLimitGrams * 0.9)},
  "remainingWeight": ${Math.round(weightLimitGrams * 0.1)},
  "tips": [
    "${params.locale === 'es' ? 'Usa tus artículos más pesados durante el viaje' : 'Wear your heaviest items during travel'}",
    "${params.locale === 'es' ? 'Usa cubos organizadores para maximizar el espacio' : 'Use packing cubes to maximize space'}",
    "${params.locale === 'es' ? 'Enrolla la ropa en lugar de doblarla para ahorrar espacio' : 'Roll clothes instead of folding to save space'}"
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

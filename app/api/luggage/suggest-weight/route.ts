import { NextRequest, NextResponse } from 'next/server';
import { searchItemWeight } from '@/lib/data/weight-database';
import { isValidWeight } from '@/lib/utils/packing-helpers';
import type { WeightSuggestion } from '@/lib/types/packing';
import { GoogleGenerativeAI } from '@google/generative-ai';

// In-memory cache for AI suggestions (7-day expiration)
const suggestionCache = new Map<string, { suggestion: WeightSuggestion; expiresAt: number }>();
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

// Initialize Gemini AI
const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

/**
 * POST /api/luggage/suggest-weight
 * Suggests weight for a packing item using static DB or AI
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { itemName, category, locale = 'en' } = body;

    // Validate input
    if (!itemName || typeof itemName !== 'string') {
      return NextResponse.json(
        { error: 'Item name is required' },
        { status: 400 }
      );
    }

    const trimmedName = itemName.trim();
    if (trimmedName.length === 0) {
      return NextResponse.json(
        { error: 'Item name cannot be empty' },
        { status: 400 }
      );
    }

    // Step 1: Try static database first
    const dbResult = searchItemWeight(trimmedName, locale);
    if (dbResult) {
      const suggestion: WeightSuggestion = {
        weight: dbResult.weight,
        confidence: 'high',
        source: 'database',
        notes: dbResult.notes,
      };
      return NextResponse.json(suggestion);
    }

    // Step 2: Check cache
    const cacheKey = `${trimmedName.toLowerCase()}-${locale}`;
    const cached = suggestionCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return NextResponse.json({
        ...cached.suggestion,
        source: 'cache',
      });
    }

    // Step 3: Use AI to suggest weight
    if (!genAI) {
      return NextResponse.json(
        { error: 'AI weight suggestion is not available' },
        { status: 503 }
      );
    }

    const aiSuggestion = await suggestWeightWithAI(trimmedName, category, locale);

    // Cache the result
    suggestionCache.set(cacheKey, {
      suggestion: aiSuggestion,
      expiresAt: Date.now() + CACHE_DURATION,
    });

    // Clean up expired cache entries (simple cleanup)
    cleanupCache();

    return NextResponse.json(aiSuggestion);
  } catch (error) {
    console.error('Error suggesting weight:', error);
    return NextResponse.json(
      { error: 'Failed to suggest weight' },
      { status: 500 }
    );
  }
}

/**
 * Suggests weight using Gemini AI
 */
async function suggestWeightWithAI(
  itemName: string,
  category?: string,
  locale: string = 'en'
): Promise<WeightSuggestion> {
  if (!genAI) {
    throw new Error('Gemini AI is not configured');
  }

  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 256,
      responseMimeType: 'application/json',
    },
  });

  const item = category ? `${itemName} (${category})` : itemName;
  const prompt = `Return the travel weight in grams for: "${item}". Use travel/compact size for toiletries. Respond with this JSON only: {"weight":<grams>,"confidence":"high"|"medium"|"low","notes":"<10 words max>"}`;

  // Add timeout to prevent zombie processes (30s for weight suggestions)
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Gemini API timeout (30s)')), 30000)
  );

  const result = await Promise.race([
    model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    }),
    timeoutPromise
  ]) as any;

  const response = result.response;
  const text = response.text();

  // Parse AI response
  try {
    // Extract JSON from response (handle potential markdown formatting)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in AI response');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Validate response
    if (typeof parsed.weight !== 'number' || !isValidWeight(parsed.weight)) {
      throw new Error('Invalid weight in AI response');
    }

    const validConfidences = ['high', 'medium', 'low'];
    if (!validConfidences.includes(parsed.confidence)) {
      parsed.confidence = 'medium'; // Default to medium
    }

    return {
      weight: Math.round(parsed.weight),
      confidence: parsed.confidence,
      source: 'ai',
      notes: parsed.notes,
    };
  } catch (parseError) {
    console.error('Failed to parse AI response:', text, parseError);
    throw new Error('Invalid AI response format');
  }
}

/**
 * Cleans up expired cache entries
 */
function cleanupCache() {
  const now = Date.now();
  const keysToDelete: string[] = [];

  suggestionCache.forEach((value, key) => {
    if (value.expiresAt <= now) {
      keysToDelete.push(key);
    }
  });

  keysToDelete.forEach((key) => suggestionCache.delete(key));
}

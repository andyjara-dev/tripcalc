import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { generatePackingList, isGeminiConfigured } from '@/lib/ai/gemini';
import { z } from 'zod';

const packingParamsSchema = z.object({
  luggageType: z.enum(['carry-on', 'checked', 'backpack', 'custom']),
  weightLimit: z.number().min(1).max(50),
  dimensions: z.string().optional(),
  duration: z.number().min(1).max(30),
  tripType: z.enum(['business', 'leisure', 'adventure', 'beach', 'ski', 'city']),
  climate: z.enum(['cold', 'mild', 'warm', 'hot', 'mixed']).optional(), // Optional in advanced mode
  gender: z.enum(['male', 'female', 'unisex']),
  activities: z.array(z.string()).optional(),
  locale: z.enum(['en', 'es']).default('en'),
  // Advanced mode fields
  destination: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is premium or admin
    // @ts-ignore
    const isPremium = session.user.isPremium || session.user.isAdmin;

    if (!isPremium) {
      return NextResponse.json(
        {
          error: 'Premium subscription required',
          message: 'Luggage calculator is a premium feature. Upgrade to access AI-powered packing suggestions.',
        },
        { status: 403 }
      );
    }

    // Check if Gemini is configured
    if (!isGeminiConfigured()) {
      return NextResponse.json(
        { error: 'AI service not configured. Please contact administrator.' },
        { status: 503 }
      );
    }

    const body = await request.json();
    console.log('🔵 Received request body:', JSON.stringify(body, null, 2));

    const validation = packingParamsSchema.safeParse(body);

    if (!validation.success) {
      console.error('❌ Validation failed:', validation.error);
      return NextResponse.json(
        { error: 'Invalid parameters', details: validation.error },
        { status: 400 }
      );
    }

    console.log('✅ Validated params:', JSON.stringify(validation.data, null, 2));

    // Generate packing list with AI
    const packingList = await generatePackingList(validation.data);

    return NextResponse.json(packingList);
  } catch (error) {
    console.error('Error generating packing list:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate packing list',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Admin API: Publish/Unpublish City
 * POST /api/admin/cities/[cityId]/publish - Toggle publish status
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-helpers';
import { prisma } from '@/lib/db';
import { publishCitySchema } from '@/lib/validations/city';

type Params = {
  params: Promise<{
    cityId: string;
  }>;
};

/**
 * POST /api/admin/cities/[cityId]/publish
 * Toggle or set publish status
 */
export async function POST(request: NextRequest, { params }: Params) {
  try {
    await requireAdmin();

    const { cityId } = await params;
    const body = await request.json();

    // Validate input
    const validation = publishCitySchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { isPublished } = validation.data;

    // Check if city exists
    const existing = await prisma.city.findUnique({
      where: { id: cityId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'City not found' }, { status: 404 });
    }

    // Update publish status
    const city = await prisma.city.update({
      where: { id: cityId },
      data: { isPublished },
    });

    return NextResponse.json({
      city,
      message: isPublished ? 'City published successfully' : 'City unpublished successfully',
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    console.error('Error updating publish status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { getTranslations } from 'next-intl/server';

const shareSchema = z.object({
  email: z.string().email(),
  message: z.string().optional(),
  locale: z.string().optional().default('en'),
});

// Send notification email to the shared user
async function sendShareNotificationEmail({
  recipientEmail,
  senderName,
  tripName,
  tripId,
  cityName,
  days,
  tripStyle,
  message,
  locale,
  baseUrl,
}: {
  recipientEmail: string;
  senderName: string;
  tripName: string;
  tripId: string;
  cityName: string;
  days: number;
  tripStyle: string;
  message?: string;
  locale: string;
  baseUrl: string;
}) {
  // Only send if Resend is configured
  if (!process.env.RESEND_API_KEY) {
    console.log('RESEND_API_KEY not configured, skipping email notification');
    return;
  }

  try {
    const { Resend } = await import('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);
    const t = await getTranslations({ locale, namespace: 'email.shareTripUser' });
    const tTrip = await getTranslations({ locale, namespace: 'email.shareTrip' });

    const tripUrl = `${baseUrl}/${locale}/trips/shared/${tripId}`;
    const logoUrl = `${baseUrl}/logo-small.png`;

    const tripStyleDisplay = tripStyle === 'MID_RANGE'
      ? 'Mid-Range'
      : tripStyle.charAt(0) + tripStyle.slice(1).toLowerCase();

    const messageHtml = message
      ? `<div style="background: #eff6ff; border-radius: 8px; padding: 15px; margin: 15px 0; border-left: 4px solid #3b82f6;">
           <p style="margin: 0 0 5px 0; color: #1e40af; font-size: 13px; font-weight: 600;">${t('message', { sender: senderName })}</p>
           <p style="margin: 0; color: #1f2937; font-size: 14px;">${message}</p>
         </div>`
      : '';

    const messageText = message
      ? `\n${t('message', { sender: senderName })}\n"${message}"\n`
      : '';

    await resend.emails.send({
      from: 'TripCalc <noreply@tripcalc.site>',
      to: recipientEmail,
      subject: t('subject', { sender: senderName }),
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${tripName} - TripCalc</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <img src="${logoUrl}" alt="TripCalc" style="max-width: 200px; height: auto;" />
              <p style="color: #6b7280; margin: 10px 0 0 0; font-size: 14px;">${t('tagline')}</p>
            </div>

            <div style="background: #f9fafb; border-radius: 12px; padding: 30px; margin-bottom: 20px;">
              <h2 style="margin-top: 0; color: #1f2937; font-size: 22px;">
                ${t('sharedWith', { sender: senderName })}
              </h2>

              <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #2563eb;">
                <h3 style="margin: 0 0 10px 0; color: #1f2937; font-size: 18px;">${tripName}</h3>
                <p style="margin: 5px 0; color: #6b7280; font-size: 14px;">
                  <strong>${tTrip('city')}:</strong> ${cityName}
                </p>
                <p style="margin: 5px 0; color: #6b7280; font-size: 14px;">
                  <strong>${tTrip('style')}:</strong> ${tripStyleDisplay}
                </p>
                <p style="margin: 5px 0; color: #6b7280; font-size: 14px;">
                  <strong>${tTrip('duration')}:</strong> ${days} ${days === 1 ? tTrip('day') : tTrip('days')}
                </p>
              </div>

              ${messageHtml}

              <p style="color: #4b5563; margin: 20px 0;">
                ${t('clickBelow')}
              </p>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${tripUrl}"
                   style="display: inline-block; background: #2563eb; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                  ${t('viewButton')}
                </a>
              </div>

              <p style="color: #9ca3af; font-size: 13px; margin: 20px 0 0 0;">
                ${t('copyHint')}
              </p>
            </div>

            <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="color: #9ca3af; font-size: 12px; margin: 15px 0 0 0;">
                ${t('sentBy')} <a href="${baseUrl}" style="color: #2563eb; text-decoration: none;">TripCalc</a> - ${t('tagline')}
              </p>
            </div>
          </body>
        </html>
      `,
      text: `
${t('sharedWith', { sender: senderName })}

${tripName}
${tTrip('city')}: ${cityName}
${tTrip('style')}: ${tripStyleDisplay}
${tTrip('duration')}: ${days} ${days === 1 ? tTrip('day') : tTrip('days')}
${messageText}
${t('clickBelow')}
${tripUrl}

${t('copyHint')}

${t('sentBy')} TripCalc - ${t('tagline')}
${baseUrl}
      `.trim(),
    });
  } catch (error) {
    // Don't fail the share operation if email fails
    console.error('Error sending share notification email:', error);
  }
}

// POST /api/trips/[id]/share/user - Share trip with a registered user
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = shareSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    const { email, message, locale } = parsed.data;

    // Verify trip ownership
    const trip = await prisma.trip.findUnique({
      where: { id, userId: session.user.id },
    });

    if (!trip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    // Find target user by email
    const targetUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: 'userNotFound' },
        { status: 404 }
      );
    }

    // Cannot share with yourself
    if (targetUser.id === session.user.id) {
      return NextResponse.json(
        { error: 'cannotShareWithSelf' },
        { status: 400 }
      );
    }

    // Check if already shared
    const existing = await prisma.sharedTrip.findUnique({
      where: {
        tripId_sharedWithId: {
          tripId: id,
          sharedWithId: targetUser.id,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'alreadyShared' },
        { status: 409 }
      );
    }

    // Create shared trip record
    const sharedTrip = await prisma.sharedTrip.create({
      data: {
        tripId: id,
        sharedById: session.user.id,
        sharedWithId: targetUser.id,
        message,
      },
    });

    // Send notification email (non-blocking)
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || `https://${request.headers.get('host')}`;
    const senderName = session.user.name || 'Someone';

    sendShareNotificationEmail({
      recipientEmail: targetUser.email!,
      senderName,
      tripName: trip.name,
      tripId: trip.id,
      cityName: trip.cityName,
      days: trip.days,
      tripStyle: trip.tripStyle,
      message,
      locale,
      baseUrl,
    });

    return NextResponse.json({
      success: true,
      sharedTrip,
      userName: targetUser.name || targetUser.email,
    });
  } catch (error) {
    console.error('Error sharing trip with user:', error);
    return NextResponse.json(
      { error: 'Failed to share trip' },
      { status: 500 }
    );
  }
}

// DELETE /api/trips/[id]/share/user - Revoke shared access
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sharedWithId } = await request.json();

    if (!sharedWithId) {
      return NextResponse.json(
        { error: 'sharedWithId is required' },
        { status: 400 }
      );
    }

    // Verify trip ownership
    const trip = await prisma.trip.findUnique({
      where: { id, userId: session.user.id },
    });

    if (!trip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    await prisma.sharedTrip.delete({
      where: {
        tripId_sharedWithId: {
          tripId: id,
          sharedWithId,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error revoking shared access:', error);
    return NextResponse.json(
      { error: 'Failed to revoke access' },
      { status: 500 }
    );
  }
}

// GET /api/trips/[id]/share/user - List users this trip is shared with
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify trip ownership
    const trip = await prisma.trip.findUnique({
      where: { id, userId: session.user.id },
    });

    if (!trip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    const sharedWith = await prisma.sharedTrip.findMany({
      where: { tripId: id },
      include: {
        sharedWith: {
          select: { id: true, name: true, email: true, image: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ sharedWith });
  } catch (error) {
    console.error('Error fetching shared users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch shared users' },
      { status: 500 }
    );
  }
}

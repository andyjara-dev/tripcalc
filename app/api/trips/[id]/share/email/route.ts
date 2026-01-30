import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import { Resend } from 'resend';
import { z } from 'zod';

const emailSchema = z.object({
  email: z.string().email('Invalid email address'),
  locale: z.string().optional().default('en'), // Add locale parameter
});

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    // Initialize Resend here to avoid build-time errors
    const resend = new Resend(process.env.RESEND_API_KEY);

    const session = await requireAuth();
    const { id } = await params;
    const body = await request.json();

    // Validate email
    const validation = emailSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    const { email, locale } = validation.data;

    // Get trip
    const trip = await prisma.trip.findUnique({
      where: {
        id,
        userId: session.user.id,
      },
      select: {
        id: true,
        name: true,
        cityName: true,
        days: true,
        tripStyle: true,
        shareToken: true,
      },
    });

    if (!trip) {
      return NextResponse.json(
        { error: 'Trip not found' },
        { status: 404 }
      );
    }

    // Make sure trip has a share token
    if (!trip.shareToken) {
      return NextResponse.json(
        { error: 'Trip is not shared. Please generate a share link first.' },
        { status: 400 }
      );
    }

    // Get base URL from environment or request
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || `https://${request.headers.get('host')}`;
    const shareUrl = `${baseUrl}/${locale}/shared/${trip.shareToken}`;

    // Format trip style for display
    const tripStyleDisplay = trip.tripStyle === 'MID_RANGE'
      ? 'Mid-Range'
      : trip.tripStyle.charAt(0) + trip.tripStyle.slice(1).toLowerCase();

    // Send email
    const { data, error } = await resend.emails.send({
      from: 'TripCalc <noreply@tripcalc.site>',
      to: email,
      subject: `${session.user.name || 'Someone'} shared a trip with you - ${trip.name}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${trip.name} - TripCalc</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <!-- Header -->
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2563eb; margin: 0; font-size: 28px;">TripCalc</h1>
              <p style="color: #6b7280; margin: 5px 0; font-size: 14px;">Real Travel Costs, No Surprises</p>
            </div>

            <!-- Main Content -->
            <div style="background: #f9fafb; border-radius: 12px; padding: 30px; margin-bottom: 20px;">
              <h2 style="margin-top: 0; color: #1f2937; font-size: 22px;">
                ${session.user.name || 'Someone'} shared a trip with you
              </h2>

              <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #2563eb;">
                <h3 style="margin: 0 0 10px 0; color: #1f2937; font-size: 18px;">${trip.name}</h3>
                <p style="margin: 5px 0; color: #6b7280; font-size: 14px;">
                  <strong>City:</strong> ${trip.cityName}
                </p>
                <p style="margin: 5px 0; color: #6b7280; font-size: 14px;">
                  <strong>Style:</strong> ${tripStyleDisplay}
                </p>
                <p style="margin: 5px 0; color: #6b7280; font-size: 14px;">
                  <strong>Duration:</strong> ${trip.days} ${trip.days === 1 ? 'day' : 'days'}
                </p>
              </div>

              <p style="color: #4b5563; margin: 20px 0;">
                Click the button below to view the complete trip plan with daily costs, activities, and more.
              </p>

              <!-- CTA Button -->
              <div style="text-align: center; margin: 30px 0;">
                <a href="${shareUrl}"
                   style="display: inline-block; background: #2563eb; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                  View Trip Plan
                </a>
              </div>

              <p style="color: #9ca3af; font-size: 13px; margin: 20px 0 0 0;">
                Or copy and paste this link into your browser:<br>
                <a href="${shareUrl}" style="color: #2563eb; word-break: break-all;">${shareUrl}</a>
              </p>
            </div>

            <!-- Footer -->
            <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="color: #9ca3af; font-size: 13px; margin: 10px 0;">
                This is a read-only link. The trip owner can update the plan anytime, and you'll see the latest version.
              </p>
              <p style="color: #9ca3af; font-size: 12px; margin: 15px 0 0 0;">
                Sent by <a href="${baseUrl}" style="color: #2563eb; text-decoration: none;">TripCalc</a> - Real travel costs, no surprises
              </p>
            </div>
          </body>
        </html>
      `,
      text: `
${session.user.name || 'Someone'} shared a trip with you

${trip.name}
City: ${trip.cityName}
Style: ${tripStyleDisplay}
Duration: ${trip.days} ${trip.days === 1 ? 'day' : 'days'}

View the complete trip plan here:
${shareUrl}

This is a read-only link. The trip owner can update the plan anytime.

Sent by TripCalc - Real travel costs, no surprises
${baseUrl}
      `.trim(),
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      emailId: data?.id,
    });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}

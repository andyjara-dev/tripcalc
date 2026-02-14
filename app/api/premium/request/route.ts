import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helpers';
import { isPremiumUser } from '@/lib/auth-helpers';
import { Resend } from 'resend';
import { z } from 'zod';

const requestSchema = z.object({
  reason: z.string().min(10, 'Reason must be at least 10 characters'),
});

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await request.json();

    const validation = requestSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Reason must be at least 10 characters' },
        { status: 400 }
      );
    }

    const { reason } = validation.data;

    // Check if already premium
    if (await isPremiumUser(session)) {
      return NextResponse.json(
        { error: 'You already have premium access' },
        { status: 400 }
      );
    }

    // Send email to admin
    const resend = new Resend(process.env.RESEND_API_KEY);
    const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_FROM || '';
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || `https://${request.headers.get('host')}`;

    const userName = session.user.name || 'Unknown';
    const userEmail = session.user.email || 'Unknown';

    const { error } = await resend.emails.send({
      from: 'TripCalc <noreply@tripcalc.site>',
      to: adminEmail,
      subject: `Premium Request - ${userName}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #1f2937; font-size: 24px;">Premium Access Request</h1>
            </div>

            <div style="background: #f9fafb; border-radius: 12px; padding: 30px; margin-bottom: 20px;">
              <div style="background: white; border-radius: 8px; padding: 20px; margin-bottom: 20px; border-left: 4px solid #f59e0b;">
                <p style="margin: 5px 0; color: #374151; font-size: 14px;">
                  <strong>Name:</strong> ${userName}
                </p>
                <p style="margin: 5px 0; color: #374151; font-size: 14px;">
                  <strong>Email:</strong> ${userEmail}
                </p>
                <p style="margin: 5px 0; color: #374151; font-size: 14px;">
                  <strong>User ID:</strong> ${session.user.id}
                </p>
              </div>

              <div style="background: white; border-radius: 8px; padding: 20px; border-left: 4px solid #2563eb;">
                <p style="font-weight: 600; color: #1f2937; margin: 0 0 10px 0;">Reason:</p>
                <p style="color: #374151; margin: 0; white-space: pre-wrap;">${reason.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
              </div>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${baseUrl}/en/admin/users"
                 style="display: inline-block; background: #f59e0b; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                Manage Users
              </a>
            </div>

            <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="color: #9ca3af; font-size: 12px;">
                Sent by <a href="${baseUrl}" style="color: #2563eb; text-decoration: none;">TripCalc</a>
              </p>
            </div>
          </body>
        </html>
      `,
      text: `
Premium Access Request

Name: ${userName}
Email: ${userEmail}
User ID: ${session.user.id}

Reason:
${reason}

Manage users: ${baseUrl}/en/admin/users
      `.trim(),
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json(
        { error: 'Failed to send request' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error processing premium request:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

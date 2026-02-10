import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  getGeolocationFromHeaders,
  getUserAgent,
  getLocaleFromRequest,
} from '@/lib/analytics/geolocation';
import { sanitizeEventData, type AnalyticsEventType } from '@/lib/analytics/events';

/**
 * POST /api/analytics/track
 * Track analytics events
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();

    const { eventType, eventData, page, referrer, sessionId, anonymousId } = body;

    // Validate required fields
    if (!eventType || !sessionId) {
      return NextResponse.json(
        { error: 'Missing required fields: eventType, sessionId' },
        { status: 400 }
      );
    }

    // Get geolocation and context from headers
    const geo = getGeolocationFromHeaders(request.headers);
    const userAgent = getUserAgent(request.headers);
    const locale = getLocaleFromRequest(request.headers, page);

    // Sanitize event data (remove PII)
    const sanitizedData = eventData ? sanitizeEventData(eventType, eventData) : null;

    // Save event to database
    await prisma.analyticsEvent.create({
      data: {
        sessionId,
        anonymousId: session?.user?.id ? null : anonymousId,
        userId: session?.user?.id || null,
        eventType: eventType as AnalyticsEventType,
        eventData: sanitizedData,
        page: page || null,
        referrer: referrer || null,
        country: geo.country,
        city: geo.city,
        region: geo.region,
        userAgent,
        locale,
        ipHash: geo.ipHash,
      },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Analytics tracking error:', error);
    // Don't fail the request if analytics fails
    return NextResponse.json({ success: false }, { status: 200 });
  }
}

/**
 * POST /api/analytics/pageview
 * Track pageviews
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();

    const { path, title, referrer, sessionId, timeOnPage, loadTime } = body;

    // Validate required fields
    if (!path || !sessionId) {
      return NextResponse.json(
        { error: 'Missing required fields: path, sessionId' },
        { status: 400 }
      );
    }

    // Get geolocation and context
    const geo = getGeolocationFromHeaders(request.headers);
    const userAgent = getUserAgent(request.headers);
    const locale = getLocaleFromRequest(request.headers, path);

    // Save pageview to database
    await prisma.analyticsPageview.create({
      data: {
        sessionId,
        userId: session?.user?.id || null,
        path,
        title: title || null,
        referrer: referrer || null,
        timeOnPage: timeOnPage || null,
        loadTime: loadTime || null,
        country: geo.country,
        city: geo.city,
        userAgent,
        locale,
      },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Pageview tracking error:', error);
    return NextResponse.json({ success: false }, { status: 200 });
  }
}

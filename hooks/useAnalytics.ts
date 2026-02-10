/**
 * useAnalytics hook
 * Provides functions to track events and pageviews
 */

'use client';

import { useCallback, useContext, createContext, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import type { AnalyticsEventType, AnalyticsEventData } from '@/lib/analytics/events';

interface AnalyticsContextType {
  sessionId: string;
  anonymousId: string;
  trackEvent: (eventType: AnalyticsEventType, eventData?: AnalyticsEventData) => void;
  trackPageview: (path?: string, title?: string) => void;
}

export const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

/**
 * Hook to access analytics context
 */
export function useAnalytics() {
  const context = useContext(AnalyticsContext);
  if (!context) {
    // Fallback: create no-op functions if provider not found
    console.warn('useAnalytics must be used within AnalyticsProvider');
    return {
      sessionId: '',
      anonymousId: '',
      trackEvent: () => {},
      trackPageview: () => {},
    };
  }
  return context;
}

/**
 * Generate or retrieve session ID from cookie
 */
export function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return '';

  const COOKIE_NAME = 'analytics_session';
  const EXPIRY_DAYS = 30;

  // Check if cookie exists
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === COOKIE_NAME && value) {
      return value;
    }
  }

  // Generate new session ID
  const sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Set cookie
  const expires = new Date();
  expires.setDate(expires.getDate() + EXPIRY_DAYS);
  document.cookie = `${COOKIE_NAME}=${sessionId}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;

  return sessionId;
}

/**
 * Generate or retrieve anonymous ID from localStorage
 */
export function getOrCreateAnonymousId(): string {
  if (typeof window === 'undefined') return '';

  const STORAGE_KEY = 'analytics_anonymous_id';

  // Check if exists
  let anonymousId = localStorage.getItem(STORAGE_KEY);

  if (!anonymousId) {
    // Generate new anonymous ID
    anonymousId = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(STORAGE_KEY, anonymousId);
  }

  return anonymousId;
}

/**
 * Track event helper (sends to API)
 */
export async function sendEvent(
  eventType: AnalyticsEventType,
  eventData: AnalyticsEventData | undefined,
  sessionId: string,
  anonymousId: string,
  page?: string
) {
  try {
    const referrer = typeof document !== 'undefined' ? document.referrer : undefined;

    await fetch('/api/analytics/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        eventType,
        eventData,
        page,
        referrer,
        sessionId,
        anonymousId,
      }),
    });
  } catch (error) {
    // Silently fail - don't block user experience
    console.error('Failed to track event:', error);
  }
}

/**
 * Track pageview helper (sends to API)
 */
export async function sendPageview(
  path: string,
  title: string | undefined,
  sessionId: string,
  timeOnPage?: number,
  loadTime?: number
) {
  try {
    const referrer = typeof document !== 'undefined' ? document.referrer : undefined;

    await fetch('/api/analytics/track', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        path,
        title,
        referrer,
        sessionId,
        timeOnPage,
        loadTime,
      }),
    });
  } catch (error) {
    console.error('Failed to track pageview:', error);
  }
}

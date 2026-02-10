/**
 * AnalyticsProvider
 * Provides analytics context and auto-tracks pageviews
 */

'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { usePathname } from 'next/navigation';
import {
  AnalyticsContext,
  getOrCreateSessionId,
  getOrCreateAnonymousId,
  sendEvent,
  sendPageview,
} from '@/hooks/useAnalytics';
import type { AnalyticsEventType, AnalyticsEventData } from '@/lib/analytics/events';

interface AnalyticsProviderProps {
  children: React.ReactNode;
}

export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  const pathname = usePathname();
  const [sessionId, setSessionId] = useState('');
  const [anonymousId, setAnonymousId] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);
  const pageLoadTime = useRef<number>(Date.now());
  const lastPathname = useRef<string>('');

  // Initialize session and anonymous IDs
  useEffect(() => {
    const sid = getOrCreateSessionId();
    const aid = getOrCreateAnonymousId();
    setSessionId(sid);
    setAnonymousId(aid);
    setIsInitialized(true);
  }, []);

  // Track pageviews on route change
  useEffect(() => {
    if (!isInitialized || !sessionId) return;

    // Don't track if it's the first render with same pathname
    if (lastPathname.current === pathname) {
      lastPathname.current = pathname;
      return;
    }

    // Calculate time on previous page
    const now = Date.now();
    const timeOnPage = lastPathname.current
      ? Math.round((now - pageLoadTime.current) / 1000)
      : undefined;

    // Send pageview for previous page if it exists
    if (lastPathname.current && timeOnPage) {
      sendPageview(lastPathname.current, document.title, sessionId, timeOnPage);
    }

    // Update refs
    lastPathname.current = pathname;
    pageLoadTime.current = now;

    // Track new pageview (without timeOnPage for new page)
    const title = typeof document !== 'undefined' ? document.title : undefined;
    sendPageview(pathname, title, sessionId);
  }, [pathname, sessionId, isInitialized]);

  // Track event function
  const trackEvent = useCallback(
    (eventType: AnalyticsEventType, eventData?: AnalyticsEventData) => {
      if (!isInitialized || !sessionId) return;
      sendEvent(eventType, eventData, sessionId, anonymousId, pathname);
    },
    [isInitialized, sessionId, anonymousId, pathname]
  );

  // Track pageview function (manual)
  const trackPageview = useCallback(
    (path?: string, title?: string) => {
      if (!isInitialized || !sessionId) return;
      sendPageview(path || pathname, title || document.title, sessionId);
    },
    [isInitialized, sessionId, pathname]
  );

  // Send final pageview on unload
  useEffect(() => {
    if (!isInitialized || !sessionId) return;

    const handleBeforeUnload = () => {
      const timeOnPage = Math.round((Date.now() - pageLoadTime.current) / 1000);
      // Use sendBeacon for reliable tracking on page unload
      const data = {
        path: pathname,
        title: document.title,
        sessionId,
        timeOnPage,
      };

      navigator.sendBeacon(
        '/api/analytics/track',
        new Blob([JSON.stringify(data)], { type: 'application/json' })
      );
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isInitialized, sessionId, pathname]);

  if (!isInitialized) {
    return <>{children}</>;
  }

  return (
    <AnalyticsContext.Provider value={{ sessionId, anonymousId, trackEvent, trackPageview }}>
      {children}
    </AnalyticsContext.Provider>
  );
}

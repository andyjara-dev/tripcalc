import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import Header from '@/components/Header';
import { OverviewStats } from './components/OverviewStats';
import { TripMetrics } from './components/TripMetrics';
import { EngagementMetrics } from './components/EngagementMetrics';
import { WeatherMetrics } from './components/WeatherMetrics';
import { DateRangeSelector } from './components/DateRangeSelector';
import { getCountryInfo } from '@/lib/utils/country-flags';

interface AnalyticsPageProps {
  params: Promise<{
    locale: string;
  }>;
  searchParams: Promise<{
    from?: string;
    to?: string;
  }>;
}

export default async function AnalyticsPage({ params, searchParams }: AnalyticsPageProps) {
  const { locale } = await params;
  const session = await auth();
  const searchParamsData = await searchParams;

  // Only admins can access
  if (!session?.user || !session.user.isAdmin) {
    redirect('/');
  }

  const tNav = await getTranslations({ locale, namespace: 'nav' });
  const tSite = await getTranslations({ locale, namespace: 'site' });

  // Date range (default: last 30 days)
  const to = searchParamsData.to ? new Date(searchParamsData.to) : new Date();
  const from = searchParamsData.from
    ? new Date(searchParamsData.from)
    : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  // Fetch analytics data
  const [
    totalPageviews,
    uniqueSessions,
    totalEvents,
    topEvents,
    topPages,
    topCountries,
    recentEvents,
  ] = await Promise.all([
    // Total pageviews
    prisma.analyticsPageview.count({
      where: {
        timestamp: {
          gte: from,
          lte: to,
        },
      },
    }),

    // Unique sessions
    prisma.analyticsPageview.groupBy({
      by: ['sessionId'],
      where: {
        timestamp: {
          gte: from,
          lte: to,
        },
      },
    }),

    // Total events
    prisma.analyticsEvent.count({
      where: {
        timestamp: {
          gte: from,
          lte: to,
        },
      },
    }),

    // Top events
    prisma.analyticsEvent.groupBy({
      by: ['eventType'],
      _count: {
        eventType: true,
      },
      where: {
        timestamp: {
          gte: from,
          lte: to,
        },
      },
      orderBy: {
        _count: {
          eventType: 'desc',
        },
      },
      take: 10,
    }),

    // Top pages
    prisma.analyticsPageview.groupBy({
      by: ['path'],
      _count: {
        path: true,
      },
      where: {
        timestamp: {
          gte: from,
          lte: to,
        },
      },
      orderBy: {
        _count: {
          path: 'desc',
        },
      },
      take: 10,
    }),

    // Top countries
    prisma.analyticsPageview.groupBy({
      by: ['country'],
      _count: {
        country: true,
      },
      where: {
        timestamp: {
          gte: from,
          lte: to,
        },
        country: {
          not: null,
        },
      },
      orderBy: {
        _count: {
          country: 'desc',
        },
      },
      take: 10,
    }),

    // Recent events
    prisma.analyticsEvent.findMany({
      where: {
        timestamp: {
          gte: from,
          lte: to,
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
      take: 20,
    }),
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header
        locale={locale}
        activeSection="cities"
        translations={{
          home: tNav('home'),
          cities: tNav('cities'),
          calculators: tNav('calculators'),
          about: tNav('about'),
          logoAlt: tSite('name') + ' - ' + tSite('tagline')
        }}
      />

      {/* Main Content */}
      <div className="pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header with back link */}
          <div className="mb-8">
            <Link
              href={`/${locale}/admin/cities`}
              className="text-blue-600 hover:text-blue-700 text-sm mb-4 inline-block"
            >
              ← Back to Admin
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              📊 Analytics Dashboard
            </h1>
            <p className="text-gray-600">
              Analytics overview for TripCalc
            </p>
          </div>

        {/* Date Range Selector */}
        <DateRangeSelector from={from} to={to} />

        {/* Overview Stats */}
        <OverviewStats
          totalPageviews={totalPageviews}
          uniqueSessions={uniqueSessions.length}
          totalEvents={totalEvents}
          dateRange={{ from, to }}
        />

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Top Events */}
          <div className="bg-white bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Top Events
            </h2>
            <div className="space-y-3">
              {topEvents.map((event) => (
                <div
                  key={event.eventType}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded"
                >
                  <span className="text-sm text-gray-900 font-medium">
                    {event.eventType}
                  </span>
                  <span className="text-sm text-gray-600">
                    {event._count.eventType.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Pages */}
          <div className="bg-white bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Top Pages
            </h2>
            <div className="space-y-3">
              {topPages.map((page) => (
                <div
                  key={page.path}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded"
                >
                  <span className="text-sm text-gray-900 font-medium truncate">
                    {page.path}
                  </span>
                  <span className="text-sm text-gray-600">
                    {page._count.path.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Countries */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            🌍 Top Countries
          </h2>
          {topCountries.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="mb-2">No country data yet</p>
              <p className="text-sm">Geolocation will be captured as users visit your site</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {topCountries.map((country) => {
                const countryInfo = getCountryInfo(country.country || 'UNKNOWN');
                return (
                  <div
                    key={country.country}
                    className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{countryInfo.flag}</span>
                      <div>
                        <div className="font-medium text-gray-900">{countryInfo.name}</div>
                        <div className="text-xs text-gray-500">{countryInfo.code}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-blue-600">
                        {country._count.country.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">views</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Trip Metrics */}
        <TripMetrics dateRange={{ from, to }} />

        {/* Engagement Metrics */}
        <EngagementMetrics dateRange={{ from, to }} />

        {/* Weather Metrics */}
        <WeatherMetrics dateRange={{ from, to }} />

        {/* Recent Events */}
        <div className="bg-white bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Recent Events
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-4 text-sm font-medium text-gray-600">
                    Time
                  </th>
                  <th className="text-left py-2 px-4 text-sm font-medium text-gray-600">
                    Event
                  </th>
                  <th className="text-left py-2 px-4 text-sm font-medium text-gray-600">
                    Country
                  </th>
                  <th className="text-left py-2 px-4 text-sm font-medium text-gray-600">
                    Page
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentEvents.map((event) => (
                  <tr
                    key={event.id}
                    className="border-b border-gray-100/50"
                  >
                    <td className="py-2 px-4 text-sm text-gray-900">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-2 px-4 text-sm text-gray-900">
                      {event.eventType}
                    </td>
                    <td className="py-2 px-4 text-sm text-gray-600">
                      {event.country || '-'}
                    </td>
                    <td className="py-2 px-4 text-sm text-gray-600 truncate max-w-xs">
                      {event.page || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}

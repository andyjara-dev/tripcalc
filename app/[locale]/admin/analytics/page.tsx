import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { OverviewStats } from './components/OverviewStats';
import { TripMetrics } from './components/TripMetrics';
import { EngagementMetrics } from './components/EngagementMetrics';
import { WeatherMetrics } from './components/WeatherMetrics';
import { DateRangeSelector } from './components/DateRangeSelector';

interface AnalyticsPageProps {
  searchParams: Promise<{
    from?: string;
    to?: string;
  }>;
}

export default async function AnalyticsPage({ searchParams }: AnalyticsPageProps) {
  const session = await auth();
  const params = await searchParams;

  // Only admins can access
  if (!session?.user || !session.user.isAdmin) {
    redirect('/');
  }

  // Date range (default: last 30 days)
  const to = params.to ? new Date(params.to) : new Date();
  const from = params.from
    ? new Date(params.from)
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            📊 Analytics Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
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
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Top Events
            </h2>
            <div className="space-y-3">
              {topEvents.map((event) => (
                <div
                  key={event.eventType}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded"
                >
                  <span className="text-sm text-gray-900 dark:text-white font-medium">
                    {event.eventType}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {event._count.eventType.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Pages */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Top Pages
            </h2>
            <div className="space-y-3">
              {topPages.map((page) => (
                <div
                  key={page.path}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded"
                >
                  <span className="text-sm text-gray-900 dark:text-white font-medium truncate">
                    {page.path}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {page._count.path.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Countries */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Top Countries
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {topCountries.map((country) => (
              <div
                key={country.country}
                className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded"
              >
                <div className="text-2xl mb-2">{country.country}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {country._count.country.toLocaleString()} views
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trip Metrics */}
        <TripMetrics dateRange={{ from, to }} />

        {/* Engagement Metrics */}
        <EngagementMetrics dateRange={{ from, to }} />

        {/* Weather Metrics */}
        <WeatherMetrics dateRange={{ from, to }} />

        {/* Recent Events */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Recent Events
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-2 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                    Time
                  </th>
                  <th className="text-left py-2 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                    Event
                  </th>
                  <th className="text-left py-2 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                    Country
                  </th>
                  <th className="text-left py-2 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                    Page
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentEvents.map((event) => (
                  <tr
                    key={event.id}
                    className="border-b border-gray-100 dark:border-gray-700/50"
                  >
                    <td className="py-2 px-4 text-sm text-gray-900 dark:text-white">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-2 px-4 text-sm text-gray-900 dark:text-white">
                      {event.eventType}
                    </td>
                    <td className="py-2 px-4 text-sm text-gray-600 dark:text-gray-400">
                      {event.country || '-'}
                    </td>
                    <td className="py-2 px-4 text-sm text-gray-600 dark:text-gray-400 truncate max-w-xs">
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
  );
}

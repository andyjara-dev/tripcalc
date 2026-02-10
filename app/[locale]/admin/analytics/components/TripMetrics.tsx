import { prisma } from '@/lib/prisma';

interface TripMetricsProps {
  dateRange: { from: Date; to: Date };
}

export async function TripMetrics({ dateRange }: TripMetricsProps) {
  const [tripCreatedEvents, tripViewedEvents, tripSharedEvents, tripExportedEvents] =
    await Promise.all([
      // Trip created
      prisma.analyticsEvent.count({
        where: {
          eventType: 'trip_created',
          timestamp: {
            gte: dateRange.from,
            lte: dateRange.to,
          },
        },
      }),

      // Trip viewed
      prisma.analyticsEvent.count({
        where: {
          eventType: 'trip_viewed',
          timestamp: {
            gte: dateRange.from,
            lte: dateRange.to,
          },
        },
      }),

      // Trip shared
      prisma.analyticsEvent.count({
        where: {
          eventType: 'trip_shared',
          timestamp: {
            gte: dateRange.from,
            lte: dateRange.to,
          },
        },
      }),

      // Trip exported (PDF + iCal)
      prisma.analyticsEvent.count({
        where: {
          eventType: {
            in: ['trip_exported_pdf', 'trip_exported_ical'],
          },
          timestamp: {
            gte: dateRange.from,
            lte: dateRange.to,
          },
        },
      }),
    ]);

  // Get trips by city
  const tripsByCity = await prisma.analyticsEvent.groupBy({
    by: ['eventData'],
    _count: {
      eventData: true,
    },
    where: {
      eventType: 'trip_created',
      timestamp: {
        gte: dateRange.from,
        lte: dateRange.to,
      },
    },
    orderBy: {
      _count: {
        eventData: 'desc',
      },
    },
    take: 10,
  });

  const metrics = [
    { label: 'Trips Created', value: tripCreatedEvents, icon: '✈️', color: 'text-blue-600' },
    { label: 'Trips Viewed', value: tripViewedEvents, icon: '👀', color: 'text-green-600' },
    { label: 'Trips Shared', value: tripSharedEvents, icon: '🔗', color: 'text-purple-600' },
    { label: 'Trips Exported', value: tripExportedEvents, icon: '📥', color: 'text-orange-600' },
  ];

  const shareRate =
    tripCreatedEvents > 0 ? ((tripSharedEvents / tripCreatedEvents) * 100).toFixed(1) : '0';
  const exportRate =
    tripCreatedEvents > 0 ? ((tripExportedEvents / tripCreatedEvents) * 100).toFixed(1) : '0';

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">🗺️ Trip Metrics</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {metrics.map((metric) => (
          <div key={metric.label} className="text-center p-4 bg-gray-50 rounded">
            <div className="text-3xl mb-2">{metric.icon}</div>
            <div className={`text-2xl font-bold ${metric.color} mb-1`}>
              {metric.value.toLocaleString()}
            </div>
            <div className="text-xs text-gray-600">{metric.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-purple-50 rounded border border-purple-200">
          <div className="text-sm text-gray-600 mb-1">Share Rate</div>
          <div className="text-2xl font-bold text-purple-600">
            {shareRate}%
          </div>
          <div className="text-xs text-gray-500 mt-1">
            of trips are shared
          </div>
        </div>

        <div className="p-4 bg-orange-50 rounded border border-orange-200">
          <div className="text-sm text-gray-600 mb-1">Export Rate</div>
          <div className="text-2xl font-bold text-orange-600">
            {exportRate}%
          </div>
          <div className="text-xs text-gray-500 mt-1">
            of trips are exported
          </div>
        </div>
      </div>
    </div>
  );
}

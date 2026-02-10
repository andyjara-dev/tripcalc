import { prisma } from '@/lib/prisma';

interface WeatherMetricsProps {
  dateRange: { from: Date; to: Date };
}

export async function WeatherMetrics({ dateRange }: WeatherMetricsProps) {
  const [weatherCardViewed, weatherAlertShown, weatherAlertClicked] = await Promise.all([
    // Weather card viewed
    prisma.analyticsEvent.count({
      where: {
        eventType: 'weather_card_viewed',
        timestamp: {
          gte: dateRange.from,
          lte: dateRange.to,
        },
      },
    }),

    // Weather alert shown
    prisma.analyticsEvent.count({
      where: {
        eventType: 'weather_alert_shown',
        timestamp: {
          gte: dateRange.from,
          lte: dateRange.to,
        },
      },
    }),

    // Weather alert clicked
    prisma.analyticsEvent.count({
      where: {
        eventType: 'weather_alert_clicked',
        timestamp: {
          gte: dateRange.from,
          lte: dateRange.to,
        },
      },
    }),
  ]);

  // Alert click-through rate
  const alertCTR =
    weatherAlertShown > 0 ? ((weatherAlertClicked / weatherAlertShown) * 100).toFixed(1) : '0';

  // Trips with alerts
  const tripsWithAlerts = await prisma.analyticsEvent.count({
    where: {
      eventType: 'weather_card_viewed',
      timestamp: {
        gte: dateRange.from,
        lte: dateRange.to,
      },
      eventData: {
        path: ['hasAlerts'],
        equals: true,
      },
    },
  });

  const alertRate =
    weatherCardViewed > 0 ? ((tripsWithAlerts / weatherCardViewed) * 100).toFixed(1) : '0';

  const metrics = [
    {
      label: 'Weather Cards Viewed',
      value: weatherCardViewed,
      icon: '🌤️',
      color: 'text-blue-600',
    },
    {
      label: 'Alerts Shown',
      value: weatherAlertShown,
      icon: '⚠️',
      color: 'text-orange-600',
    },
    {
      label: 'Alerts Clicked',
      value: weatherAlertClicked,
      icon: '👆',
      color: 'text-purple-600',
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        🌦️ Weather Metrics
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
        <div className="p-4 bg-orange-50 rounded border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600 mb-1">Alert CTR</div>
              <div className="text-2xl font-bold text-orange-600">
                {alertCTR}%
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Users who click alerts
              </div>
            </div>
            <div className="text-3xl">📊</div>
          </div>
        </div>

        <div className="p-4 bg-red-50 rounded border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600 mb-1">Alert Rate</div>
              <div className="text-2xl font-bold text-red-600">
                {alertRate}%
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Trips with weather alerts
              </div>
            </div>
            <div className="text-3xl">⚡</div>
          </div>
        </div>
      </div>

      {weatherAlertShown > 0 && (
        <div className="mt-4 p-4 bg-yellow-50 rounded border border-yellow-200">
          <div className="flex items-center gap-2">
            <span className="text-2xl">💡</span>
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900 mb-1">
                Alert Effectiveness
              </div>
              <div className="text-xs text-gray-600">
                {alertCTR}% click-through rate indicates{' '}
                {parseFloat(alertCTR) > 50
                  ? 'high user engagement with weather alerts'
                  : parseFloat(alertCTR) > 20
                  ? 'moderate engagement with weather alerts'
                  : 'low engagement - consider improving alert visibility'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

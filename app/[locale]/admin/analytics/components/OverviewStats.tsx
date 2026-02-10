interface OverviewStatsProps {
  totalPageviews: number;
  uniqueSessions: number;
  totalEvents: number;
  dateRange: { from: Date; to: Date };
}

export function OverviewStats({
  totalPageviews,
  uniqueSessions,
  totalEvents,
  dateRange,
}: OverviewStatsProps) {
  const days = Math.ceil(
    (dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24)
  );

  const stats = [
    {
      label: 'Total Pageviews',
      value: totalPageviews.toLocaleString(),
      subtext: `${(totalPageviews / days).toFixed(1)} per day`,
      icon: '📄',
      color: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
    },
    {
      label: 'Unique Sessions',
      value: uniqueSessions.toLocaleString(),
      subtext: `${(uniqueSessions / days).toFixed(1)} per day`,
      icon: '👥',
      color: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
    },
    {
      label: 'Total Events',
      value: totalEvents.toLocaleString(),
      subtext: `${(totalEvents / days).toFixed(1)} per day`,
      icon: '⚡',
      color: 'bg-purple-50 border-purple-200',
    },
    {
      label: 'Events per Session',
      value: uniqueSessions > 0 ? (totalEvents / uniqueSessions).toFixed(1) : '0',
      subtext: 'Average engagement',
      icon: '📊',
      color: 'bg-orange-50 border-orange-200',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={`${stat.color} border rounded-lg p-6 transition-transform hover:scale-105`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-3xl">{stat.icon}</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {stat.value}
          </div>
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {stat.label}
          </div>
          <div className="text-xs text-gray-600">{stat.subtext}</div>
        </div>
      ))}
    </div>
  );
}

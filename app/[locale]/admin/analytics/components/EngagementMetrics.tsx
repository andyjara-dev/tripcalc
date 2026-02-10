import { prisma } from '@/lib/prisma';

interface EngagementMetricsProps {
  dateRange: { from: Date; to: Date };
}

export async function EngagementMetrics({ dateRange }: EngagementMetricsProps) {
  const [accordionEvents, dropdownEvents, modalEvents, calculatorEvents] = await Promise.all([
    // Accordion expanded
    prisma.analyticsEvent.count({
      where: {
        eventType: 'accordion_expanded',
        timestamp: {
          gte: dateRange.from,
          lte: dateRange.to,
        },
      },
    }),

    // Dropdown opened
    prisma.analyticsEvent.count({
      where: {
        eventType: 'dropdown_opened',
        timestamp: {
          gte: dateRange.from,
          lte: dateRange.to,
        },
      },
    }),

    // Modal opened
    prisma.analyticsEvent.count({
      where: {
        eventType: 'modal_opened',
        timestamp: {
          gte: dateRange.from,
          lte: dateRange.to,
        },
      },
    }),

    // Calculator used
    prisma.analyticsEvent.count({
      where: {
        eventType: 'calculator_used',
        timestamp: {
          gte: dateRange.from,
          lte: dateRange.to,
        },
      },
    }),
  ]);

  // Average time on page
  const avgTimeOnPage = await prisma.analyticsPageview.aggregate({
    _avg: {
      timeOnPage: true,
    },
    where: {
      timestamp: {
        gte: dateRange.from,
        lte: dateRange.to,
      },
      timeOnPage: {
        not: null,
        gt: 0,
        lt: 3600, // Filter out outliers (> 1 hour)
      },
    },
  });

  const avgTime = avgTimeOnPage._avg.timeOnPage || 0;
  const minutes = Math.floor(avgTime / 60);
  const seconds = Math.floor(avgTime % 60);

  const metrics = [
    { label: 'Accordions Expanded', value: accordionEvents, icon: '📂' },
    { label: 'Dropdowns Opened', value: dropdownEvents, icon: '⋮' },
    { label: 'Modals Opened', value: modalEvents, icon: '🪟' },
    { label: 'Calculators Used', value: calculatorEvents, icon: '🧮' },
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        💫 Engagement Metrics
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {metrics.map((metric) => (
          <div key={metric.label} className="text-center p-4 bg-gray-50 rounded">
            <div className="text-3xl mb-2">{metric.icon}</div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {metric.value.toLocaleString()}
            </div>
            <div className="text-xs text-gray-600">{metric.label}</div>
          </div>
        ))}
      </div>

      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-600 mb-1">
              Average Time on Page
            </div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {minutes}m {seconds}s
            </div>
          </div>
          <div className="text-4xl">⏱️</div>
        </div>
      </div>
    </div>
  );
}

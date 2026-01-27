'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { CityData } from '@/data/cities';
import DailyCostCalculator from './calculators/DailyCostCalculator';
import TransportComparator from './calculators/TransportComparator';
import AirportTransferCalculator from './calculators/AirportTransferCalculator';

interface CalculatorTabsProps {
  city: CityData;
}

type TabId = 'daily' | 'transport' | 'airport';

export default function CalculatorTabs({ city }: CalculatorTabsProps) {
  const t = useTranslations('calculator');
  const [activeTab, setActiveTab] = useState<TabId>('daily');

  const tabs = [
    {
      id: 'daily' as TabId,
      label: t('dailyCost'),
      icon: '💰',
      component: <DailyCostCalculator city={city} />,
    },
    {
      id: 'transport' as TabId,
      label: t('transportComparison'),
      icon: '🚇',
      component: <TransportComparator city={city} />,
    },
    {
      id: 'airport' as TabId,
      label: t('airportTransferCalc'),
      icon: '✈️',
      component: <AirportTransferCalculator city={city} />,
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Tab Headers */}
      <div className="border-b border-gray-200 bg-gray-50">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-fit px-6 py-4 font-semibold text-sm transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-white text-gray-900 border-b-2 border-gray-900'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-8">
        {tabs.find(tab => tab.id === activeTab)?.component}
      </div>
    </div>
  );
}

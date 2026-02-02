'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import PackingListCard from './PackingListCard';
import Link from 'next/link';

type PackingItem = {
  category: string;
  name: string;
  quantity: number;
  weightPerItem: number;
  totalWeight: number;
  essential: boolean;
  notes?: string;
  packed?: boolean;
};

type PackingList = {
  id: string;
  name?: string;
  luggageType: string;
  weightLimit: number;
  totalWeight: number;
  items: PackingItem[];
  tips: string[];
  warnings?: string[];
  createdAt: string;
};

type Props = {
  packingLists: PackingList[];
  locale: string;
  tripId: string;
};

export default function PackingListsSection({ packingLists, locale, tripId }: Props) {
  const router = useRouter();
  const t = useTranslations('trips');

  const handleDelete = () => {
    router.refresh();
  };

  // Calculate total weight across all bags
  const totalWeight = packingLists.reduce((sum, list) => {
    const packedWeight = list.items
      .filter(item => item.packed === true || item.packed === undefined)
      .reduce((itemSum, item) => itemSum + item.totalWeight, 0);
    return sum + packedWeight;
  }, 0);

  const totalLimit = packingLists.reduce((sum, list) => sum + (list.weightLimit * 1000), 0);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            🧳 {t('packingLists.title')}
            <span className="text-sm font-normal text-gray-600">
              ({packingLists.length})
            </span>
          </h2>
          {packingLists.length > 1 && (
            <p className="text-sm text-gray-600 mt-1">
              {t('packingLists.totalWeight')}: <span className="font-semibold">{(totalWeight / 1000).toFixed(2)}kg</span> / {(totalLimit / 1000).toFixed(0)}kg
            </p>
          )}
        </div>
        <Link
          href={`/${locale}/calculators/luggage`}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition"
        >
          ➕ {t('packingLists.addAnother')}
        </Link>
      </div>

      <div className="space-y-4">
        {packingLists.map((list) => (
          <PackingListCard
            key={list.id}
            packingList={list}
            locale={locale}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {packingLists.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🧳</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('packingLists.noLists')}</h3>
          <p className="text-gray-600 mb-4">{t('packingLists.noListsDescription')}</p>
          <Link
            href={`/${locale}/calculators/luggage`}
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition"
          >
            {t('packingLists.createFirst')}
          </Link>
        </div>
      )}
    </div>
  );
}

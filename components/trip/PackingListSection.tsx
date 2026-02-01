'use client';

import { useRouter } from 'next/navigation';
import PackingListCard from './PackingListCard';

type PackingItem = {
  category: string;
  name: string;
  quantity: number;
  weightPerItem: number;
  totalWeight: number;
  essential: boolean;
  notes?: string;
};

type PackingList = {
  id: string;
  luggageType: string;
  weightLimit: number;
  totalWeight: number;
  items: PackingItem[];
  tips: string[];
  warnings?: string[];
  createdAt: string;
};

type Props = {
  packingList: PackingList;
  locale: string;
};

export default function PackingListSection({ packingList, locale }: Props) {
  const router = useRouter();

  const handleDelete = () => {
    router.refresh();
  };

  return (
    <PackingListCard
      packingList={packingList}
      locale={locale}
      onDelete={handleDelete}
    />
  );
}

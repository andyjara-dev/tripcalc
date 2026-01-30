'use client';

import { useTranslations } from 'next-intl';

interface PremiumBadgeProps {
  isPremium?: boolean;
  isAdmin?: boolean;
}

export default function PremiumBadge({ isPremium, isAdmin }: PremiumBadgeProps) {
  const t = useTranslations('profile.premium');

  if (isAdmin) {
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
        🛡️ {t('adminBadge')}
      </span>
    );
  }

  if (isPremium) {
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
        👑 {t('badge')}
      </span>
    );
  }

  return null;
}

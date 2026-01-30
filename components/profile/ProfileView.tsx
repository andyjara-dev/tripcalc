'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import type { Session } from 'next-auth';
import AccountStats from './AccountStats';
import PremiumBadge from './PremiumBadge';
import ProfileEdit from './ProfileEdit';
import DeleteAccount from './DeleteAccount';

interface ProfileViewProps {
  session: Session;
}

export default function ProfileView({ session }: ProfileViewProps) {
  const t = useTranslations('profile');
  const locale = useLocale();
  const [isEditing, setIsEditing] = useState(false);

  // @ts-ignore - isPremium and isAdmin are custom fields
  const isPremium = session.user.isPremium || false;
  // @ts-ignore
  const isAdmin = session.user.isAdmin || false;

  // @ts-ignore - createdAt is a custom field
  const memberSince = session.user.createdAt
    // @ts-ignore
    ? new Date(session.user.createdAt).toLocaleDateString(locale, {
        year: 'numeric',
        month: 'long',
      })
    : new Date().toLocaleDateString(locale, {
        year: 'numeric',
        month: 'long',
      });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-2xl font-bold">
              {session.user.name || t('noName')}
            </h1>
            <p className="text-gray-600">{session.user.email}</p>
            <p className="text-sm text-gray-500 mt-1">
              {t('memberSince')} {memberSince}
            </p>
          </div>
          <div className="flex gap-2">
            <PremiumBadge isPremium={isPremium} isAdmin={isAdmin} />
          </div>
        </div>

        {/* Edit Button */}
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {t('editProfile')}
          </button>
        )}

        {/* Edit Form */}
        {isEditing && (
          <ProfileEdit
            session={session}
            onCancel={() => setIsEditing(false)}
            onSuccess={() => setIsEditing(false)}
          />
        )}
      </div>

      {/* Stats */}
      <AccountStats />

      {/* Premium Features Info */}
      {(isPremium || isAdmin) && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg shadow p-6 border border-yellow-200">
          <h2 className="text-xl font-semibold mb-2 flex items-center text-gray-900">
            {isAdmin ? '🛡️' : '👑'} {t('premium.features')}
          </h2>
          <p className="text-gray-900">{t('premium.unlocked')}</p>
        </div>
      )}

      {/* Danger Zone */}
      <DeleteAccount />
    </div>
  );
}

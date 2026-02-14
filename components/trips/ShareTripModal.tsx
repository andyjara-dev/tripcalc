'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations, useLocale } from 'next-intl';

interface SharedUser {
  id: string;
  sharedWith: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  };
  createdAt: string;
}

interface ShareTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  tripId: string;
  initialIsPublic: boolean;
  initialShareToken?: string | null;
}

export default function ShareTripModal({
  isOpen,
  onClose,
  tripId,
  initialIsPublic,
  initialShareToken,
}: ShareTripModalProps) {
  const t = useTranslations('trips');
  const locale = useLocale();
  const [isPublic, setIsPublic] = useState(initialIsPublic);
  const [shareToken, setShareToken] = useState(initialShareToken);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState('');

  // Share with user state
  const [userEmail, setUserEmail] = useState('');
  const [isShareingWithUser, setIsSharingWithUser] = useState(false);
  const [shareUserSuccess, setShareUserSuccess] = useState('');
  const [shareUserError, setShareUserError] = useState('');
  const [sharedUsers, setSharedUsers] = useState<SharedUser[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const fetchSharedUsers = useCallback(async () => {
    setIsLoadingUsers(true);
    try {
      const response = await fetch(`/api/trips/${tripId}/share/user`);
      if (response.ok) {
        const data = await response.json();
        setSharedUsers(data.sharedWith || []);
      }
    } catch (error) {
      console.error('Error fetching shared users:', error);
    } finally {
      setIsLoadingUsers(false);
    }
  }, [tripId]);

  useEffect(() => {
    if (isOpen) {
      fetchSharedUsers();
    }
  }, [isOpen, fetchSharedUsers]);

  if (!isOpen) return null;

  const shareUrl = shareToken
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/${locale}/shared/${shareToken}`
    : '';

  const handleTogglePublic = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/trips/${tripId}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublic: !isPublic }),
      });

      if (!response.ok) {
        throw new Error('Failed to update share settings');
      }

      const data = await response.json();
      setIsPublic(data.trip.isPublic);
      setShareToken(data.trip.shareToken);
    } catch (error) {
      console.error('Error toggling public:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSendEmail = async () => {
    if (!email || !shareToken) return;
    setIsSendingEmail(true);
    setEmailError('');
    setEmailSent(false);

    try {
      const response = await fetch(`/api/trips/${tripId}/share/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, locale }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to send email');
      }

      setEmailSent(true);
      setEmail('');
      setTimeout(() => setEmailSent(false), 5000);
    } catch (error) {
      console.error('Error sending email:', error);
      setEmailError(error instanceof Error ? error.message : t('emailError'));
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleShareWithUser = async () => {
    if (!userEmail) return;
    setIsSharingWithUser(true);
    setShareUserError('');
    setShareUserSuccess('');

    try {
      const response = await fetch(`/api/trips/${tripId}/share/user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, locale }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorKey = data.error;
        if (errorKey === 'userNotFound' || errorKey === 'alreadyShared' || errorKey === 'cannotShareWithSelf') {
          setShareUserError(t(errorKey));
        } else {
          setShareUserError(data.error || 'Failed to share');
        }
        return;
      }

      setShareUserSuccess(t('sharedSuccessfully', { name: data.userName }));
      setUserEmail('');
      fetchSharedUsers();
      setTimeout(() => setShareUserSuccess(''), 5000);
    } catch (error) {
      console.error('Error sharing with user:', error);
      setShareUserError('Failed to share trip');
    } finally {
      setIsSharingWithUser(false);
    }
  };

  const handleRevokeAccess = async (sharedWithId: string) => {
    setRevokingId(sharedWithId);
    try {
      const response = await fetch(`/api/trips/${tripId}/share/user`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sharedWithId }),
      });

      if (response.ok) {
        setSharedUsers((prev) => prev.filter((u) => u.sharedWith.id !== sharedWithId));
      }
    } catch (error) {
      console.error('Error revoking access:', error);
    } finally {
      setRevokingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          {t('shareTrip')}
        </h2>

        {/* Public/Private Status */}
        <div className={`p-4 rounded-lg mb-4 ${
          isPublic ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'
        }`}>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{isPublic ? '🌐' : '🔒'}</span>
            <div className="flex-1">
              <p className="font-semibold text-gray-900">
                {isPublic ? t('tripIsPublic') : t('tripIsPrivate')}
              </p>
              <p className="text-sm text-gray-600">
                {t('shareMessage')}
              </p>
            </div>
          </div>
        </div>

        {/* Share Link (when public) */}
        {isPublic && shareToken && (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('shareLink')}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 text-sm"
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                />
                <button
                  onClick={handleCopyLink}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    copied
                      ? 'bg-green-600 text-white'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {copied ? '✓' : t('copyLink')}
                </button>
              </div>
              {copied && (
                <p className="text-sm text-green-600 mt-1">{t('linkCopied')}</p>
              )}
            </div>

            {/* Send by Email */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('shareByEmail')}
              </label>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('emailPlaceholder')}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm focus:ring-2 focus:ring-blue-500"
                  disabled={isSendingEmail}
                />
                <button
                  onClick={handleSendEmail}
                  disabled={!email || isSendingEmail}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    emailSent
                      ? 'bg-green-600 text-white'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {isSendingEmail ? t('sending') : emailSent ? '✓' : t('sendEmail')}
                </button>
              </div>
              {emailSent && (
                <p className="text-sm text-green-600 mt-1">{t('emailSent')}</p>
              )}
              {emailError && (
                <p className="text-sm text-red-600 mt-1">{emailError}</p>
              )}
            </div>
          </>
        )}

        {/* Divider */}
        <div className="border-t border-gray-200 my-4" />

        {/* Share with registered user */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('shareWithUser')}
          </label>
          <p className="text-xs text-gray-600 mb-2">
            {t('shareWithUserDesc')}
          </p>
          <div className="flex gap-2">
            <input
              type="email"
              value={userEmail}
              onChange={(e) => {
                setUserEmail(e.target.value);
                setShareUserError('');
              }}
              placeholder={t('emailPlaceholder')}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm bg-white focus:ring-2 focus:ring-blue-500"
              disabled={isShareingWithUser}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleShareWithUser();
              }}
            />
            <button
              onClick={handleShareWithUser}
              disabled={!userEmail || isShareingWithUser}
              className="px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600 text-white hover:bg-blue-700"
            >
              {isShareingWithUser ? '...' : t('sendEmail')}
            </button>
          </div>
          {shareUserSuccess && (
            <p className="text-sm text-green-600 mt-1">{shareUserSuccess}</p>
          )}
          {shareUserError && (
            <p className="text-sm text-red-600 mt-1">{shareUserError}</p>
          )}
        </div>

        {/* Shared with users list */}
        {sharedUsers.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-2">
              {t('sharedWithUsers')}
            </p>
            <div className="space-y-2">
              {sharedUsers.map((shared) => (
                <div
                  key={shared.sharedWith.id}
                  className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {shared.sharedWith.image ? (
                      <img
                        src={shared.sharedWith.image}
                        alt=""
                        className="w-6 h-6 rounded-full"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-medium text-blue-700">
                        {(shared.sharedWith.name || shared.sharedWith.email || '?')[0].toUpperCase()}
                      </div>
                    )}
                    <span className="text-sm text-gray-900 truncate">
                      {shared.sharedWith.name || shared.sharedWith.email}
                    </span>
                  </div>
                  <button
                    onClick={() => handleRevokeAccess(shared.sharedWith.id)}
                    disabled={revokingId === shared.sharedWith.id}
                    className="text-xs text-red-600 hover:text-red-700 font-medium disabled:opacity-50 ml-2 shrink-0"
                  >
                    {revokingId === shared.sharedWith.id ? '...' : t('revokeAccess')}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {isLoadingUsers && (
          <div className="text-center py-2">
            <span className="text-sm text-gray-500">...</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium"
          >
            {t('cancel')}
          </button>
          <button
            onClick={handleTogglePublic}
            disabled={isLoading}
            className={`flex-1 px-4 py-2 rounded-lg font-medium disabled:opacity-50 ${
              isPublic
                ? 'bg-gray-600 text-white hover:bg-gray-700'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isLoading ? '...' : isPublic ? t('makePrivate') : t('makePublic')}
          </button>
        </div>
      </div>
    </div>
  );
}

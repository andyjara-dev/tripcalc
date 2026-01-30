'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';

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

  if (!isOpen) return null;

  const shareUrl = shareToken
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/${locale}/shared/${shareToken}`
    : '';

  const handleTogglePublic = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/trips/${tripId}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isPublic: !isPublic,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update share settings');
      }

      const data = await response.json();
      setIsPublic(data.trip.isPublic);
      setShareToken(data.trip.shareToken);
    } catch (error) {
      console.error('Error toggling public:', error);
      alert('Failed to update share settings');
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
    } catch (error) {
      console.error('Error copying link:', error);
      // Fallback for older browsers
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
        headers: {
          'Content-Type': 'application/json',
        },
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          {t('shareTrip')}
        </h2>

        {/* Status */}
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

        {/* Share Link */}
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
                <p className="text-sm text-green-600 mt-1">
                  {t('linkCopied')}
                </p>
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
                <p className="text-sm text-green-600 mt-1">
                  {t('emailSent')}
                </p>
              )}
              {emailError && (
                <p className="text-sm text-red-600 mt-1">
                  {emailError}
                </p>
              )}
            </div>
          </>
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

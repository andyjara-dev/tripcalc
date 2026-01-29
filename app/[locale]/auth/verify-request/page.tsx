import { useTranslations } from 'next-intl'
import Link from 'next/link'

export default function VerifyRequestPage() {
  const t = useTranslations('auth')

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
          <svg
            className="h-6 w-6 text-blue-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>
        <div>
          <h2 className="text-3xl font-bold text-gray-900">{t('checkYourEmail')}</h2>
          <p className="mt-2 text-gray-600">{t('verifyRequestMessage')}</p>
        </div>
        <div className="text-sm text-gray-500">
          <Link href="/" className="font-medium text-blue-600 hover:text-blue-700">
            {t('backToHome')}
          </Link>
        </div>
      </div>
    </div>
  )
}

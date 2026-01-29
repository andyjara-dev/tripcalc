'use client'

import { useTranslations } from 'next-intl'
import { signIn } from 'next-auth/react'

export function SignInButton() {
  const t = useTranslations('auth')

  return (
    <button
      onClick={() => signIn()}
      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
    >
      {t('signIn')}
    </button>
  )
}

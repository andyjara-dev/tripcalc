'use client'

import { useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link'

export function UserMenu() {
  const { data: session } = useSession()
  const t = useTranslations('auth')
  const locale = useLocale()
  const [isOpen, setIsOpen] = useState(false)

  if (!session?.user) return null

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        {session.user.image ? (
          <img
            src={session.user.image}
            alt={session.user.name || ''}
            className="w-8 h-8 rounded-full object-cover"
            referrerPolicy="no-referrer"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
              const fallback = e.currentTarget.nextElementSibling as HTMLElement | null
              if (fallback) fallback.style.display = 'flex'
            }}
          />
        ) : null}
        <div
          className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-medium"
          style={{ display: session.user.image ? 'none' : 'flex' }}
        >
          {session.user.name?.[0]?.toUpperCase() || session.user.email?.[0]?.toUpperCase() || 'U'}
        </div>
        <span className="hidden md:block font-medium text-gray-900">
          {session.user.name || session.user.email}
        </span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
            <Link
              href={`/${locale}/trips`}
              className="block px-4 py-2 hover:bg-gray-100 transition-colors text-gray-900"
              onClick={() => setIsOpen(false)}
            >
              {t('myTrips')}
            </Link>
            <Link
              href={`/${locale}/profile`}
              className="block px-4 py-2 hover:bg-gray-100 transition-colors text-gray-900"
              onClick={() => setIsOpen(false)}
            >
              {t('profile')}
            </Link>
            <hr className="my-1" />
            <button
              onClick={() => {
                setIsOpen(false)
                signOut()
              }}
              className="block w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors text-red-600"
            >
              {t('signOut')}
            </button>
          </div>
        </>
      )}
    </div>
  )
}

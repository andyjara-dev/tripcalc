# Phase 6d - User Profile Page

## Status: PLANNED

## Overview
Create a functional user profile page that currently returns 404. Users should be able to view and edit their account information.

## Current Issue
- Route `/[locale]/profile` doesn't exist
- Clicking on profile in user menu shows 404 error
- No way to view/edit user account settings

## Features to Implement

### 1. Basic Profile View
- Display user information:
  - Name
  - Email
  - Account creation date
  - Account type (Free, Premium, Admin)
- Premium badge if applicable
- Admin badge if applicable

### 2. Edit Profile
- Update display name
- Update email (with verification)
- Change password (if email auth)

### 3. Account Stats
- Total trips created: X
- Shared trips: X
- Total expenses tracked: X
- Member since: [date]

### 4. Connected Accounts
- Show OAuth providers connected (Google, GitHub)
- Allow connecting/disconnecting providers
- Require at least one auth method

### 5. Premium Info
- If premium: Show features unlocked
- If not premium: Show premium features available
- Admin users see "Admin Access" instead

### 6. Delete Account
- Danger zone section
- Confirmation modal
- Cascade delete all user data (trips, expenses, custom items)

## File Structure

```
/app/[locale]/profile/
├── page.tsx                    # Main profile page
└── loading.tsx                 # Loading state

/components/profile/
├── ProfileView.tsx             # Read-only profile display
├── ProfileEdit.tsx             # Edit form
├── AccountStats.tsx            # Stats cards
├── ConnectedAccounts.tsx       # OAuth providers
├── PremiumBadge.tsx           # Premium status display
└── DeleteAccount.tsx          # Delete account section

/app/api/profile/
├── route.ts                    # GET/PATCH profile
└── delete/route.ts            # DELETE account
```

## Implementation Tasks

### 1. Create Profile Page Route
**File:** `/app/[locale]/profile/page.tsx`

```typescript
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Header from '@/components/Header';
import ProfileView from '@/components/profile/ProfileView';

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/auth/signin');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        session={session}
        locale={locale}
        translations={...}
      />

      <main className="container mx-auto px-4 py-8">
        <ProfileView session={session} />
      </main>
    </div>
  );
}
```

### 2. Profile View Component
**File:** `/components/profile/ProfileView.tsx`

```typescript
'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import AccountStats from './AccountStats';
import ConnectedAccounts from './ConnectedAccounts';
import PremiumBadge from './PremiumBadge';
import DeleteAccount from './DeleteAccount';

export default function ProfileView({ session }) {
  const t = useTranslations('profile');
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{session.user.name || t('noName')}</h1>
            <p className="text-gray-600">{session.user.email}</p>
          </div>
          <div className="flex gap-2">
            <PremiumBadge
              isPremium={session.user.isPremium}
              isAdmin={session.user.isAdmin}
            />
          </div>
        </div>
      </div>

      {/* Stats */}
      <AccountStats userId={session.user.id} />

      {/* Account Settings */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">{t('accountSettings')}</h2>
        {/* Edit form here */}
      </div>

      {/* Connected Accounts */}
      <ConnectedAccounts userId={session.user.id} />

      {/* Danger Zone */}
      <DeleteAccount userId={session.user.id} />
    </div>
  );
}
```

### 3. Account Stats Component
**File:** `/components/profile/AccountStats.tsx`

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

export default function AccountStats({ userId }) {
  const t = useTranslations('profile.stats');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/profile/stats`)
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      });
  }, [userId]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-3xl font-bold text-blue-600">{stats.totalTrips}</div>
        <div className="text-gray-600">{t('totalTrips')}</div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-3xl font-bold text-green-600">{stats.sharedTrips}</div>
        <div className="text-gray-600">{t('sharedTrips')}</div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-3xl font-bold text-purple-600">{stats.totalExpenses}</div>
        <div className="text-gray-600">{t('totalExpenses')}</div>
      </div>
    </div>
  );
}
```

### 4. API Routes

**File:** `/app/api/profile/stats/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await requireAuth();

  const stats = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      _count: {
        select: {
          trips: true,
        },
      },
      trips: {
        select: {
          shareToken: true,
          _count: {
            select: {
              expenses: true,
            },
          },
        },
      },
    },
  });

  const totalTrips = stats?._count.trips || 0;
  const sharedTrips = stats?.trips.filter(t => t.shareToken).length || 0;
  const totalExpenses = stats?.trips.reduce((sum, t) => sum + t._count.expenses, 0) || 0;

  return NextResponse.json({
    totalTrips,
    sharedTrips,
    totalExpenses,
  });
}
```

**File:** `/app/api/profile/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
});

export async function PATCH(request: NextRequest) {
  const session = await requireAuth();
  const body = await request.json();

  const validation = updateProfileSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json(
      { error: 'Invalid data', details: validation.error },
      { status: 400 }
    );
  }

  const { name, email } = validation.data;

  // Check if email is already taken
  if (email && email !== session.user.email) {
    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Email already in use' },
        { status: 400 }
      );
    }
  }

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name,
      email,
      emailVerified: email && email !== session.user.email ? null : undefined,
    },
  });

  return NextResponse.json({ user: updated });
}
```

**File:** `/app/api/profile/delete/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';

export async function DELETE() {
  const session = await requireAuth();

  // Delete user (cascade deletes trips, expenses, custom items, accounts, sessions)
  await prisma.user.delete({
    where: { id: session.user.id },
  });

  return NextResponse.json({ success: true });
}
```

## Translations

### messages/en.json

```json
{
  "profile": {
    "title": "Profile",
    "noName": "No name set",
    "accountSettings": "Account Settings",
    "editProfile": "Edit Profile",
    "save": "Save Changes",
    "cancel": "Cancel",
    "memberSince": "Member since",
    "stats": {
      "totalTrips": "Total Trips",
      "sharedTrips": "Shared Trips",
      "totalExpenses": "Expenses Tracked"
    },
    "connectedAccounts": {
      "title": "Connected Accounts",
      "google": "Google",
      "github": "GitHub",
      "email": "Email & Password",
      "disconnect": "Disconnect",
      "connect": "Connect"
    },
    "premium": {
      "badge": "Premium",
      "adminBadge": "Admin",
      "features": "Premium Features",
      "unlocked": "You have access to all premium features",
      "upgrade": "Upgrade to Premium"
    },
    "dangerZone": {
      "title": "Danger Zone",
      "deleteAccount": "Delete Account",
      "deleteWarning": "This will permanently delete your account and all associated data. This action cannot be undone.",
      "confirmDelete": "Type 'DELETE' to confirm",
      "deleteButton": "Delete My Account"
    }
  }
}
```

### messages/es.json

```json
{
  "profile": {
    "title": "Perfil",
    "noName": "Sin nombre",
    "accountSettings": "Configuración de Cuenta",
    "editProfile": "Editar Perfil",
    "save": "Guardar Cambios",
    "cancel": "Cancelar",
    "memberSince": "Miembro desde",
    "stats": {
      "totalTrips": "Viajes Totales",
      "sharedTrips": "Viajes Compartidos",
      "totalExpenses": "Gastos Registrados"
    },
    "connectedAccounts": {
      "title": "Cuentas Conectadas",
      "google": "Google",
      "github": "GitHub",
      "email": "Email y Contraseña",
      "disconnect": "Desconectar",
      "connect": "Conectar"
    },
    "premium": {
      "badge": "Premium",
      "adminBadge": "Admin",
      "features": "Funciones Premium",
      "unlocked": "Tienes acceso a todas las funciones premium",
      "upgrade": "Actualizar a Premium"
    },
    "dangerZone": {
      "title": "Zona de Peligro",
      "deleteAccount": "Eliminar Cuenta",
      "deleteWarning": "Esto eliminará permanentemente tu cuenta y todos los datos asociados. Esta acción no se puede deshacer.",
      "confirmDelete": "Escribe 'ELIMINAR' para confirmar",
      "deleteButton": "Eliminar Mi Cuenta"
    }
  }
}
```

## Implementation Order

1. **Create basic profile page** (30 min)
   - Create `/app/[locale]/profile/page.tsx`
   - Add basic layout with user info

2. **Add account stats** (20 min)
   - Create `AccountStats` component
   - Create `/api/profile/stats` endpoint
   - Display trips/expenses count

3. **Add edit functionality** (30 min)
   - Create edit form
   - Create PATCH `/api/profile` endpoint
   - Handle name/email updates

4. **Add connected accounts section** (20 min)
   - Display OAuth providers
   - Show connection status

5. **Add delete account** (20 min)
   - Create delete account section
   - Create DELETE `/api/profile/delete` endpoint
   - Add confirmation modal

6. **Translations** (10 min)
   - Add all translation keys
   - Test both EN and ES

**Total time: ~2 hours**

## Security Considerations

- ✅ Require authentication for all profile routes
- ✅ Users can only view/edit their own profile
- ✅ Email changes require re-verification
- ✅ Prevent deleting account if it's the last admin
- ✅ Cascade delete all user data on account deletion

## Testing Checklist

- [ ] Profile page loads for authenticated user
- [ ] 404 error is resolved
- [ ] Stats display correctly
- [ ] Can update name
- [ ] Can update email (triggers verification)
- [ ] Premium badge shows for premium users
- [ ] Admin badge shows for admins
- [ ] Delete account works with confirmation
- [ ] All text is translated in both languages
- [ ] Responsive design works on mobile

## Future Enhancements (Not in MVP)

- Avatar upload
- Timezone preference
- Preferred currency
- Email notification settings
- Export all data (GDPR compliance)
- Two-factor authentication

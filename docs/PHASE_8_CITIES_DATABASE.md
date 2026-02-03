# Phase 8 - Cities Database Migration

## Status: PLANNED

## Overview
Migrate city data from static TypeScript files to database storage with admin interface for easy management. This enables scaling the city catalog without code deployments.

## Current Problem

**Static TypeScript files (`/data/cities/*.ts`):**
- ❌ Requires code changes to add new cities
- ❌ Requires git commit + deployment
- ❌ No admin interface for editing
- ❌ Difficult to update prices
- ❌ Can't be managed by non-developers
- ❌ No versioning/history of price changes
- ❌ Hard to maintain as catalog grows

**Current structure:**
```typescript
// data/cities/barcelona.ts
export const barcelona: CityData = {
  id: 'barcelona',
  name: 'Barcelona',
  country: 'Spain',
  currency: 'EUR',
  dailyCosts: {
    budget: { accommodation: 30, food: 25, ... },
    // ...
  },
  transport: { ... },
  // ...
};
```

## Solution: Database-First Architecture

**Benefits:**
- ✅ Admin can add cities via web interface
- ✅ Update prices without deployment
- ✅ Track price history over time
- ✅ Enable community suggestions
- ✅ A/B test different price points
- ✅ Seasonal pricing variations
- ✅ Better SEO (dynamic sitemap)

---

## Database Schema

### Prisma Models

```prisma
model City {
  id          String   @id // URL slug: "barcelona", "new-york"
  name        String   // Display name: "Barcelona"
  country     String
  region      String?  // "Europe", "Asia", etc.

  // Currency
  currency       String  // ISO code: "EUR", "USD"
  currencySymbol String  // "€", "$"

  // Metadata
  language       String   // Primary language(s): "Spanish, Catalan"
  timezone       String   // "Europe/Madrid"
  population     Int?
  touristSeason  String?  // "Year-round", "Summer", etc.

  // SEO
  description    String?  @db.Text
  metaTitle      String?
  metaDescription String?

  // Media
  imageUrl       String?
  imageCredit    String?

  // Status
  isPublished    Boolean  @default(false)
  lastUpdated    String   // "2026-01" format

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  dailyCosts  CityDailyCost[]
  transport   CityTransport[]
  airports    CityAirport[]
  tips        CityTip[]
  cashInfo    CityCashInfo?

  @@index([country])
  @@index([isPublished])
}

model CityDailyCost {
  id     String @id @default(cuid())
  cityId String

  travelStyle String // "budget", "midRange", "luxury"

  // Daily costs (in cents)
  accommodation Int
  food          Int
  transport     Int
  activities    Int

  // Optional breakdown
  breakfast     Int?
  lunch         Int?
  dinner        Int?
  snacks        Int?

  validFrom  DateTime  @default(now())
  validUntil DateTime?

  city City @relation(fields: [cityId], references: [id], onDelete: Cascade)

  @@index([cityId, travelStyle])
  @@index([validFrom, validUntil])
}

model CityTransport {
  id     String @id @default(cuid())
  cityId String

  type String // "metro", "taxi", "uber", "bus", "tram"
  name String // "Metro Single Ticket", "Uber Pool"

  // Price (in cents)
  price     Int
  priceNote String? // "Per ride", "Per km", "Base fare"

  // Details
  description String? @db.Text
  tips        String? @db.Text
  bookingUrl  String?

  validFrom  DateTime  @default(now())
  validUntil DateTime?

  city City @relation(fields: [cityId], references: [id], onDelete: Cascade)

  @@index([cityId, type])
}

model CityAirport {
  id     String @id @default(cuid())
  cityId String

  code String // "BCN", "JFK"
  name String // "Barcelona El Prat"

  // Transfer options
  transfers Json // Array of transfer methods with prices

  city City @relation(fields: [cityId], references: [id], onDelete: Cascade)

  @@index([cityId])
}

model CityTip {
  id       String @id @default(cuid())
  cityId   String

  category String // "payment", "safety", "culture", "language"
  title    String
  content  String @db.Text

  order Int @default(0) // Display order

  city City @relation(fields: [cityId], references: [id], onDelete: Cascade)

  @@index([cityId, category])
}

model CityCashInfo {
  id     String @id @default(cuid())
  cityId String @unique

  cashNeeded       String // "low", "medium", "high"
  cardsAccepted    String // "widely", "most-places", "limited"
  atmAvailability  String // "everywhere", "common", "limited"

  recommendations  String @db.Text
  atmFees          String?
  bestExchange     String?

  city City @relation(fields: [cityId], references: [id], onDelete: Cascade)
}

// Price history tracking
model CityPriceHistory {
  id        String   @id @default(cuid())
  cityId    String
  category  String   // "dailyCost", "transport"
  field     String   // "accommodation", "metro"
  oldValue  Int
  newValue  Int
  reason    String?  // "Inflation", "User report", "Personal update"

  changedBy String   // User ID
  changedAt DateTime @default(now())

  @@index([cityId])
  @@index([changedAt])
}
```

---

## Migration Strategy

### Phase 1: Dual-Source Support (Backwards Compatible)

Keep both systems working during transition:

```typescript
// lib/cities/index.ts
import { getCityFromDatabase } from './database';
import { getCityFromFile } from './static';

export async function getCity(cityId: string): Promise<CityData> {
  // Try database first
  const dbCity = await getCityFromDatabase(cityId);
  if (dbCity) return dbCity;

  // Fallback to static files
  return getCityFromFile(cityId);
}

export async function getAllCities(): Promise<CityData[]> {
  const dbCities = await getCitiesFromDatabase();
  const fileCities = getCitiesFromFiles();

  // Merge, prioritizing database
  return [...dbCities, ...fileCities.filter(fc =>
    !dbCities.find(dc => dc.id === fc.id)
  )];
}
```

### Phase 2: Data Migration

Create seeder to migrate existing cities:

```typescript
// prisma/seed-cities.ts
import { prisma } from '../lib/db';
import * as staticCities from '../data/cities';

async function seedCities() {
  for (const [key, cityData] of Object.entries(staticCities)) {
    if (key === 'getCityById') continue; // Skip helper function

    // Create city
    const city = await prisma.city.create({
      data: {
        id: cityData.id,
        name: cityData.name,
        country: cityData.country,
        currency: cityData.currency,
        currencySymbol: cityData.currencySymbol,
        language: cityData.language,
        lastUpdated: cityData.lastUpdated,
        isPublished: true,
      },
    });

    // Create daily costs
    for (const [style, costs] of Object.entries(cityData.dailyCosts)) {
      await prisma.cityDailyCost.create({
        data: {
          cityId: city.id,
          travelStyle: style,
          accommodation: costs.accommodation * 100, // Convert to cents
          food: costs.food * 100,
          transport: costs.transport * 100,
          activities: costs.activities * 100,
        },
      });
    }

    // Create transport options
    for (const [type, options] of Object.entries(cityData.transport)) {
      for (const option of options) {
        await prisma.cityTransport.create({
          data: {
            cityId: city.id,
            type,
            name: option.name,
            price: option.price * 100,
            priceNote: option.note,
          },
        });
      }
    }

    // Create tips, airport, cash info...
  }
}
```

### Phase 3: Admin Interface

Build CRUD interface for cities.

### Phase 4: Remove Static Files

Once all cities are in DB and tested, remove `/data/cities/*.ts` files.

---

## Admin Interface

### Routes

```
/admin/cities
  GET  - List all cities (published + drafts)

/admin/cities/new
  GET  - Form to create new city
  POST - Create city

/admin/cities/[cityId]
  GET    - Edit city form
  PATCH  - Update city
  DELETE - Delete city

/admin/cities/[cityId]/costs
  GET    - Manage daily costs
  POST   - Add new cost tier
  PATCH  - Update cost

/admin/cities/[cityId]/transport
  GET    - Manage transport options
  POST   - Add transport option

/admin/cities/[cityId]/publish
  POST   - Publish/unpublish city
```

### Features

**City List Page:**
- Table with all cities
- Filters: Published, Country, Currency
- Search by name
- Quick actions: Edit, Duplicate, Delete
- "Add New City" button

**City Form:**
- Basic info: Name, Country, Currency, Language
- SEO fields: Meta title, description
- Image upload
- Daily costs editor (Budget/Mid/Luxury)
- Transport options manager
- Tips editor
- Cash info
- Airport transfers
- Save as Draft or Publish

**Daily Costs Editor:**
```
┌─────────────────────────────────────┐
│ Daily Costs - Barcelona             │
├─────────────────────────────────────┤
│ Travel Style: [Budget ▼]            │
│                                     │
│ Accommodation:  € [30.00]  /night  │
│ Food & Drinks:  € [25.00]  /day    │
│ Transport:      € [10.00]  /day    │
│ Activities:     € [15.00]  /day    │
│                                     │
│ Daily Total:    € 80.00            │
│                                     │
│ [Save] [Cancel]                     │
└─────────────────────────────────────┘
```

**Transport Options Manager:**
```
┌─────────────────────────────────────┐
│ Transport - Barcelona               │
├─────────────────────────────────────┤
│ ┌─ Metro ───────────────────────┐  │
│ │ Single Ticket    € 2.40       │  │
│ │ T-Casual (10)    € 11.35      │  │
│ │ [+ Add Option]                │  │
│ └───────────────────────────────┘  │
│                                     │
│ ┌─ Taxi ────────────────────────┐  │
│ │ Base Fare        € 2.50       │  │
│ │ Per Km           € 1.10       │  │
│ │ [+ Add Option]                │  │
│ └───────────────────────────────┘  │
│                                     │
│ [+ Add Category]                    │
└─────────────────────────────────────┘
```

---

## API Routes

### Public API (for site pages)

```typescript
// app/api/cities/route.ts
export async function GET() {
  const cities = await prisma.city.findMany({
    where: { isPublished: true },
    include: {
      dailyCosts: true,
      transport: true,
    },
  });

  return NextResponse.json({ cities });
}

// app/api/cities/[cityId]/route.ts
export async function GET(req, { params }) {
  const city = await prisma.city.findUnique({
    where: { id: params.cityId, isPublished: true },
    include: {
      dailyCosts: true,
      transport: true,
      airports: true,
      tips: true,
      cashInfo: true,
    },
  });

  return NextResponse.json({ city });
}
```

### Admin API (protected)

```typescript
// app/api/admin/cities/route.ts
import { requireAdmin } from '@/lib/auth-helpers';

export async function GET() {
  await requireAdmin();

  const cities = await prisma.city.findMany({
    include: {
      _count: {
        select: {
          dailyCosts: true,
          transport: true,
        },
      },
    },
    orderBy: { name: 'asc' },
  });

  return NextResponse.json({ cities });
}

export async function POST(request: NextRequest) {
  await requireAdmin();

  const data = await request.json();

  // Validate with Zod
  const validation = createCitySchema.safeParse(data);
  if (!validation.success) {
    return NextResponse.json(
      { error: 'Invalid data', details: validation.error },
      { status: 400 }
    );
  }

  // Create city
  const city = await prisma.city.create({
    data: validation.data,
  });

  return NextResponse.json({ city });
}

// app/api/admin/cities/[cityId]/route.ts
export async function PATCH(req, { params }) {
  await requireAdmin();

  const data = await req.json();

  const city = await prisma.city.update({
    where: { id: params.cityId },
    data,
  });

  return NextResponse.json({ city });
}

export async function DELETE(req, { params }) {
  await requireAdmin();

  await prisma.city.delete({
    where: { id: params.cityId },
  });

  return NextResponse.json({ success: true });
}
```

---

## Validation Schemas

```typescript
// lib/validations/city.ts
import { z } from 'zod';

export const citySchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/), // URL slug
  name: z.string().min(2).max(100),
  country: z.string().min(2).max(100),
  region: z.string().optional(),

  currency: z.string().length(3), // ISO code
  currencySymbol: z.string().max(5),

  language: z.string(),
  timezone: z.string().optional(),
  population: z.number().positive().optional(),
  touristSeason: z.string().optional(),

  description: z.string().optional(),
  metaTitle: z.string().max(60).optional(),
  metaDescription: z.string().max(160).optional(),

  imageUrl: z.string().url().optional(),
  imageCredit: z.string().optional(),

  isPublished: z.boolean().default(false),
  lastUpdated: z.string().regex(/^\d{4}-\d{2}$/), // YYYY-MM
});

export const dailyCostSchema = z.object({
  travelStyle: z.enum(['budget', 'midRange', 'luxury']),
  accommodation: z.number().positive(),
  food: z.number().positive(),
  transport: z.number().positive(),
  activities: z.number().positive(),
});

export const transportSchema = z.object({
  type: z.string(),
  name: z.string(),
  price: z.number().positive(),
  priceNote: z.string().optional(),
  description: z.string().optional(),
  tips: z.string().optional(),
  bookingUrl: z.string().url().optional(),
});
```

---

## Components

### Admin City List

```typescript
// components/admin/CityList.tsx
'use client';

export default function CityList() {
  const [cities, setCities] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all', 'published', 'draft'

  useEffect(() => {
    fetch('/api/admin/cities')
      .then(res => res.json())
      .then(data => setCities(data.cities));
  }, []);

  const filteredCities = cities.filter(city => {
    if (filter === 'published') return city.isPublished;
    if (filter === 'draft') return !city.isPublished;
    return true;
  });

  return (
    <div>
      <div className="flex justify-between mb-4">
        <h1>Cities ({filteredCities.length})</h1>
        <Link href="/admin/cities/new">
          <button>+ Add New City</button>
        </Link>
      </div>

      <div className="filters mb-4">
        <button onClick={() => setFilter('all')}>All</button>
        <button onClick={() => setFilter('published')}>Published</button>
        <button onClick={() => setFilter('draft')}>Drafts</button>
      </div>

      <table>
        <thead>
          <tr>
            <th>City</th>
            <th>Country</th>
            <th>Currency</th>
            <th>Status</th>
            <th>Last Updated</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredCities.map(city => (
            <CityRow key={city.id} city={city} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

### City Form

```typescript
// components/admin/CityForm.tsx
'use client';

export default function CityForm({ city = null }) {
  const router = useRouter();
  const [formData, setFormData] = useState(city || {
    id: '',
    name: '',
    country: '',
    currency: 'EUR',
    currencySymbol: '€',
    // ...
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const url = city
      ? `/api/admin/cities/${city.id}`
      : '/api/admin/cities';

    const method = city ? 'PATCH' : 'POST';

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    if (response.ok) {
      router.push('/admin/cities');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h1>{city ? 'Edit City' : 'New City'}</h1>

      {/* Basic Info */}
      <section>
        <h2>Basic Information</h2>
        <input
          type="text"
          placeholder="URL slug (e.g., new-york)"
          value={formData.id}
          onChange={(e) => setFormData({ ...formData, id: e.target.value })}
          disabled={!!city} // Can't change ID
        />
        <input
          type="text"
          placeholder="City name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
        {/* More fields... */}
      </section>

      {/* Daily Costs */}
      <section>
        <h2>Daily Costs</h2>
        <DailyCostsEditor
          costs={formData.dailyCosts}
          onChange={(costs) => setFormData({ ...formData, dailyCosts: costs })}
        />
      </section>

      {/* Actions */}
      <div>
        <button type="submit">Save</button>
        <button type="button" onClick={() => router.back()}>Cancel</button>
      </div>
    </form>
  );
}
```

---

## Implementation Plan

### Week 1: Database Schema & Migration (15 hours)
- [ ] Create Prisma models for cities
- [ ] Generate migration
- [ ] Create seed script to migrate existing cities
- [ ] Test database queries
- [ ] Create city service layer (lib/cities/database.ts)

### Week 2: Dual-Source Support (10 hours)
- [ ] Create unified getCity() function
- [ ] Support both DB and file sources
- [ ] Update all city pages to use new function
- [ ] Add feature flag for gradual rollout
- [ ] Testing & validation

### Week 3: Admin Interface - List & View (12 hours)
- [ ] Create /admin/cities page
- [ ] City list table with filters
- [ ] Search functionality
- [ ] Publish/unpublish toggle
- [ ] Delete confirmation

### Week 4: Admin Interface - Create & Edit (15 hours)
- [ ] City creation form
- [ ] City edit form
- [ ] Daily costs editor component
- [ ] Transport options manager
- [ ] Tips editor
- [ ] Image upload (optional)

### Week 5: Advanced Features (10 hours)
- [ ] Price history tracking
- [ ] Bulk import (CSV)
- [ ] Duplicate city feature
- [ ] Validation & error handling
- [ ] Success notifications

### Week 6: Testing & Cleanup (8 hours)
- [ ] Full admin workflow testing
- [ ] Performance optimization
- [ ] Remove static files (if ready)
- [ ] Documentation
- [ ] Deploy to production

**Total: ~70 hours (~3 weeks full-time)**

---

## Risks & Mitigations

### Risk 1: Data Loss During Migration
**Mitigation:**
- Keep static files as backup during transition
- Dual-source system allows rollback
- Comprehensive testing before removing files

### Risk 2: Breaking Existing Pages
**Mitigation:**
- Dual-source approach maintains compatibility
- Feature flag for gradual rollout
- Extensive testing on staging

### Risk 3: Performance Issues
**Mitigation:**
- Database queries are fast (indexed properly)
- Implement caching layer if needed
- Static generation still works with DB

### Risk 4: Admin Learning Curve
**Mitigation:**
- Intuitive UI with clear labels
- Tooltips and help text
- Pre-filled templates
- Documentation/video guide

---

## Future Enhancements

### Phase 8.1: Community Contributions
- Public suggestion form
- Users submit price updates
- Admin review queue
- Reputation system

### Phase 8.2: Price Intelligence
- Track price changes over time
- Inflation adjustments
- Seasonal variations
- Price alerts for significant changes

### Phase 8.3: Multi-Currency Support
- Display prices in user's currency
- Real-time exchange rates
- Currency conversion API

### Phase 8.4: City Comparison
- Compare costs between cities
- Visual charts
- "Similar cities" suggestions

---

## Success Metrics

- **Admin Efficiency:** Add new city in <10 minutes
- **Data Quality:** 0 broken pages after migration
- **Performance:** Page load <2s (same as static)
- **Adoption:** 10+ new cities added in first month

---

**Last Updated:** 2026-01-30
**Status:** Ready for implementation

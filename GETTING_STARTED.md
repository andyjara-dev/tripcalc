# Getting Started with TripCalc

## Quick Start

### Option 1: Local Development (Node.js)

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Visit: http://localhost:3000

### Option 2: Docker

```bash
# Build and start with Docker Compose
npm run docker:up

# View logs
npm run docker:logs

# Stop
npm run docker:down
```

Visit: http://localhost:3000

For complete Docker documentation, see [DOCKER.md](DOCKER.md)

## Available Languages

- http://localhost:3000/en - English
- http://localhost:3000/es - Spanish

The root URL (/) will auto-redirect based on your browser language.

## Project Structure

```
tripcalc/
├── app/[locale]/          # Pages (multi-language)
│   ├── page.tsx           # Homepage
│   ├── about/page.tsx     # About page
│   └── layout.tsx         # Root layout
├── messages/              # Translations
│   ├── en.json            # English
│   └── es.json            # Spanish
├── data/cities/           # City data
│   ├── types.ts           # TypeScript interfaces
│   ├── barcelona.ts       # Example: Barcelona data
│   └── index.ts           # Export all cities
├── components/            # React components (to be created)
└── lib/                   # Utilities (to be created)
```

## Next Steps

### 1. Add a New City

Create a file in `data/cities/`, for example `tokyo.ts`:

```typescript
import { CityData } from './types';

export const tokyo: CityData = {
  id: 'tokyo',
  name: 'Tokyo',
  country: 'Japan',
  currency: 'JPY',
  currencySymbol: '¥',
  language: 'Japanese',
  transport: {
    metro: {
      singleTicket: 180,
      dayPass: 800
    },
    // ... more data
  },
  // ... rest of the data
  lastUpdated: '2026-01'
};
```

Then export it in `data/cities/index.ts`:

```typescript
import { tokyo } from './tokyo';

export const cities: Record<string, CityData> = {
  barcelona,
  tokyo  // Add here
};
```

### 2. Create City Pages

Create `app/[locale]/cities/[city]/page.tsx` to show individual city data.

### 3. Build Calculators

Create calculator components in `components/calculators/`:
- `DailyCostCalculator.tsx`
- `TransportComparator.tsx`
- `AirportTransferCalculator.tsx`

### 4. Add Translations

Update `messages/en.json` and `messages/es.json` with new text.

## Build for Production

```bash
npm run build
```

## Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Or connect your GitHub repo to Vercel for automatic deployments.

## Tech Stack

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Styling
- **next-intl** - Internationalization (i18n)
- **Vercel** - Deployment (recommended)

## Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

## Documentation

See `claude.md` for complete project documentation.

---

Happy coding! 🚀

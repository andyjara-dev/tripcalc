# TripCalc - Project Documentation for Claude

## Project Overview

**TripCalc** (tripcalc.site) is a practical travel cost calculator platform that helps travelers answer: "How much does a trip really cost?"

Unlike typical travel blogs focused on inspiration, TripCalc provides structured data, calculators, and real-world insights based on actual travel experience.

## Core Philosophy

- **Real data over generic averages**: All costs based on actual experience
- **Practical tools, not inspiration**: Focus on numbers and decisions
- **Accuracy over hype**: Small, verified dataset that grows over time
- **No surprises**: Help travelers budget confidently

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **i18n**: next-intl (English primary, Spanish secondary)
- **Data**: Structured TypeScript/JSON files (no database initially)
- **Deployment**: Vercel (free tier)
- **Cost**: $0 to start, designed for minimal resources

## Project Structure

```
tripcalc/
├── app/[locale]/              # Next.js pages with i18n
│   ├── layout.tsx             # Root layout
│   ├── page.tsx               # Homepage
│   ├── about/                 # About page
│   ├── cities/                # City pages
│   │   └── [city]/            # Dynamic city routes
│   │       ├── page.tsx       # City overview + daily cost calc
│   │       ├── transport/     # Transport comparisons
│   │       └── airport/       # Airport transfers
│   └── calculators/           # Standalone calculators
├── messages/                  # Translation files
│   ├── en.json                # English (default)
│   └── es.json                # Spanish
├── data/                      # Structured data
│   └── cities/                # City data files
│       ├── types.ts           # TypeScript interfaces
│       ├── barcelona.ts       # Example city data
│       └── index.ts           # City exports
├── components/                # React components
│   ├── calculators/           # Calculator components
│   └── ui/                    # Reusable UI
├── lib/                       # Utilities
│   ├── calculations.ts        # Calculation logic
│   └── utils.ts               # Helper functions
└── public/                    # Static assets

```

## Data Architecture

### City Data Structure

Each city is a TypeScript file exporting a `CityData` object:

```typescript
interface CityData {
  id: string;              // URL-safe identifier
  name: string;            // Display name
  country: string;
  currency: string;        // ISO code (EUR, USD, JPY)
  currencySymbol: string;  // Symbol (€, $, ¥)
  language: string;        // Primary language(s)
  transport: TransportPrices;
  dailyCosts: DailyCosts;
  tips: TipsInfo;
  cash: CashInfo;
  lastUpdated: string;     // YYYY-MM format
}
```

**Key principle**: Numbers and prices are NOT translated (universal). Only UI text and descriptions are translated.

### Why No Database Initially?

- Zero cost
- Version controlled (Git)
- Fast builds (static generation)
- Easy to maintain manually
- Can migrate to database later without refactoring

## Internationalization (i18n)

### Strategy

- **Primary language**: English (largest audience)
- **Secondary language**: Spanish (maintainer's native language)
- **Future languages**: French, German, Portuguese (community-driven)

### What Gets Translated

- UI elements (buttons, labels, navigation)
- Page content (titles, descriptions, explanations)
- SEO metadata (titles, descriptions)

### What Doesn't Get Translated

- City names (universal)
- Prices and numbers (universal)
- Currency codes (ISO standard)
- Data structure keys

### URL Structure

- `/en/` - English pages
- `/es/` - Spanish pages
- `/` - Auto-redirects based on browser language

## Development Principles

### Keep It Simple

- Start with core features only
- Add cities gradually (quality over quantity)
- No premature optimization
- No unnecessary abstractions

### Maintainability

- One person should be able to maintain this
- Clear, documented code
- Consistent patterns
- Minimal dependencies

### Scalability Path

**Phase 1** (Current): Static site, manual data, ~10-15 cities
**Phase 2**: Add more cities, basic analytics, affiliate links
**Phase 3**: Community contributions, moderation system
**Phase 4**: Database migration, user accounts, API

## Key Features to Build

### Core Calculators (Priority)

1. **Daily Cost Estimator**: Budget/Mid-range/Luxury breakdown
2. **Transport Comparator**: Metro vs Taxi vs Uber vs Walking
3. **Airport Transfer Calculator**: Best route from airport to city center
4. **Cash Planner**: How much cash to carry based on trip length

### Content (Supporting)

1. **City Overview Pages**: Quick facts, when to visit, local tips
2. **Hidden Costs Guide**: ATM fees, tourist taxes, tipping culture
3. **Payment Methods**: Where cards work, where cash is needed

## SEO Strategy

### Target Queries

- "how much does [city] cost per day"
- "[city] daily budget"
- "cost of living in [city] for tourists"
- "[city] airport to city center cost"
- "uber vs taxi [city]"

### Content Structure

- Clear H1/H2 hierarchy
- Structured data (JSON-LD for FAQ, HowTo)
- Fast loading (static generation)
- Mobile-first design

## Monetization Roadmap (Future)

### Phase 1: Free (Build Audience)

- All calculators free
- No ads initially
- Focus on SEO and quality content

### Phase 2: Passive Income

- Affiliate links (Booking.com, Get Your Guide)
- Travel insurance referrals
- SIM card affiliate programs
- Google AdSense (non-intrusive)

### Phase 3: Premium Features

- Downloadable trip budget PDFs
- Offline mobile app
- Premium city guides with ultra-detailed data
- API access for travel apps

### Phase 4: Scale

- Community contributions (moderated)
- User accounts and saved trips
- Expense tracking during trip
- Real-time price updates via API

## File Naming Conventions

- **Pages**: `kebab-case.tsx` (e.g., `daily-cost.tsx`)
- **Components**: `PascalCase.tsx` (e.g., `DailyCostCalculator.tsx`)
- **Data files**: `lowercase.ts` (e.g., `barcelona.ts`)
- **Utils**: `camelCase.ts` (e.g., `calculations.ts`)

## Component Patterns

### Calculators

- Self-contained components
- Accept city data as props
- Return calculated results
- Reusable across different pages
- Client components (interactive)

### Layout

- Server components by default
- Client components only when needed (forms, interactions)
- Shared header/footer in root layout

## Git Workflow

- `main` branch: Production-ready code
- Feature branches: `feature/calculator-name`
- Data updates: `data/add-tokyo` or `data/update-barcelona`
- Commit often with clear messages

## Testing Strategy (Future)

- Calculator logic unit tests
- Data validation tests
- E2E tests for critical paths
- Manual testing for data accuracy

## Analytics (Future)

- Vercel Analytics (built-in)
- Google Analytics 4 (optional)
- Track: Popular cities, calculator usage, conversion paths

## Performance Goals

- Lighthouse score: 95+ on all metrics
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3s
- Mobile-first, fast on 3G

## Accessibility

- WCAG 2.1 AA compliance
- Semantic HTML
- Keyboard navigation
- Screen reader friendly
- High contrast mode support

## Important Notes

### When Adding New Cities

1. Verify all prices personally or from trusted sources
2. Include `lastUpdated` field (YYYY-MM format)
3. Document data sources in commit message
4. Add basic translations if needed
5. Test calculators with real scenarios

### When Updating Prices

- Mark `lastUpdated` field
- Document reason for change in commit
- Consider seasonal variations
- Note any major currency fluctuations

### Content Guidelines

- Write in clear, simple English
- Avoid travel blog clichés
- Focus on practical information
- Include specific numbers, not ranges
- Cite personal experience when possible

## Common Patterns

### Reading City Data

```typescript
import { getCityById } from '@/data/cities';

const city = getCityById('barcelona');
```

### Using Translations

```typescript
import { useTranslations } from 'next-intl';

const t = useTranslations('calculator');
const label = t('accommodation'); // "Accommodation" or "Alojamiento"
```

### Type Safety

- All city data uses `CityData` interface
- Translations are type-safe with next-intl
- No `any` types unless absolutely necessary

## Deployment

### Option 1: Vercel (Recommended for Simplicity)

1. Connect GitHub repo to Vercel
2. Auto-deploy on push to `main`
3. Preview deployments for PRs
4. Environment variables in Vercel dashboard
5. Free tier: Generous bandwidth, serverless functions

### Option 2: Docker (Recommended for Flexibility)

The project is fully containerized and can be deployed anywhere Docker runs.

**Quick Start:**
```bash
# Build and run with Docker Compose
npm run docker:up

# Or using Docker CLI
npm run docker:build
npm run docker:run
```

**Deploy to:**
- Cloud platforms: AWS ECS, Google Cloud Run, Azure Container Instances
- VPS: DigitalOcean, Linode, Vultr, Hetzner ($5-10/month)
- Container registries: Docker Hub, AWS ECR, Google Container Registry
- Kubernetes clusters (if scaling significantly)

**Docker Architecture:**
- Multi-stage build for optimal size (~200MB final image)
- Alpine Linux base (minimal attack surface)
- Non-root user for security
- Standalone output (only necessary files)

See [DOCKER.md](DOCKER.md) for complete Docker deployment guides.

### Environment Variables

- `NEXT_PUBLIC_SITE_URL`: Base URL (https://tripcalc.site)
- `NODE_ENV`: production/development
- Future: API keys for exchange rates, analytics, etc.

### Cost Comparison

- **Vercel**: $0 (free tier) - Best for starting out
- **Docker on VPS**: $5-10/month - More control, fixed cost
- **Cloud Run/ECS**: Pay per use - Good for variable traffic
- **Kubernetes**: $30+/month - Only if significant scale

## Future Considerations

### Database Migration

When dataset grows beyond ~50 cities:

- **Option 1**: Supabase (PostgreSQL, free tier generous)
- **Option 2**: Neon (serverless PostgreSQL)
- **Option 3**: PlanetScale (MySQL, generous free tier)

Keep current TypeScript interfaces, migrate data to tables.

### API

If other apps want to consume data:

- Create `/api/cities` endpoint
- Rate limiting (Vercel Edge)
- Optional API keys for heavy usage

### User Contributions

When ready for community data:

- GitHub PR workflow (low-tech, works)
- Or: Submission form → manual review → merge
- Or: User accounts + moderation system (much later)

## Links

- **Production**: https://tripcalc.site
- **Repository**: (TBD)
- **Documentation**: This file (claude.md)

---

**Last Updated**: 2026-01-27
**Project Status**: Initial setup complete
**Next Steps**: Build core calculators, add 3-5 more cities

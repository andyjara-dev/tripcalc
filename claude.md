# TripCalc - Project Documentation for Claude

## Project Overview

**TripCalc** (tripcalc.site) is a practical travel cost calculator platform that helps travelers answer: "How much does a trip really cost?"

Unlike typical travel blogs focused on inspiration, TripCalc provides structured data, calculators, and real-world insights based on actual travel experience.

## Core Philosophy

- **Real data over generic averages**: All costs based on actual experience
- **Practical tools, not inspiration**: Focus on numbers and decisions
- **Accuracy over hype**: Small, verified dataset that grows over time
- **No surprises**: Help travelers budget confidently

## UI/UX Design Principles

### ⚠️ CRITICAL: Text Contrast and Readability

**This is a RECURRING issue that MUST be prevented:**

#### ALWAYS Ensure Sufficient Text Contrast

1. **Light backgrounds (white, gray-50, gray-100) MUST use dark text:**
   ```tsx
   // ✅ CORRECT
   <input className="bg-white text-gray-900 border border-gray-300" />
   <div className="bg-gray-50 text-gray-900">Content</div>

   // ❌ WRONG - Text will be invisible or hard to read
   <input className="bg-white border border-gray-300" /> // Missing text-gray-900
   <div className="bg-gray-50 text-gray-400">Content</div> // Too light
   ```

2. **Dark backgrounds (gray-800, gray-900, black) MUST use light text:**
   ```tsx
   // ✅ CORRECT
   <button className="bg-gray-900 text-white">Button</button>
   <div className="bg-gray-800 text-gray-100">Content</div>

   // ❌ WRONG
   <button className="bg-gray-900">Button</button> // Missing text-white
   ```

3. **Standard text color hierarchy:**
   - Primary text: `text-gray-900` (darkest)
   - Secondary text: `text-gray-700`
   - Tertiary/hint text: `text-gray-600`
   - Disabled text: `text-gray-400`
   - **NEVER use text-gray-300 or lighter on white backgrounds**

4. **All form inputs MUST explicitly set both background and text color:**
   ```tsx
   // ✅ CORRECT - Explicit colors
   <input
     className="bg-white text-gray-900 border border-gray-300
                focus:ring-2 focus:ring-blue-500"
   />

   // ❌ WRONG - Relying on defaults
   <input className="border border-gray-300 focus:ring-2 focus:ring-blue-500" />
   ```

5. **Before creating ANY new component with text:**
   - Ask: "Is the text color dark enough (gray-900/gray-800) on light backgrounds?"
   - Ask: "Is the text color light enough (white/gray-100) on dark backgrounds?"
   - Test: Can you read the text clearly without squinting?

6. **Common places where this issue occurs:**
   - Form inputs (input, select, textarea)
   - Dropdown menus
   - Modal content
   - Cards with light backgrounds
   - Placeholder text (should be gray-500 minimum)

#### Checklist Before Submitting Code

- [ ] All inputs have `text-gray-900` and `bg-white` on light backgrounds
- [ ] All text on light backgrounds uses `text-gray-900`, `text-gray-800`, or `text-gray-700`
- [ ] No text uses `text-gray-300` or lighter on white/light backgrounds
- [ ] Placeholder text is at least `text-gray-500`
- [ ] Dark mode (if applicable) uses `text-white` or `text-gray-100` on dark backgrounds

#### WCAG Compliance

- **Minimum contrast ratio**: 4.5:1 for normal text
- **Large text**: 3:1 for 18pt+ or 14pt+ bold
- **Interactive elements**: 3:1 for borders and focus indicators

**If in doubt, always use `text-gray-900` on light backgrounds.**

---

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

Required:
- `DATABASE_URL`: Supabase PostgreSQL connection string
- `NEXTAUTH_URL`: Base URL (http://localhost:3000 or production URL)
- `NEXTAUTH_SECRET`: JWT encryption secret (generate with openssl)
- `EMAIL_SERVER`: SMTP server for magic links (Resend recommended)
- `EMAIL_FROM`: Sender email address

Optional:
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`: Google OAuth
- `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET`: GitHub OAuth
- `NEXT_PUBLIC_SITE_URL`: Public site URL
- Future: API keys for exchange rates, analytics, etc.

### Cost Comparison

- **Vercel**: $0 (free tier) - Best for starting out
- **Docker on VPS**: $5-10/month - More control, fixed cost
- **Cloud Run/ECS**: Pay per use - Good for variable traffic
- **Kubernetes**: $30+/month - Only if significant scale

## User System & Database (Phase 1 Complete ✅)

The project now includes a complete user authentication and database system:

### Stack
- **Database**: Supabase (PostgreSQL via Prisma ORM)
- **Auth**: NextAuth.js v5 with email, Google, and GitHub providers
- **Validation**: Zod for runtime type safety
- **Sessions**: Database-backed, 30-day expiration

### Features Implemented
- User authentication (email magic link + OAuth)
- Database schema for users, trips, custom items, and expenses
- Session management with secure cookies
- Fully translated UI (EN + ES)
- User menu with profile and trips access

### Getting Started
See `SETUP_AUTH.md` for complete setup instructions:
1. Create Supabase project
2. Configure environment variables
3. Run migrations: `npm run db:migrate`
4. Start dev server: `npm run dev`

### Database Commands
```bash
npm run db:generate      # Generate Prisma client
npm run db:migrate       # Run migrations (dev)
npm run db:studio        # Open Prisma Studio
npm run db:reset         # Reset database (dev only)
```

### Documentation
- `SETUP_AUTH.md` - Step-by-step setup guide
- `IMPLEMENTATION_STATUS.md` - Detailed implementation status
- `PHASE1_COMPLETE.md` - Phase 1 summary and next steps

### Next Features (Upcoming Phases)
- Phase 2: Save trips from calculators
- Phase 3: Customize trip costs
- Phase 4: Add custom budget items
- Phase 5: Track real expenses
- Phase 6: Share trips and export PDF

## Future Considerations

### Database Status

✅ **Already Implemented**: Supabase (PostgreSQL via Prisma)
- User accounts and authentication
- Trip storage with calculator state
- Custom items and expense tracking
- Ready for ~10k users on free tier

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

## Quick Commands

```bash
# Development
npm run dev
npm run build

# Database
npm run db:generate       # Generate Prisma client
npm run db:migrate        # Run migrations
npm run db:studio         # Open Prisma Studio
npm run db:reset          # Reset database (dev only)

# Docker
./scripts/deploy.sh              # Deploy to production
./scripts/check-health.sh        # Health check
./scripts/backup.sh              # Backup
./scripts/fix-port-conflict.sh   # Fix port issues

# Monitoring
docker logs -f tripcalc-prod
docker stats tripcalc-prod
```

## Links

- **Production**: https://tripcalc.site
- **Documentation**:
  - CLAUDE.md (this file) - Complete project docs
  - SETUP_AUTH.md - Authentication setup guide
  - PHASE1_COMPLETE.md - User system implementation summary
  - IMPLEMENTATION_STATUS.md - Detailed implementation status
  - DEPLOYMENT_VPS.md - VPS deployment guide
  - scripts/README.md - Scripts documentation

## Weather Integration (Phase 2 Complete ✅)

### Weather Forecast & Alerts

The project now includes weather integration with extreme weather alerts:

#### Stack
- **API**: Open-Meteo (free, no API key, 10k calls/day)
- **Data**: Historical (80+ years) + Forecast (16 days)
- **Cache**: HTTP cache (1 hour s-maxage, 2 hours stale-while-revalidate)
- **Cost**: $0

#### Features Implemented
- Weather forecast display in trip detail pages
- 3-level alert system:
  - 🔴 Red (Severe): Thunderstorms with hail, extreme cold/heat, freezing rain, blizzards
  - 🟠 Orange (Dangerous): Heavy rain/snow, dangerous temperatures
  - 🟡 Yellow (Caution): Moderate conditions with high precipitation
- Alert modal with detailed recommendations
- Automatic detection based on WMO weather codes
- Geolocation coordinates in all city data

#### Key Files
- `/lib/weather/open-meteo.ts` - Weather API integration
- `/lib/weather/weather-alerts.ts` - Alert detection logic
- `/app/api/weather/route.ts` - Next.js API endpoint
- `/components/trips/WeatherCard.tsx` - Weather display component
- `/components/trips/WeatherAlertModal.tsx` - Alert details modal
- `/data/cities/*.ts` - All cities now have latitude/longitude

## Analytics System (Phase 2 Complete ✅)

### Tracking & Insights

Complete analytics system for understanding user behavior:

#### Stack
- **Database**: Supabase (PostgreSQL via Prisma)
- **Tracking**: Custom implementation with session management
- **Geolocation**: Vercel headers + ipapi.co fallback
- **Privacy**: GDPR compliant (hashed IPs, no PII)
- **Cost**: $0 (included in Supabase free tier)

#### Features Implemented
- Automatic pageview tracking
- Time on page measurement
- 20+ custom event types
- Session management (30-day persistence)
- Anonymous ID tracking
- Geolocation by IP (country, city, region)
- Admin dashboard with comprehensive metrics

#### Events Tracked
**Authentication:**
- user_signup, user_login, user_logout

**Trips:**
- trip_created, trip_viewed, trip_updated, trip_deleted
- trip_shared, trip_exported_pdf, trip_exported_ical

**Weather:**
- weather_card_viewed, weather_alert_shown, weather_alert_clicked

**Calculators:**
- calculator_used, calculator_city_selected, calculator_style_changed

**Expenses:**
- expense_added, expense_updated, expense_deleted

**UI Interactions:**
- accordion_expanded, dropdown_opened, modal_opened

**Costs:**
- costs_customized, costs_reset_to_default

#### Admin Dashboard
Access: `/admin/analytics` (admin users only)

**Metrics Available:**
- Overview: Total pageviews, unique sessions, total events, events per session
- Top events, pages, and countries
- Trip metrics: created/viewed/shared/exported, share rate, export rate
- Engagement: UI interactions, average time on page
- Weather: card views, alert CTR, alert effectiveness
- Date range filters (7d, 30d, 90d, 1y, custom)
- Recent events table

#### Key Files
**Backend:**
- `/prisma/schema.prisma` - AnalyticsEvent & AnalyticsPageview models
- `/lib/analytics/events.ts` - Event types and sanitization
- `/lib/analytics/geolocation.ts` - IP geolocation utilities
- `/app/api/analytics/track/route.ts` - API endpoint

**Frontend:**
- `/hooks/useAnalytics.ts` - React hook for tracking
- `/components/analytics/AnalyticsProvider.tsx` - Context provider
- `/app/[locale]/layout.tsx` - Global integration

**Dashboard:**
- `/app/[locale]/admin/analytics/page.tsx` - Main dashboard
- `/app/[locale]/admin/analytics/components/` - Dashboard components

## UI Improvements (Phase 2 Complete ✅)

### Simplified Trip View

- **Header**: Reduced from 5 buttons to 2 (dropdown menu + save)
- **Sections**: Converted to collapsible accordions (daily planning, expenses, summary)
- **Layout**: Changed from 2-column grid to vertical stack (better mobile UX)
- **Weather**: Integrated weather card with alerts
- **Result**: 60% less visual clutter, all functionality preserved

## Roadmap & Next Steps

### Recent Fixes Completed (2026-02-10)

✅ **Docker Build & Deployment Issues**
   - Fixed NextAuth v5 API compatibility (auth() vs getServerSession)
   - Fixed Prisma type casting for JSON fields
   - Fixed TypeScript compilation errors for production build
   - Added DNS configuration (8.8.8.8, 8.8.4.4) for external API access
   - Successfully building and deploying on VPS with Docker

✅ **UI/UX Improvements**
   - Fixed text contrast issues in analytics dashboard (removed dark: classes)
   - Fixed invisible text in trip views
   - All text now properly visible on light backgrounds

✅ **Weather API Enhancements**
   - Implemented date range validation (16-day forecast limit)
   - Added automatic date adjustment when beyond forecast range
   - Improved error handling with descriptive user-facing messages
   - Added visual error display (yellow warning card) instead of silent failure
   - Added translations for error messages (EN + ES)

✅ **Geolocation & Analytics**
   - Implemented ipapi.co fallback for Docker/VPS environments
   - Added country flag utilities
   - Enhanced analytics dashboard with country statistics
   - Fixed geolocation for non-Vercel deployments (nginx proxy manager support)

### Immediate Priorities

1. **Fix Remaining Console Errors** (1-2h) 🔴 HIGH PRIORITY
   - Fix "useAnalytics must be used within AnalyticsProvider" errors
   - Fix "INVALID_MESSAGE" next-intl translation errors
   - Verify Nginx Proxy Manager headers (X-Real-IP, X-Forwarded-For)
   - Remove debug console.logs from production code

2. **Add More Tracking Events** (1-2h)
   - TripView: edit, delete, day added/removed
   - Auth pages: signup success, login success
   - Calculators: all calculator interactions
   - Packing: list generated, saved, edited

3. **Enhanced Analytics** (2-3h)
   - Funnel analysis (calculator → trip saved → expenses tracked)
   - Cohort analysis (retention over time)
   - Export analytics data (CSV/JSON)
   - Real-time dashboard updates

4. **Weather Enhancements** (2-3h)
   - Email notifications for severe alerts (opt-in)
   - Push notifications (PWA)
   - Historical weather data display
   - Weather-based packing recommendations (integrate with luggage)

### Medium Term (1-2 weeks)

4. **Performance Optimizations**
   - Analytics batching (reduce API calls)
   - Redis cache for weather data (if traffic scales)
   - Database query optimization
   - Image optimization

5. **User Engagement**
   - A/B testing framework
   - User feedback system
   - In-app notifications
   - User preferences (notification settings, units)

6. **Content Expansion**
   - Add 5-10 more cities
   - City comparison tool
   - Regional guides (e.g., "Southeast Asia", "Europe")
   - Seasonal cost variations

### Long Term (1-3 months)

7. **Monetization**
   - Affiliate links (Booking.com, GetYourGuide)
   - Premium features (advanced analytics, PDF exports, email alerts)
   - Sponsored city content
   - API access for travel apps

8. **Community Features**
   - User reviews and tips
   - Photo uploads
   - Community-submitted prices
   - Moderation system

9. **Advanced Features**
   - Multi-city trips
   - Group trip planning
   - Real-time collaboration
   - Mobile app (React Native)

### Technical Debt & Maintenance

- **Regular Updates**:
  - City prices (quarterly review)
  - Currency exchange rates
  - Weather API reliability monitoring
  - Analytics data cleanup (old data archival)

- **Testing**:
  - Unit tests for critical business logic
  - E2E tests for calculators
  - Analytics accuracy verification
  - Performance benchmarks

- **Documentation**:
  - API documentation (if opened to public)
  - User guides
  - Video tutorials
  - Blog posts about features

## Known Issues & Limitations

### 🔴 Active Issues (Need Attention)

1. **Console Errors in Production**:
   - "useAnalytics must be used within AnalyticsProvider" - Some components trying to use analytics outside provider context
   - "INVALID_MESSAGE" - Missing next-intl translation keys
   - Geolocation API occasionally timing out on first request
   - Some components still have debug console.log statements

2. **Nginx Proxy Manager Configuration**:
   - Headers (X-Real-IP, X-Forwarded-For) need verification for accurate geolocation
   - May need custom Advanced configuration for proper IP forwarding

### ⚠️ Feature Limitations (By Design)

3. **Analytics**:
   - No real-time updates (requires page refresh)
   - No user journey visualization yet
   - Limited to 30-day date ranges (performance)

4. **Weather**:
   - Only shows forecast/historical (no current conditions)
   - 16-day forecast limit (Open-Meteo API constraint)
   - Alert thresholds are conservative (may need tuning based on user feedback)
   - No wind speed data

5. **General**:
   - No offline support yet (PWA not implemented)
   - Limited to 6 cities currently (Barcelona, Tokyo, New York, London, Paris, Mexico City)
   - No mobile app (web-only)
   - Single currency per city (no automatic conversion)

## Quick Commands

```bash
# Development
npm run dev
npm run build

# Database
npm run db:generate       # Generate Prisma client
npm run db:migrate        # Run migrations
npm run db:studio         # Open Prisma Studio
npm run db:reset          # Reset database (dev only)

# Docker
./scripts/deploy.sh              # Deploy to production
./scripts/check-health.sh        # Health check
./scripts/backup.sh              # Backup
./scripts/fix-port-conflict.sh   # Fix port issues

# Monitoring
docker logs -f tripcalc-prod
docker stats tripcalc-prod
```

## Links

- **Production**: https://tripcalc.site
- **Documentation**:
  - CLAUDE.md (this file) - Complete project docs
  - SETUP_AUTH.md - Authentication setup guide
  - PHASE1_COMPLETE.md - User system implementation summary
  - IMPLEMENTATION_STATUS.md - Detailed implementation status
  - DEPLOYMENT_VPS.md - VPS deployment guide
  - scripts/README.md - Scripts documentation

---

**Last Updated**: 2026-02-10 (Evening)
**Project Status**: Production ready + User system + Weather + Analytics (Phase 2) + Recent bug fixes
**Current State**:
- 6 cities with full data (Barcelona, Tokyo, New York, London, Paris, Mexico City)
- 3 calculators (Daily Cost, Luggage Planner, Transport Comparison)
- Complete user auth system (NextAuth v5 + Supabase)
- Weather integration with 3-level alerts and error handling
- Analytics system with geolocation (VPS/Docker compatible)
- Docker deployment on VPS with Nginx Proxy Manager
- All production build errors resolved

**Recent Session Summary (2026-02-10)**:
- Fixed Docker compilation errors (NextAuth v5, Prisma types)
- Fixed UI contrast issues (analytics dashboard, trip views)
- Implemented Weather API date validation and error handling
- Added DNS configuration for external API access
- Enhanced geolocation with ipapi.co fallback for VPS environments
- Improved error messages and user feedback

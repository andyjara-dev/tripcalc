# TripCalc Development Roadmap

## Overview
Complete development roadmap from initial setup to advanced AI features.

---

## ✅ Phase 1: User Authentication & Database (COMPLETE)
**Status:** Production Ready
**Duration:** Completed
**Documentation:** `PHASE1_COMPLETE.md`, `SETUP_AUTH.md`

### Features
- ✅ NextAuth.js v5 with email + OAuth (Google, GitHub)
- ✅ Supabase PostgreSQL database
- ✅ User accounts and sessions
- ✅ Database schema (users, trips, expenses, custom items)
- ✅ Fully translated UI (EN + ES)

---

## ✅ Phase 2-5: Trip Planning Features (COMPLETE)
**Status:** Production Ready
**Documentation:** `IMPLEMENTATION_STATUS.md`

### Phase 2: Save Trips from Calculators
- ✅ Save calculator state to database
- ✅ Load saved trips
- ✅ Trip list page

### Phase 3: Customize Trip Costs
- ✅ Override default costs per category
- ✅ Per-day customization
- ✅ Real-time total updates

### Phase 4: Custom Budget Items
- ✅ Add custom activities with prices
- ✅ Per-day custom items
- ✅ Weight calculations (per visit vs one-time)

### Phase 5: Track Real Expenses
- ✅ Add actual expenses during trip
- ✅ Compare budget vs actual
- ✅ Expense categories and notes
- ✅ Running totals

---

## ✅ Phase 6: Share & Export (COMPLETE)
**Status:** Production Ready
**Duration:** Completed

### Phase 6a: Share Trips
- ✅ Generate shareable links with tokens
- ✅ Public trip view page
- ✅ Copy to clipboard functionality

### Phase 6b: Export PDF
- ✅ Generate PDF with trip summary
- ✅ Logo integration
- ✅ Multilingual support
- ✅ Cost breakdown

### Phase 6c: Calendar Export
- ✅ Generate .ics calendar files
- ✅ All-day events for each trip day
- ✅ Cost estimates in event descriptions
- ✅ Compatible with Google/Apple/Outlook calendars

---

## 🔄 Phase 6d: User Profile Page (IN PROGRESS)
**Status:** Planned
**Duration:** ~2 hours
**Documentation:** `PHASE_6D_USER_PROFILE.md`

### Current Issue
- ❌ Route `/[locale]/profile` returns 404
- ❌ No way to view/edit account settings

### Features to Implement
- [ ] Basic profile view (name, email, account type)
- [ ] Edit profile information
- [ ] Account statistics (trips, expenses, etc.)
- [ ] Connected OAuth accounts management
- [ ] Premium status display
- [ ] Delete account functionality

### Routes
```
/app/[locale]/profile/page.tsx       # Main profile page
/components/profile/ProfileView.tsx  # Profile display
/components/profile/AccountStats.tsx # Stats dashboard
/api/profile/route.ts                # GET/PATCH profile
/api/profile/stats/route.ts          # GET stats
/api/profile/delete/route.ts         # DELETE account
```

### Priority
**HIGH** - Currently broken, users can't access profile

---

## ✅ Phase 8: Cities Database Migration (COMPLETE)
**Status:** ✅ Complete (95%)
**Duration:** Completed January 2026
**Documentation:** `PHASE_8_CITIES_DATABASE.md`

### Overview
Migrated city data from static TypeScript files to database with admin interface for easy management.

### Problems Solved ✅
- ✅ Add cities via admin interface (no code changes)
- ✅ Update prices without deployment
- ✅ Admin can manage all city data
- ✅ Easy to update as catalog grows
- ✅ Track changes over time

### Implemented Features ✅
- ✅ **6 cities migrated** (Barcelona, Tokyo, Paris, New York, Mexico City, Santiago)
- ✅ **Admin panel complete** (`/admin/cities`)
- ✅ **CRUD operations** for cities, costs, transport, tips, cash info
- ✅ **Publish/unpublish** functionality
- ✅ **18 cost records** (3 styles per city)
- ✅ **59 transport records**
- ⚠️ **Airport transfers** (pending migration - 0 records)

### Database Models ✅
- ✅ `City` - Basic city info
- ✅ `CityDailyCost` - Daily costs by travel style
- ✅ `CityTransport` - Transport options and prices
- ✅ `CityAirport` - Airport transfers (schema ready, needs data)
- ✅ `CityTip` - Local tips and advice
- ✅ `CityCashInfo` - Cash and payment info
- ✅ `CityPriceHistory` - Track price changes

### Admin Interface Routes ✅
```
✅ /admin/cities                    - List all cities
✅ /admin/cities/new                - Create new city
✅ /admin/cities/[id]               - Edit city
✅ /admin/cities/[id]/costs         - Manage costs
✅ /admin/cities/[id]/transport     - Manage transport
✅ /admin/cities/[id]/tips          - Manage tips
✅ /admin/cities/[id]/cash-info     - Manage cash info
```

### Benefits Achieved ✅
- ✅ Add new city in <10 minutes via admin panel
- ✅ No code deployment needed for data updates
- ✅ Price updates in real-time
- ✅ Admin-friendly interface
- ✅ Scalable to 100+ cities

---

## ✅ Phase 7: Premium Luggage Calculator (COMPLETE)
**Status:** ✅ Production Ready
**Duration:** 2 weeks (completed February 2026)
**Documentation:** `PHASE_7_LUGGAGE_CALCULATOR.md`

### Overview
AI-powered luggage packing calculator that suggests clothing items based on weight/size limits.

### Key Features - ALL IMPLEMENTED ✅
- ✅ **Premium Feature** - Requires subscription
- ✅ AI-powered packing suggestions (Google Gemini API)
- ✅ Weight optimization
- ✅ Airline database with 20 airlines (60 luggage rules)
- ✅ Autocompletado de aerolíneas
- ✅ Generic presets (Ryanair, standard carry-on, checked baggage)
- ✅ Trip-aware suggestions (duration, climate, type)
- ✅ Real-time weight tracking with checkboxes
- ✅ Save and export packing lists
- ✅ Edit and reload saved lists
- ✅ Visual progress bars and status indicators
- ✅ Toast notifications (replaced alerts)

### User Flow ✅
1. **Toggle airline-specific or generic mode**
   - Option A: Select airline (autocomplete search) → Choose luggage type
   - Option B: Use generic presets (standard carry-on, checked, etc.)
2. **Configure trip details**
   - Simple mode: Manual duration + climate
   - Advanced mode: Destination + dates (AI estimates climate)
3. **AI generates optimized packing list** with weights per item
4. **Interactive checklist** - Check items as you pack them
5. **Visual weight tracker** shows current vs. limit in real-time
6. **Save to trip** - Link packing list to existing trip or save standalone
7. **Edit anytime** - Load saved list, modify checks, regenerate if needed

### Technical Stack ✅
- **AI:** Google Gemini 1.5 Flash (switched from Claude for better cost/performance)
- **Database:** 20 airlines × 3 luggage types each = 60 rules
- **Cost:** ~$0.001 per generation (~$0.20/month for 200 requests)
- **Premium Gate:** ✅ Implemented with upgrade prompt
- **Notifications:** ✅ Modern toast system (replaced browser alerts)

### Routes
```
/app/[locale]/calculators/luggage/page.tsx          # Main calculator
/components/calculators/luggage/LuggageCalculator.tsx
/components/calculators/luggage/PremiumGate.tsx     # Paywall
/api/luggage/generate/route.ts                      # AI generation
/lib/ai/packing-assistant.ts                        # AI logic
```

### Example AI Output
```json
{
  "items": [
    {
      "category": "Clothing",
      "name": "T-shirt",
      "quantity": 3,
      "weightPerItem": 150,
      "totalWeight": 450,
      "essential": true
    }
  ],
  "totalWeight": 8500,
  "remainingWeight": 1500,
  "tips": ["Wear heaviest items during travel"],
  "warnings": []
}
```

---

## 🎯 Phase 9: Premium Tier System (FUTURE)
**Status:** Planned
**Prerequisites:** Phase 8 (first premium feature)

### Features
- [ ] Stripe payment integration
- [ ] Subscription management
- [ ] Premium tier ($4.99/month or $49.99/year)
- [ ] Free trial (7 days)
- [ ] Billing dashboard
- [ ] Invoice generation

### Premium Features
- ✅ Admin Dashboard (already implemented)
- 🚀 Luggage Calculator (Phase 7)
- 🔮 AI Trip Planner (Phase 9)
- 🔮 Advanced Analytics
- 🔮 Priority Support

---

## 🔮 Phase 10: AI Trip Planner (FUTURE)
**Status:** Conceptual
**Prerequisites:** Phase 8 (AI infrastructure)

### Features
- [ ] Natural language trip planning
- [ ] "Plan a 5-day trip to Barcelona for €1000"
- [ ] AI suggests daily itinerary
- [ ] Optimizes costs based on budget
- [ ] Integrates with existing calculators

### Example Prompts
- "Plan a budget week in Tokyo with street food focus"
- "Romantic 3-day Paris trip, mid-range, museums"
- "Adventure backpacking in Peru, 2 weeks, $800"

---

## 🏢 Phase 11: Admin Dashboard Enhancements (FUTURE)
**Status:** Planned

### Features
- [ ] User analytics dashboard
- [ ] Popular destinations
- [ ] Average trip costs by city
- [ ] Custom item analytics
- [ ] Popular packing items (from luggage calculator)
- [ ] Revenue metrics
- [ ] User growth charts

---

## 🗺️ Phase 12: AI Daily Itinerary Calculator (FUTURE)
**Status:** Conceptual
**Duration:** ~60-80 hours
**Prerequisites:** Phase 10 (Payments), Google Maps API integration

### Overview
Smart daily itinerary planner that calculates distances, travel times, and creates a chronological timeline for each day of the trip.

### Problem Solved
When planning a day in a city, travelers need to know:
- How long it takes to get from hotel to attraction A
- What time they'll arrive at each location
- What time they'll finish and move to the next spot
- What time they'll return to the hotel

### User Flow Example
1. **Set accommodation address** (hotel/Airbnb location)
2. **Plan activities for the day:**
   - 9:00 AM - Leave hotel
   - Go to Tokyo Skytree (via metro)
   - AI calculates: 35 min travel → Arrive 9:35 AM
   - Stay 2 hours → Leave at 11:35 AM
   - Go to Senso-ji Temple (via metro)
   - AI calculates: 20 min travel → Arrive 11:55 AM
   - Stay 1.5 hours → Leave at 1:25 PM
   - Return to hotel (via taxi)
   - AI calculates: 15 min travel → Arrive 1:40 PM

3. **Visual timeline** shows full day schedule with times
4. **Total travel time** calculated for the day
5. **Export to calendar** or share with travel companions

### Key Features

#### Core Functionality
- [ ] Add multiple destinations per day
- [ ] Set accommodation/starting point
- [ ] Choose transport mode per leg (metro, bus, taxi, Uber, walk, bike)
- [ ] Specify time spent at each location
- [ ] Auto-calculate arrival/departure times
- [ ] Real-time distance and duration calculations
- [ ] Visual timeline view of the day

#### Transport Modes
- [ ] Public transport (metro, bus, tram)
- [ ] Taxi/Uber (with cost estimates)
- [ ] Walking (with step count estimates)
- [ ] Bike/scooter rental
- [ ] Car (if renting)
- [ ] Combined routes (e.g., metro + walk)

#### Smart Features
- [ ] AI suggests optimal route order
- [ ] Warns if timeline is too tight
- [ ] Suggests buffer time between activities
- [ ] Considers peak hours and traffic
- [ ] Weather-aware suggestions (rain → indoor activities)
- [ ] Opening hours validation (museum closes at 5 PM)

#### Integration
- [ ] Link to existing trips
- [ ] Save multiple day itineraries per trip
- [ ] Export to Google Calendar/iCal
- [ ] Share itinerary with travel companions
- [ ] Print-friendly daily schedule

### Technical Stack

#### APIs Required
- **Google Maps Distance Matrix API**
  - Calculate travel times between points
  - Multiple transport modes
  - Real-time traffic data
  - Cost: ~$5 per 1000 requests (elements)

- **Google Maps Directions API**
  - Detailed route information
  - Step-by-step directions
  - Alternative routes
  - Cost: ~$5 per 1000 requests

- **Google Places API** (optional)
  - Autocomplete for destinations
  - Place details (opening hours, ratings)
  - Cost: ~$17 per 1000 requests (Place Details)

#### Database Schema
```prisma
model DailyItinerary {
  id              String   @id @default(cuid())
  tripId          String
  userId          String
  date            DateTime
  accommodationAddress String
  accommodationLat Float
  accommodationLng Float
  totalTravelTime Int      // minutes
  totalDistance   Float    // km
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  activities ItineraryActivity[]
  trip       Trip @relation(fields: [tripId], references: [id])
  user       User @relation(fields: [userId], references: [id])
}

model ItineraryActivity {
  id              String   @id @default(cuid())
  itineraryId     String
  orderIndex      Int

  // Location
  name            String
  address         String?
  lat             Float?
  lng             Float?

  // Timing
  arrivalTime     DateTime
  departureTime   DateTime
  durationMinutes Int      // time spent at location

  // Transport to next location
  transportMode   String   // metro, taxi, walk, bike, etc.
  travelTime      Int?     // minutes to next location
  distance        Float?   // km to next location
  cost            Float?   // estimated cost

  // Details
  notes           String?  @db.Text
  placeId         String?  // Google Places ID

  itinerary DailyItinerary @relation(fields: [itineraryId], references: [id])

  @@index([itineraryId, orderIndex])
}
```

#### Components
```
/components/calculators/itinerary/
  ItineraryCalculator.tsx       # Main component
  ActivityCard.tsx              # Single activity item
  TimelineView.tsx              # Visual timeline
  TransportSelector.tsx         # Transport mode picker
  AddressAutocomplete.tsx       # Google Places autocomplete
  RouteOptimizer.tsx            # AI route optimization
  TravelTimeDisplay.tsx         # Travel time badges
  DayScheduleExport.tsx         # Export to calendar
```

### Cost Estimates

#### Google Maps API (Monthly)
- **100 users**, 5 itineraries each, 5 activities per day:
  - Distance Matrix: 100 × 5 × 5 = 2,500 requests
  - Cost: ~$12.50/month

- **1,000 users** at same rate:
  - 25,000 requests
  - Cost: ~$125/month

#### Optimization Strategy
- Cache common routes (hotel → popular attraction)
- Batch requests when possible
- Use free tier (200 requests/day = 6,000/month)
- Only calculate when user confirms route

### Premium Feature?
**Recommendation:** Yes, premium-only
- **Reason:** High API costs per user
- **Free tier:** View saved itineraries only
- **Premium tier:** Create unlimited itineraries with real-time calculations

### UI/UX Design

#### Desktop View
```
┌─────────────────────────────────────────────┐
│  Daily Itinerary: Tokyo - Day 1             │
│  Starting point: Hotel Shinjuku [📍 Edit]   │
├─────────────────────────────────────────────┤
│                                             │
│  9:00 AM  🏨 Leave hotel                    │
│     ↓     🚇 Metro (35 min, ¥240)          │
│  9:35 AM  🗼 Tokyo Skytree                  │
│           ⏱️ 2 hours                        │
│ 11:35 AM  Leave                            │
│     ↓     🚇 Metro (20 min, ¥180)          │
│ 11:55 AM  ⛩️ Senso-ji Temple               │
│           ⏱️ 1.5 hours                      │
│  1:25 PM  Leave                            │
│     ↓     🚕 Taxi (15 min, ¥1,500)         │
│  1:40 PM  🏨 Return to hotel                │
│                                             │
│  Total: 70 min travel | 15.2 km | ¥1,920  │
│                                             │
│  [+ Add Activity]  [Optimize Route]  [Export] │
└─────────────────────────────────────────────┘
```

#### Mobile View
- Swipeable cards for each activity
- Collapsible travel segments
- Quick transport mode switcher
- One-tap to open in Google Maps

### Example API Integration

```typescript
// /lib/maps/itinerary-calculator.ts
import { Client } from '@googlemaps/google-maps-services-js';

const client = new Client({});

export async function calculateTravelTime(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number },
  mode: 'transit' | 'driving' | 'walking' | 'bicycling'
) {
  const response = await client.distancematrix({
    params: {
      origins: [`${origin.lat},${origin.lng}`],
      destinations: [`${destination.lat},${destination.lng}`],
      mode,
      key: process.env.GOOGLE_MAPS_API_KEY!,
    },
  });

  const element = response.data.rows[0].elements[0];

  return {
    distance: element.distance.value, // meters
    duration: element.duration.value, // seconds
    distanceText: element.distance.text, // "15.2 km"
    durationText: element.duration.text, // "35 mins"
  };
}
```

### Routes
```
/app/[locale]/trips/[id]/itinerary/[date]/page.tsx     # Daily itinerary page
/api/itinerary/calculate/route.ts                       # Calculate times
/api/itinerary/optimize/route.ts                        # AI route optimization
/api/itinerary/export/route.ts                          # Export to calendar
```

### Benefits
- Realistic day planning (no more "oops, we planned too much")
- Accurate arrival times for reservations
- Cost-effective transport choices
- Shareable schedule with travel group
- Reduces travel stress and time waste

### Risks & Considerations
- **API costs can scale quickly** → Implement caching and rate limits
- **Accuracy depends on real-time data** → Show estimates, not guarantees
- **Not all cities have good transit data** → Fall back to driving estimates
- **Privacy concerns** → Don't store precise location history

### Success Metrics
- Average activities planned per day: 3-5
- Time saved vs manual planning: ~15 minutes per day
- User satisfaction: "Actually doable" vs "too ambitious"
- Premium conversion: Users see value in realistic planning

---

## 📊 Current Status Summary

| Phase | Status | Priority | Effort | Docs |
|-------|--------|----------|--------|------|
| Phase 1 (Auth & DB) | ✅ Complete | - | - | ✅ |
| Phase 2-5 (Trip Features) | ✅ Complete | - | - | ✅ |
| Phase 6 (Share & Export) | ✅ Complete | - | - | ✅ |
| Phase 7 (Luggage) | ✅ Complete | - | 60h | ✅ |
| **Phase 8 (Cities DB)** | **✅ Complete** | **-** | **70h** | ✅ |
| **Phase 9 (Content)** | **🔄 Active** | **HIGH** | **Ongoing** | ❌ |
| Phase 10 (Payments) | 📋 Planned | MEDIUM | 40h | ❌ |
| Phase 11 (Admin Analytics) | 💭 Concept | LOW | 30h | ❌ |
| Phase 12 (AI Itinerary) | 💭 Concept | MEDIUM | 60-80h | ✅ |

---

## 🎯 Immediate Next Steps

### ✅ DONE: Luggage Calculator (Phase 7)
**Status:** ✅ Completed February 2026
- ✅ AI-powered packing lists
- ✅ 20 airlines database with autocomplete
- ✅ Interactive weight tracking
- ✅ Save/load functionality
- ✅ Premium feature gate

### ✅ DONE: Cities Database (Phase 8)
**Status:** ✅ Completed January 2026 (95%)
- ✅ 6 cities migrated to database
- ✅ Full admin panel with CRUD
- ✅ Manage costs, transport, tips, cash info
- ⚠️ Pending: Airport transfers data migration

### 1. Content Growth (Phase 9) - CURRENT FOCUS
**Priority:** 🔴 HIGH - Revenue driver
**Effort:** Ongoing

Using admin panel to scale content:
- Add 15+ new popular cities (now easy via admin!)
- Complete airport transfers for existing cities
- Add 30+ more airlines to database
- Improve SEO for all city pages
- Blog posts for travel cost insights
- Social media presence

Target cities to add:
- Rome, London, Amsterdam, Berlin (Europe)
- Los Angeles, Miami, San Francisco (USA)
- Buenos Aires, Rio, Lima (LATAM)
- Bangkok, Singapore, Seoul (Asia)

### 2. User Growth & Marketing
**Priority:** 🔴 HIGH
**Ongoing**

- Improve landing page conversion
- SEO optimization
- Content marketing (blog)
- Social media automation
- Email newsletter
- Partnership outreach

### 3. Premium Tier & Payments (Phase 9)
**Priority:** 🟡 MEDIUM
**Dependencies:** Luggage calculator ✅ (done), need user feedback

Next steps:
- ✅ Luggage calculator as premium feature (done)
- [ ] Gather user feedback on premium features
- [ ] Implement Stripe payment integration
- [ ] Add billing dashboard
- [ ] 7-day free trial flow

---

## 💰 Revenue Projections

### Free Tier (Current)
- **Cost:** ~$0/month (Vercel + Supabase free tiers)
- **Revenue:** $0
- **Goal:** Build audience, SEO, trust

### Premium Tier (Phase 8+)
- **Price:** $4.99/month or $49.99/year
- **Target:** 100 paying users in Year 1
- **Revenue:** ~$500/month
- **Costs:**
  - AI API: ~$50/month (generous estimate)
  - Hosting: ~$20/month (scale up from free tier)
  - Net: ~$430/month

### Affiliate Revenue (Future)
- Booking.com, GetYourGuide links
- Travel insurance referrals
- Estimated: $100-300/month with decent traffic

---

## 🚦 Decision Points

### Now: Phase 7 (Cities Database)
✅ **GO** - Critical for scalability, blocks content growth

**Implementation approach:**
- Week 1-2: Database schema + dual-source system
- Week 3-4: Admin interface
- Week 5-6: Testing + migration of existing cities
- Keep static files as backup during transition

### Soon: Phase 8 (Luggage Calculator)
🤔 **DECISION NEEDED:**
- Option A: Free beta → Premium tier later
- Option B: Premium-only from launch
- Recommendation: **Option A** (validate feature first)

### Later: Phase 9 (Payments)
⏸️ **WAIT** - Need Phase 8 complete + user feedback

### Future: Phase 10 (AI Trip Planner)
⏸️ **WAIT** - Depends on Phase 8 success + AI cost analysis

---

## 📚 Documentation Status

| Document | Status | Description |
|----------|--------|-------------|
| CLAUDE.md | ✅ Complete | Main project docs |
| SETUP_AUTH.md | ✅ Complete | Auth setup guide |
| PHASE1_COMPLETE.md | ✅ Complete | Phase 1 summary |
| IMPLEMENTATION_STATUS.md | ✅ Complete | Phases 2-5 detail |
| PHASE_6D_USER_PROFILE.md | ✅ Complete | Profile page plan |
| PHASE_7_LUGGAGE_CALCULATOR.md | ✅ Complete | Luggage calc (now Phase 8) |
| PHASE_8_CITIES_DATABASE.md | ✅ Complete | Cities DB migration (Phase 7) |
| ROADMAP.md | ✅ Complete | This file |
| DEPLOYMENT_VPS.md | ✅ Complete | VPS deployment |
| DOCKER.md | ✅ Complete | Docker setup |

---

## 🎓 Lessons Learned

### What Worked Well
- ✅ Starting with Vercel free tier (zero cost to validate)
- ✅ Supabase for database (generous free tier)
- ✅ Docker for flexible deployment options
- ✅ TypeScript + Prisma (type safety saved time)
- ✅ Detailed planning docs before coding

### What to Improve
- ⚠️ Should have built profile page in Phase 1
- ⚠️ More user testing before building features
- ⚠️ SEO strategy should start earlier

### Future Considerations
- 💡 Consider user feedback before each phase
- 💡 A/B test premium features as free beta first
- 💡 Build in public / dev blog for marketing

---

**Last Updated:** 2026-02-01
**Next Review:** After Phase 8 (Cities Database) completion

---

## 🎉 Recent Achievements (February 2026)

### Luggage Calculator - COMPLETE ✅
- ✅ Full implementation of AI-powered packing assistant
- ✅ Airlines database (20 airlines, 60 luggage rules)
- ✅ Autocompletado de aerolíneas con búsqueda inteligente
- ✅ Toggle genérico/aerolínea específica
- ✅ Interactive checklist con tracking de peso real-time
- ✅ Estado de items empacados se guarda correctamente
- ✅ Integración con trips existentes
- ✅ Toast notifications modernas
- ✅ Premium feature gate implementada

**Result:** Sistema de equipaje totalmente funcional y listo para usuarios premium.

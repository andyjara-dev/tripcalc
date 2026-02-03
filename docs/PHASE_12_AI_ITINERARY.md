# Phase 12: AI Daily Itinerary Calculator

## Overview

Smart daily itinerary planner that automatically calculates distances, travel times, and creates a chronological timeline for each day of a trip. Uses Google Maps APIs and AI to help travelers plan realistic, achievable daily schedules.

**Status:** 💭 Conceptual (Future phase)
**Duration:** 60-80 hours
**Prerequisites:** Phase 10 (Payments - for premium gate), Google Maps API key

---

## Problem Statement

### Current Pain Point
Travelers struggle to plan realistic daily itineraries because they:
- Don't know how long it takes between locations
- Overestimate what they can do in one day
- Miss reservations due to poor time estimates
- Waste time figuring out transport options
- Can't share detailed schedules with travel companions

### What Users Ask
- "If I leave my hotel at 9 AM and want to visit 3 museums, what time will I get back?"
- "How long does it take to get from the Eiffel Tower to Louvre by metro?"
- "Can I fit all these activities in one day?"
- "What's the best order to visit these places to minimize travel time?"

---

## User Flow

### Setup Phase
1. User opens trip and selects a specific day
2. Sets accommodation address (hotel/Airbnb)
3. System geocodes address and stores coordinates

### Planning Phase
1. **Add first activity**
   - User types destination (autocomplete via Google Places)
   - Sets departure time from hotel (e.g., 9:00 AM)
   - Selects transport mode (metro, taxi, walk, etc.)
   - System calculates travel time and arrival time

2. **Add activity details**
   - User specifies how long they'll stay (e.g., 2 hours)
   - System calculates departure time (e.g., 11:00 AM)

3. **Add next activity**
   - User adds next destination
   - Selects transport mode
   - System automatically calculates travel time from previous location
   - Shows arrival time at new location

4. **Repeat** for all activities

5. **Return to hotel**
   - System offers "Return to hotel" button
   - Calculates final leg and shows total day summary

### Visual Output
```
📍 Hotel Shinjuku
    ↓ 🚇 Metro (35 min, ¥240)
9:35 AM - 🗼 Tokyo Skytree (2 hours)
    ↓ 🚇 Metro (20 min, ¥180)
12:00 PM - 🍜 Ramen Restaurant (1 hour)
    ↓ 🚶 Walk (10 min, free)
1:10 PM - ⛩️ Senso-ji Temple (1.5 hours)
    ↓ 🚕 Taxi (25 min, ¥2,000)
3:05 PM - 📍 Return to hotel

Summary:
• Total travel time: 90 minutes
• Total distance: 22.5 km
• Estimated cost: ¥2,420
• Activities: 3 locations
• Free time: Plan dinner around 4 PM
```

---

## Key Features

### Core Functionality

#### 1. Multi-Stop Planning
- Add unlimited destinations per day
- Drag-and-drop to reorder activities
- Duplicate day to another date
- Templates for common routes (e.g., "Tokyo highlights")

#### 2. Smart Time Calculations
- Auto-calculate arrival times based on:
  - Previous departure time
  - Travel duration
  - Transport mode
- Auto-calculate departure times based on:
  - Arrival time + duration at location
- Running timeline updates in real-time

#### 3. Transport Mode Selection
Per-leg transport options:
- **Public Transit** (metro, bus, tram)
  - Shows route number (e.g., "Take Line 5")
  - Displays cost estimate
  - Considers transfer times
- **Taxi/Uber**
  - Price range estimate
  - Surge pricing warnings (peak hours)
- **Walking**
  - Distance and duration
  - Step count estimate
  - Elevation changes (if available)
- **Bike/Scooter**
  - Rental cost estimate
  - Bike-friendly route
- **Car**
  - Driving time
  - Parking considerations
  - Toll road costs

#### 4. Visual Timeline
- Vertical timeline view with icons
- Color-coded by activity type (culture, food, shopping, etc.)
- Travel segments shown as connectors
- Time markers every hour
- Expandable details per activity

#### 5. Day Summary
- Total travel time
- Total distance covered
- Estimated transport costs
- Time spent at activities vs. traveling
- Warnings if too ambitious
- Free time slots identified

### Smart Features

#### AI Route Optimization
Button: "Optimize my route"
- Analyzes all destinations
- Suggests optimal visit order to minimize:
  - Total travel time
  - Total cost
  - Backtracking
- Shows before/after comparison

#### Intelligent Warnings
- ⚠️ "This itinerary is very tight. Consider removing 1 activity."
- ⏰ "Museum XYZ closes at 5 PM. You'll arrive at 4:45 PM."
- 🚇 "Last metro at 11 PM. You'll miss it if delayed."
- 🌧️ "Rain forecasted. Consider indoor alternatives."
- 🏃 "You have only 10 min between activities. Add buffer time?"

#### Smart Suggestions
- "Nearby: Restaurant ABC (4.5★) is 5 min walk from Museum"
- "Popular: 80% of users visit Temple XYZ after this location"
- "Timing: Visit Tower in evening for sunset views (6:30 PM today)"

#### Opening Hours Integration
- Shows if location is open/closed at planned time
- Suggests best visiting time
- Marks lunch breaks for restaurants

### Integration Features

#### Link to Existing Data
- Pre-fill accommodation from trip data
- Import custom activities from budget planner
- Link to packing list (day pack vs. checked luggage)
- Show daily budget and track costs

#### Export Options
- Export to Google Calendar (.ics)
- Export to Apple Calendar
- PDF print-friendly schedule
- Share link (like trip sharing)
- Send to email

#### Collaboration
- Share itinerary with travel companions
- Real-time collaborative editing
- Comments on activities
- Vote on activities (group decision)

---

## Technical Implementation

### Database Schema

```prisma
// prisma/schema.prisma

model DailyItinerary {
  id              String   @id @default(cuid())
  tripId          String
  userId          String
  date            DateTime @db.Date

  // Accommodation (starting point)
  accommodationAddress String
  accommodationLat     Float
  accommodationLng     Float
  accommodationName    String?

  // Summary stats
  totalTravelTime Int      // minutes
  totalDistance   Float    // km
  totalCost       Float?   // estimated cost

  // Metadata
  isPublic        Boolean  @default(false)
  shareToken      String?  @unique
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  activities ItineraryActivity[]
  trip       Trip     @relation(fields: [tripId], references: [id], onDelete: Cascade)
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([tripId, date])
  @@index([userId])
  @@index([shareToken])
}

model ItineraryActivity {
  id              String   @id @default(cuid())
  itineraryId     String
  orderIndex      Int      // 0, 1, 2, 3... for ordering

  // Location info
  name            String
  address         String?
  lat             Float
  lng             Float
  placeId         String?  // Google Places ID
  category        String?  // museum, restaurant, park, etc.

  // Timing
  arrivalTime     DateTime
  departureTime   DateTime
  durationMinutes Int      // time spent at this location

  // Transport to next location (null for last activity)
  transportMode   String?  // transit, driving, walking, bicycling, taxi
  travelTime      Int?     // minutes to next location
  distance        Float?   // km to next location
  travelCost      Float?   // estimated cost to next location

  // Additional details
  notes           String?  @db.Text
  openingHours    Json?    // Store Google Places hours
  website         String?
  phone           String?
  rating          Float?
  priceLevel      Int?     // 0-4 (Google scale)

  // Flags
  isRestaurant    Boolean  @default(false)
  requiresBooking Boolean  @default(false)
  isOutdoor       Boolean  @default(false)

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  itinerary DailyItinerary @relation(fields: [itineraryId], references: [id], onDelete: Cascade)

  @@index([itineraryId, orderIndex])
}

// Add to existing Trip model
model Trip {
  // ... existing fields
  itineraries DailyItinerary[]
}
```

### API Routes

#### GET `/api/itinerary/[id]`
Fetch a daily itinerary with all activities.

**Response:**
```json
{
  "itinerary": {
    "id": "...",
    "date": "2026-03-15",
    "accommodation": {
      "name": "Hotel Shinjuku",
      "address": "...",
      "coordinates": { "lat": 35.6938, "lng": 139.7034 }
    },
    "activities": [
      {
        "id": "...",
        "name": "Tokyo Skytree",
        "arrivalTime": "2026-03-15T09:35:00Z",
        "departureTime": "2026-03-15T11:35:00Z",
        "duration": 120,
        "transport": {
          "mode": "transit",
          "time": 35,
          "distance": 8.5,
          "cost": 240
        }
      }
    ],
    "summary": {
      "totalTravelTime": 90,
      "totalDistance": 22.5,
      "totalCost": 2420,
      "startTime": "09:00",
      "endTime": "15:05"
    }
  }
}
```

#### POST `/api/itinerary/create`
Create a new daily itinerary.

**Body:**
```json
{
  "tripId": "...",
  "date": "2026-03-15",
  "accommodationAddress": "Hotel Shinjuku, Tokyo"
}
```

#### POST `/api/itinerary/[id]/activity`
Add an activity to an itinerary.

**Body:**
```json
{
  "name": "Tokyo Skytree",
  "address": "1 Chome-1-2 Oshiage, Sumida City, Tokyo",
  "placeId": "ChIJ...",
  "arrivalTime": "2026-03-15T09:35:00Z",
  "durationMinutes": 120,
  "transportMode": "transit"
}
```

#### POST `/api/itinerary/calculate-route`
Calculate travel time between two points.

**Body:**
```json
{
  "origin": { "lat": 35.6938, "lng": 139.7034 },
  "destination": { "lat": 35.7101, "lng": 139.8107 },
  "mode": "transit",
  "departureTime": "2026-03-15T09:00:00Z"
}
```

**Response:**
```json
{
  "distance": 8542,  // meters
  "duration": 2100,  // seconds (35 min)
  "cost": 240,       // yen
  "steps": [
    { "mode": "WALKING", "duration": 300, "distance": 400 },
    { "mode": "TRANSIT", "line": "Toei Oedo Line", "duration": 1500 },
    { "mode": "WALKING", "duration": 300, "distance": 200 }
  ]
}
```

#### POST `/api/itinerary/[id]/optimize`
AI-powered route optimization.

**Response:**
```json
{
  "optimizedOrder": [2, 0, 1, 3],  // New activity order
  "improvements": {
    "timeSaved": 45,      // minutes
    "distanceSaved": 5.2, // km
    "costSaved": 400      // currency
  },
  "reason": "Reordering activities 0 and 2 eliminates backtracking through downtown."
}
```

#### GET `/api/itinerary/[id]/export`
Export to calendar format.

**Query params:** `?format=ics`

**Response:** `.ics` file download

### Google Maps API Integration

#### Setup
```typescript
// lib/maps/client.ts
import { Client } from '@googlemaps/google-maps-services-js';

export const mapsClient = new Client({});

export const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY!;
```

#### Distance Matrix API
Calculate travel times with multiple modes.

```typescript
// lib/maps/distance-calculator.ts
import { mapsClient, GOOGLE_MAPS_API_KEY } from './client';

type TransportMode = 'transit' | 'driving' | 'walking' | 'bicycling';

export async function calculateTravelTime(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number },
  mode: TransportMode,
  departureTime?: Date
) {
  const response = await mapsClient.distancematrix({
    params: {
      origins: [`${origin.lat},${origin.lng}`],
      destinations: [`${destination.lat},${destination.lng}`],
      mode,
      departure_time: departureTime ? Math.floor(departureTime.getTime() / 1000) : undefined,
      key: GOOGLE_MAPS_API_KEY,
    },
  });

  const element = response.data.rows[0].elements[0];

  if (element.status !== 'OK') {
    throw new Error(`Cannot calculate route: ${element.status}`);
  }

  return {
    distance: element.distance.value,      // meters
    duration: element.duration.value,      // seconds
    distanceText: element.distance.text,   // "8.5 km"
    durationText: element.duration.text,   // "35 mins"
  };
}
```

#### Directions API
Get detailed routing instructions.

```typescript
// lib/maps/directions.ts
import { mapsClient, GOOGLE_MAPS_API_KEY } from './client';

export async function getDirections(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number },
  mode: 'transit' | 'driving' | 'walking' | 'bicycling'
) {
  const response = await mapsClient.directions({
    params: {
      origin: `${origin.lat},${origin.lng}`,
      destination: `${destination.lat},${destination.lng}`,
      mode,
      alternatives: true,
      key: GOOGLE_MAPS_API_KEY,
    },
  });

  return response.data.routes.map(route => ({
    distance: route.legs[0].distance,
    duration: route.legs[0].duration,
    steps: route.legs[0].steps.map(step => ({
      instruction: step.html_instructions,
      distance: step.distance.text,
      duration: step.duration.text,
      travelMode: step.travel_mode,
    })),
  }));
}
```

#### Places Autocomplete
Search and autocomplete destinations.

```typescript
// lib/maps/places.ts
import { mapsClient, GOOGLE_MAPS_API_KEY } from './client';

export async function searchPlaces(query: string, location?: { lat: number; lng: number }) {
  const response = await mapsClient.placeAutocomplete({
    params: {
      input: query,
      location: location ? `${location.lat},${location.lng}` : undefined,
      radius: 50000, // 50km
      key: GOOGLE_MAPS_API_KEY,
    },
  });

  return response.data.predictions.map(prediction => ({
    placeId: prediction.place_id,
    name: prediction.structured_formatting.main_text,
    address: prediction.description,
  }));
}

export async function getPlaceDetails(placeId: string) {
  const response = await mapsClient.placeDetails({
    params: {
      place_id: placeId,
      fields: [
        'name',
        'formatted_address',
        'geometry',
        'opening_hours',
        'website',
        'formatted_phone_number',
        'rating',
        'price_level',
        'types',
      ],
      key: GOOGLE_MAPS_API_KEY,
    },
  });

  const place = response.data.result;

  return {
    name: place.name,
    address: place.formatted_address,
    lat: place.geometry?.location.lat,
    lng: place.geometry?.location.lng,
    openingHours: place.opening_hours,
    website: place.website,
    phone: place.formatted_phone_number,
    rating: place.rating,
    priceLevel: place.price_level,
    types: place.types,
  };
}
```

#### Cost Estimation
Estimate taxi/Uber costs.

```typescript
// lib/maps/cost-estimator.ts

const COST_PER_KM = {
  taxi: {
    tokyo: 1.5,      // USD per km
    barcelona: 1.2,
    'new-york': 1.8,
  },
  transit: {
    tokyo: 0.15,     // Average metro fare per km
    barcelona: 0.10,
    'new-york': 0.12,
  },
};

export function estimateTravelCost(
  distance: number, // meters
  mode: 'taxi' | 'transit' | 'walking' | 'bicycling',
  city: string
): number | null {
  if (mode === 'walking' || mode === 'bicycling') {
    return 0;
  }

  const distanceKm = distance / 1000;
  const costPerKm = COST_PER_KM[mode]?.[city] || COST_PER_KM[mode]['tokyo'];

  return Math.round(distanceKm * costPerKm * 100) / 100;
}
```

### Frontend Components

#### Main Calculator
```typescript
// components/calculators/itinerary/ItineraryCalculator.tsx
'use client';

import { useState, useEffect } from 'react';
import { DailyItinerary, ItineraryActivity } from '@/types/itinerary';
import ActivityCard from './ActivityCard';
import TimelineView from './TimelineView';
import AddActivityModal from './AddActivityModal';

export default function ItineraryCalculator({
  tripId,
  date,
  initialData,
}: {
  tripId: string;
  date: Date;
  initialData?: DailyItinerary;
}) {
  const [itinerary, setItinerary] = useState<DailyItinerary | null>(initialData || null);
  const [activities, setActivities] = useState<ItineraryActivity[]>([]);
  const [isAddingActivity, setIsAddingActivity] = useState(false);

  // Load or create itinerary
  useEffect(() => {
    if (!initialData) {
      createItinerary();
    }
  }, []);

  const createItinerary = async () => {
    // Create new itinerary for this date
  };

  const addActivity = async (activityData: Partial<ItineraryActivity>) => {
    // Calculate travel time from previous location
    // Add activity to database
    // Refresh activities list
  };

  const reorderActivities = async (newOrder: number[]) => {
    // Reorder activities
    // Recalculate all travel times
    // Update database
  };

  const optimizeRoute = async () => {
    // Call AI optimization API
    // Apply optimized order
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left: Activity List */}
      <div>
        <h2>Activities</h2>
        {activities.map(activity => (
          <ActivityCard
            key={activity.id}
            activity={activity}
            onEdit={() => {}}
            onDelete={() => {}}
          />
        ))}
        <button onClick={() => setIsAddingActivity(true)}>
          + Add Activity
        </button>
      </div>

      {/* Right: Timeline View */}
      <div>
        <TimelineView itinerary={itinerary} activities={activities} />
      </div>

      {/* Add Activity Modal */}
      {isAddingActivity && (
        <AddActivityModal
          onClose={() => setIsAddingActivity(false)}
          onAdd={addActivity}
        />
      )}
    </div>
  );
}
```

#### Activity Card
```typescript
// components/calculators/itinerary/ActivityCard.tsx
export default function ActivityCard({ activity, onEdit, onDelete }) {
  return (
    <div className="border rounded-lg p-4 mb-4">
      <div className="flex justify-between">
        <div>
          <h3 className="font-bold">{activity.name}</h3>
          <p className="text-sm text-gray-600">{activity.address}</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium">
            {formatTime(activity.arrivalTime)} - {formatTime(activity.departureTime)}
          </p>
          <p className="text-xs text-gray-500">
            {activity.durationMinutes} min
          </p>
        </div>
      </div>

      {activity.transportMode && (
        <div className="mt-3 pt-3 border-t">
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <TransportIcon mode={activity.transportMode} />
            <span>{activity.travelTime} min</span>
            <span>•</span>
            <span>{(activity.distance || 0).toFixed(1)} km</span>
            {activity.travelCost && (
              <>
                <span>•</span>
                <span>${activity.travelCost}</span>
              </>
            )}
          </div>
        </div>
      )}

      <div className="mt-3 flex gap-2">
        <button onClick={onEdit} className="text-blue-600 text-sm">
          Edit
        </button>
        <button onClick={onDelete} className="text-red-600 text-sm">
          Delete
        </button>
      </div>
    </div>
  );
}
```

---

## Cost Analysis

### Google Maps API Pricing (2026)

#### Distance Matrix API
- **Cost:** $5.00 per 1,000 elements
- **Free tier:** First $200/month (~40,000 elements)
- **Element:** One origin-destination pair

**Example calculation:**
- 100 active users per month
- 5 itineraries per user
- 5 activities per itinerary
- 5 legs per itinerary (including return)
- Total: 100 × 5 × 5 = 2,500 elements/month
- **Cost: $0** (within free tier)

At 1,000 users:
- 25,000 elements/month
- **Cost: $0** (still within free tier)

At 10,000 users:
- 250,000 elements/month
- **Cost: ~$250/month**

#### Directions API (Optional)
- **Cost:** $5.00 per 1,000 requests
- Only use if user requests detailed directions

#### Places API
- **Autocomplete:** $2.83 per 1,000 requests
- **Place Details:** $17.00 per 1,000 requests
- Cache popular places to reduce API calls

### Optimization Strategies

#### 1. Caching
```typescript
// Cache common routes in Redis
const cacheKey = `route:${originLat},${originLng}:${destLat},${destLng}:${mode}`;
const cached = await redis.get(cacheKey);

if (cached) {
  return JSON.parse(cached);
}

const result = await calculateTravelTime(...);
await redis.setex(cacheKey, 86400, JSON.stringify(result)); // 24h cache
```

#### 2. Batch Requests
Calculate multiple routes in one API call when possible.

#### 3. Approximate for Preview
When user is still editing, show estimated times based on:
- Straight-line distance × 1.3 (road factor)
- Average speed by transport mode
- Only call real API when user confirms

#### 4. Rate Limiting
- Limit itinerary calculations to 10 per user per day
- Premium users: unlimited
- Show warning: "API quota reached, premium for unlimited"

### Total Monthly Costs (Estimated)

| Users | API Calls | Google Maps Cost | Premium Revenue | Net |
|-------|-----------|------------------|-----------------|-----|
| 100   | 2,500     | $0               | $0              | $0  |
| 1,000 | 25,000    | $0               | $500 (10%)      | +$500 |
| 5,000 | 125,000   | $125             | $2,500 (10%)    | +$2,375 |
| 10,000| 250,000   | $250             | $5,000 (10%)    | +$4,750 |

*Assuming 10% premium conversion at $5/month*

---

## Premium vs Free

### Free Tier
- ✅ View saved itineraries
- ✅ 3 itineraries per trip max
- ✅ Manual time entry (no auto-calculation)
- ✅ Basic timeline view
- ❌ Real-time distance/time calculations
- ❌ Route optimization
- ❌ Export to calendar
- ❌ Unlimited itineraries

### Premium Tier
- ✅ Unlimited itineraries
- ✅ Real-time Google Maps integration
- ✅ AI route optimization
- ✅ Cost estimates
- ✅ Export to calendar
- ✅ Collaborative editing
- ✅ Opening hours validation
- ✅ Smart suggestions

---

## Success Metrics

### User Engagement
- % of trips with at least 1 itinerary
- Average activities per itinerary
- Time spent on itinerary planner

### Feature Usage
- Most popular transport modes
- Average optimization improvement (minutes saved)
- Export format preferences

### Business Metrics
- Free → Premium conversion rate
- Itinerary feature as conversion driver
- API cost per premium user

### User Satisfaction
- "This itinerary was realistic" (yes/no after trip)
- Time estimate accuracy (actual vs. planned)
- Feature NPS score

---

## Implementation Roadmap

### Week 1-2: Database & Core Logic
- [x] Design database schema
- [ ] Create migration
- [ ] API routes for CRUD operations
- [ ] Time calculation logic
- [ ] Google Maps client setup

### Week 3-4: Frontend Components
- [ ] Itinerary calculator page
- [ ] Activity card component
- [ ] Timeline view
- [ ] Add activity modal
- [ ] Transport mode selector

### Week 5-6: Google Maps Integration
- [ ] Distance Matrix API integration
- [ ] Places autocomplete
- [ ] Cost estimation logic
- [ ] Caching layer (Redis)
- [ ] Rate limiting

### Week 7: AI Features
- [ ] Route optimization algorithm
- [ ] Smart suggestions engine
- [ ] Warning system (tight schedule, closed places)

### Week 8: Export & Sharing
- [ ] Calendar export (.ics)
- [ ] PDF generation
- [ ] Share link functionality
- [ ] Collaborative editing (basic)

### Week 9-10: Polish & Testing
- [ ] Mobile responsive design
- [ ] Error handling
- [ ] Loading states
- [ ] User testing
- [ ] Performance optimization

### Week 11-12: Premium Gate & Launch
- [ ] Premium feature gating
- [ ] Pricing page updates
- [ ] Documentation
- [ ] Marketing materials
- [ ] Soft launch to beta users

---

## Future Enhancements

### V2 Features
- Real-time traffic updates
- Weather-aware suggestions
- Group voting on activities
- Split costs with companions
- Uber/Lyft API integration (real pricing)
- Restaurant reservation links
- Ticket booking integration

### Advanced AI
- Learn user preferences (museums > nightlife)
- Predict optimal visit times based on crowd data
- Suggest similar itineraries from other users
- Auto-generate full trip itinerary from preferences

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| API costs spiral | High | Aggressive caching, rate limits, premium gate |
| Inaccurate time estimates | Medium | Show as estimates, allow manual override |
| Poor adoption | Medium | Free beta period, user feedback, iterate |
| Complex UI | Low | Extensive user testing, onboarding flow |
| Competition | Low | First-mover in budget-focused travel planning |

---

## Conclusion

This feature transforms TripCalc from a budget calculator into a complete trip planning tool. It solves a real pain point (unrealistic itineraries) with measurable value (time saved, better experiences).

**Recommended:** Build after Phase 10 (Payments) to gate as premium feature and control API costs.

**Priority:** Medium (after content growth and payment system)

**ROI:** High - strong conversion driver for premium subscriptions

---

**Document Created:** 2026-02-02
**Last Updated:** 2026-02-02
**Status:** Approved for future implementation

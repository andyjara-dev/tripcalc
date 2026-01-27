# TripCalc

**Real Travel Costs. No Surprises.**

TripCalc helps travelers answer the question most travel sites can't: **How much does a trip really cost?**

Built with real experience, real data, and real-world testing.

## Features

- Real daily cost estimators for cities worldwide
- Transport price comparisons (metro, taxi, Uber, etc.)
- Airport-to-city transfer calculators
- Tips, fees, and hidden cost guides
- Cash vs card recommendations
- Multi-language support (English, Spanish, more coming)

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **i18n**: next-intl
- **Containerization**: Docker
- **Deployment**: Vercel, Docker, or any cloud platform

## Getting Started

### Prerequisites

**Option 1: Local Development**
- Node.js 18.17 or later
- npm or yarn

**Option 2: Docker**
- Docker 20.10 or later
- Docker Compose (optional)

### Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Docker Development

```bash
# Build and run with Docker Compose
npm run docker:up

# Or manually
docker-compose up -d
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

See [DOCKER.md](DOCKER.md) for complete Docker documentation.

## Project Structure

```
tripcalc/
├── app/[locale]/          # Next.js App Router pages
├── messages/              # Translations (en.json, es.json)
├── data/cities/           # City data (structured JSON/TS)
├── components/            # Reusable React components
│   ├── calculators/       # Calculator components
│   └── ui/                # UI components
├── lib/                   # Utilities and helpers
└── public/                # Static assets
```

## Adding a New City

1. Create a new file in `data/cities/` (e.g., `tokyo.ts`)
2. Follow the `CityData` interface defined in `data/cities/types.ts`
3. Export the city in `data/cities/index.ts`
4. Add translations if needed

## Deployment

### Vercel (Easiest, Free Tier)

```bash
vercel
```

### VPS with Docker

```bash
# On your server
git clone [repo] tripcalc && cd tripcalc
cp .env.production.example .env.production
nano .env.production  # Configure your domain

# Deploy
./scripts/deploy.sh

# Configure nginx (see nginx/tripcalc.site.conf)
# Setup SSL with certbot
```

**Port conflict?** Run `./scripts/fix-port-conflict.sh`

See [DEPLOYMENT_VPS.md](DEPLOYMENT_VPS.md) for complete VPS setup guide.

## Contributing

TripCalc is built with real traveler experience. If you have accurate data for a city:

1. Fork the repository
2. Add/update city data
3. Submit a pull request

Please ensure data is accurate and from personal experience or reliable sources.

## License

MIT

## Contact

Website: [tripcalc.site](https://tripcalc.site)

---

**Because travelers deserve tools, not just inspiration.**

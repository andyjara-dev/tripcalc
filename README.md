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
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Or connect your GitHub repo to Vercel for automatic deployments.

### Docker (Any Platform)

```bash
# Build Docker image
npm run docker:build

# Run container
npm run docker:run
```

Deploy to:
- **Cloud Platforms**: AWS ECS, Google Cloud Run, Azure Container Instances
- **Container Registries**: Docker Hub, AWS ECR, Google Container Registry
- **VPS**: DigitalOcean, Linode, Vultr (with Docker installed)

**Quick Deploy to VPS:** See [DEPLOY_NOW.md](DEPLOY_NOW.md) for 10-minute setup guide.

**Complete Guides:**
- [DEPLOYMENT_VPS.md](DEPLOYMENT_VPS.md) - Complete VPS deployment guide
- [DOCKER.md](DOCKER.md) - Docker deployment to any platform
- [QUICK_REFERENCE.md](QUICK_REFERENCE.md) - Quick command reference

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

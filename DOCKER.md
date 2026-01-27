# Docker Deployment Guide

TripCalc can be built and deployed as a Docker container for easy deployment to any environment.

## Quick Start

### Using Docker Compose (Recommended)

```bash
# Build and start the container
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the container
docker-compose down
```

Visit: http://localhost:3000

### Using Docker CLI

```bash
# Build the image
docker build -t tripcalc:latest .

# Run the container
docker run -p 3000:3000 --name tripcalc tripcalc:latest

# Stop the container
docker stop tripcalc
docker rm tripcalc
```

### Using npm scripts

```bash
# Build Docker image
npm run docker:build

# Run container
npm run docker:run

# Stop container
npm run docker:stop

# Or use docker-compose
npm run docker:up      # Start in background
npm run docker:down    # Stop
npm run docker:logs    # View logs
```

## Docker Architecture

The Dockerfile uses a **multi-stage build** for optimal image size and security:

### Stage 1: Dependencies
- Base image: `node:20-alpine`
- Installs production dependencies only
- Uses `npm ci` for faster, reliable installs

### Stage 2: Builder
- Copies dependencies from Stage 1
- Builds the Next.js application
- Generates optimized production build

### Stage 3: Runner (Final Image)
- Minimal alpine image
- Only contains built assets and runtime dependencies
- Runs as non-root user (`nextjs`)
- ~200MB final image size

## Configuration

### Environment Variables

Create a `.env.production` file:

```env
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://tripcalc.site
NEXT_TELEMETRY_DISABLED=1

# Future variables
# NEXT_PUBLIC_GA_ID=
# EXCHANGE_RATE_API_KEY=
```

Update `docker-compose.yml` to use it:

```yaml
services:
  tripcalc:
    env_file:
      - .env.production
```

### Custom Port

Change the port mapping in `docker-compose.yml`:

```yaml
ports:
  - "8080:3000"  # Host:Container
```

Or with Docker CLI:

```bash
docker run -p 8080:3000 tripcalc:latest
```

## Production Deployment

### Deploy to Cloud Platforms

#### Docker Hub

```bash
# Tag the image
docker tag tripcalc:latest yourusername/tripcalc:latest

# Push to Docker Hub
docker push yourusername/tripcalc:latest
```

#### DigitalOcean App Platform

```bash
# Push to registry
doctl registry login
docker tag tripcalc:latest registry.digitalocean.com/yourregistry/tripcalc:latest
docker push registry.digitalocean.com/yourregistry/tripcalc:latest

# Deploy via App Platform UI or CLI
```

#### AWS ECS / Fargate

```bash
# Tag for ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ECR_URL

docker tag tripcalc:latest YOUR_ECR_URL/tripcalc:latest
docker push YOUR_ECR_URL/tripcalc:latest

# Deploy via ECS/Fargate
```

#### Google Cloud Run

```bash
# Tag for GCR
docker tag tripcalc:latest gcr.io/PROJECT_ID/tripcalc:latest

# Push to GCR
docker push gcr.io/PROJECT_ID/tripcalc:latest

# Deploy to Cloud Run
gcloud run deploy tripcalc \
  --image gcr.io/PROJECT_ID/tripcalc:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

#### Azure Container Instances

```bash
# Tag for ACR
docker tag tripcalc:latest yourregistry.azurecr.io/tripcalc:latest

# Push to ACR
az acr login --name yourregistry
docker push yourregistry.azurecr.io/tripcalc:latest

# Deploy
az container create \
  --resource-group myResourceGroup \
  --name tripcalc \
  --image yourregistry.azurecr.io/tripcalc:latest \
  --dns-name-label tripcalc \
  --ports 3000
```

### Deploy to VPS (DigitalOcean, Linode, etc.)

```bash
# On your VPS
git clone https://github.com/yourusername/tripcalc.git
cd tripcalc

# Start with docker-compose
docker-compose up -d

# Optional: Use nginx as reverse proxy
# See nginx section below
```

## Development with Docker

Run development server in Docker:

```bash
# Using docker-compose profile
npm run docker:dev

# Or manually
docker-compose --profile dev up tripcalc-dev
```

This mounts your local code into the container for live reloading.

## Nginx Reverse Proxy (Optional)

If deploying to a VPS, use nginx as a reverse proxy:

### nginx configuration

Create `/etc/nginx/sites-available/tripcalc`:

```nginx
server {
    listen 80;
    server_name tripcalc.site www.tripcalc.site;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/tripcalc /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### SSL with Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d tripcalc.site -d www.tripcalc.site
```

## Troubleshooting

### Container won't start

```bash
# Check logs
docker logs tripcalc

# Or with compose
docker-compose logs
```

### Permission errors

The container runs as user `nextjs` (UID 1001). If you have permission issues:

```bash
# Rebuild without cache
docker build --no-cache -t tripcalc:latest .
```

### Build fails

```bash
# Clear Docker build cache
docker builder prune

# Rebuild
docker build -t tripcalc:latest .
```

### Container is too large

The multi-stage build should produce ~200MB image. If larger:

```bash
# Check image size
docker images tripcalc

# Ensure standalone output is enabled in next.config.ts
# output: 'standalone'
```

## Docker Image Optimization

Current optimizations:
- ✅ Multi-stage build
- ✅ Alpine Linux base (minimal size)
- ✅ Standalone output (only necessary files)
- ✅ Non-root user (security)
- ✅ .dockerignore (exclude unnecessary files)

### Further optimizations (if needed)

1. **Use distroless image** (most secure, smallest):
```dockerfile
FROM gcr.io/distroless/nodejs:20
```

2. **Enable output cache**:
```typescript
// next.config.ts
experimental: {
  outputFileTracingRoot: path.join(__dirname, '../../'),
}
```

## CI/CD Integration

### GitHub Actions

Create `.github/workflows/docker.yml`:

```yaml
name: Docker Build and Push

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Build Docker image
        run: docker build -t tripcalc:latest .

      - name: Test image
        run: |
          docker run -d -p 3000:3000 --name test tripcalc:latest
          sleep 10
          curl -f http://localhost:3000 || exit 1
          docker stop test

      - name: Push to registry
        if: github.ref == 'refs/heads/main'
        run: |
          echo "${{ secrets.DOCKER_PASSWORD }}" | docker login -u "${{ secrets.DOCKER_USERNAME }}" --password-stdin
          docker tag tripcalc:latest yourusername/tripcalc:latest
          docker push yourusername/tripcalc:latest
```

## Resource Limits

Limit container resources in `docker-compose.yml`:

```yaml
services:
  tripcalc:
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M
```

## Health Checks

Add health check to `docker-compose.yml`:

```yaml
services:
  tripcalc:
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:3000"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

## Summary

- **Development**: `npm run dev` (local) or `npm run docker:dev` (Docker)
- **Production**: `npm run docker:up` or deploy to cloud
- **Image size**: ~200MB (optimized multi-stage build)
- **Security**: Non-root user, minimal attack surface
- **Cost**: $0 (Vercel) or $5-10/month (VPS with Docker)

---

For more information, see:
- [Next.js Docker Documentation](https://nextjs.org/docs/deployment#docker-image)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)

#!/bin/bash

# Clean Rebuild Script
# For cuando hay problemas con el build

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   Clean Rebuild${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Stop and remove containers
echo -e "${BLUE}🛑 Stopping containers...${NC}"
docker-compose -f docker-compose.prod.yml down -v

# Remove images
echo -e "${BLUE}🧹 Removing old images...${NC}"
docker image rm tripcalc-prod 2>/dev/null || true
docker image prune -f

# Clean local build artifacts (if running on server with source)
if [ -d ".next" ]; then
    echo -e "${BLUE}🧹 Cleaning local .next directory...${NC}"
    rm -rf .next
fi

# Build fresh
echo -e "${BLUE}🔨 Building fresh image (no cache)...${NC}"
docker-compose -f docker-compose.prod.yml build --no-cache

# Start
echo -e "${BLUE}▶️  Starting container...${NC}"
docker-compose -f docker-compose.prod.yml up -d

# Wait
echo -e "${BLUE}⏳ Waiting for startup...${NC}"
sleep 15

# Check
if docker ps | grep -q tripcalc-prod; then
    echo -e "${GREEN}✅ Container running${NC}"
    echo ""
    echo -e "${BLUE}📋 Recent logs:${NC}"
    docker logs tripcalc-prod --tail=20
else
    echo -e "${RED}❌ Container failed to start${NC}"
    docker logs tripcalc-prod
    exit 1
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}   Rebuild Complete${NC}"
echo -e "${GREEN}========================================${NC}"

#!/bin/bash

# TripCalc Production Deployment Script
# Usage: ./scripts/deploy.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   TripCalc Production Deployment${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if .env.production exists
if [ ! -f .env.production ]; then
    echo -e "${RED}❌ Error: .env.production not found${NC}"
    echo -e "${YELLOW}Please create .env.production file first${NC}"
    exit 1
fi

# Pull latest changes
echo -e "${BLUE}📥 Pulling latest code...${NC}"
git pull origin main || {
    echo -e "${YELLOW}⚠️  Git pull failed or no changes${NC}"
}

# Stop current container
echo -e "${BLUE}🛑 Stopping current container...${NC}"
docker-compose -f docker-compose.prod.yml down

# Remove old images (optional - uncomment if needed)
# echo -e "${BLUE}🧹 Removing old images...${NC}"
# docker image prune -f

# Build new image
echo -e "${BLUE}🔨 Building new image...${NC}"
docker-compose -f docker-compose.prod.yml build --no-cache

# Start container
echo -e "${BLUE}▶️  Starting container...${NC}"
docker-compose -f docker-compose.prod.yml up -d

# Wait for container to be healthy
echo -e "${BLUE}⏳ Waiting for application to start...${NC}"
sleep 10

# Check if container is running
if docker ps | grep -q tripcalc-prod; then
    echo -e "${GREEN}✅ Container is running${NC}"
else
    echo -e "${RED}❌ Container failed to start${NC}"
    echo -e "${YELLOW}Showing logs:${NC}"
    docker-compose -f docker-compose.prod.yml logs --tail=50
    exit 1
fi

# Test endpoint
echo -e "${BLUE}🧪 Testing endpoint...${NC}"
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Application is responding${NC}"
else
    echo -e "${RED}❌ Application is not responding${NC}"
    echo -e "${YELLOW}Showing logs:${NC}"
    docker-compose -f docker-compose.prod.yml logs --tail=50
    exit 1
fi

# Show container stats
echo ""
echo -e "${BLUE}📊 Container Stats:${NC}"
docker stats tripcalc-prod --no-stream

# Show logs
echo ""
echo -e "${BLUE}📋 Recent Logs:${NC}"
docker-compose -f docker-compose.prod.yml logs --tail=30

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}   ✅ Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}🌐 Application URL: ${NC}https://tripcalc.site"
echo -e "${BLUE}📊 View logs: ${NC}docker-compose -f docker-compose.prod.yml logs -f"
echo -e "${BLUE}🔄 Restart: ${NC}docker-compose -f docker-compose.prod.yml restart"
echo -e "${BLUE}🛑 Stop: ${NC}docker-compose -f docker-compose.prod.yml down"
echo ""

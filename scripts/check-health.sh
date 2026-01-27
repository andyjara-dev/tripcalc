#!/bin/bash

# TripCalc Health Check Script
# Usage: ./scripts/check-health.sh

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   TripCalc Health Check${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if container is running
echo -e "${BLUE}🐳 Checking Docker container...${NC}"
if docker ps | grep -q tripcalc-prod; then
    echo -e "${GREEN}✅ Container is running${NC}"

    # Get container details
    CONTAINER_STATUS=$(docker inspect --format='{{.State.Status}}' tripcalc-prod)
    CONTAINER_UPTIME=$(docker inspect --format='{{.State.StartedAt}}' tripcalc-prod)
    echo -e "   Status: ${CONTAINER_STATUS}"
    echo -e "   Started: ${CONTAINER_UPTIME}"
else
    echo -e "${RED}❌ Container is not running${NC}"
    exit 1
fi

# Check localhost endpoint
echo ""
echo -e "${BLUE}🔌 Checking local endpoint...${NC}"
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Local endpoint responding${NC}"
else
    echo -e "${RED}❌ Local endpoint not responding${NC}"
fi

# Check public endpoint (if nginx is configured)
echo ""
echo -e "${BLUE}🌐 Checking public endpoint...${NC}"
if curl -f https://tripcalc.site > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Public endpoint responding${NC}"
    RESPONSE_TIME=$(curl -o /dev/null -s -w '%{time_total}\n' https://tripcalc.site)
    echo -e "   Response time: ${RESPONSE_TIME}s"
elif curl -f http://tripcalc.site > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  HTTP works but HTTPS doesn't${NC}"
else
    echo -e "${YELLOW}⚠️  Public endpoint not accessible (DNS or nginx issue)${NC}"
fi

# Check Nginx
echo ""
echo -e "${BLUE}🔧 Checking Nginx...${NC}"
if systemctl is-active --quiet nginx 2>/dev/null; then
    echo -e "${GREEN}✅ Nginx is running${NC}"

    # Check if config exists
    if [ -f /etc/nginx/sites-enabled/tripcalc.site ]; then
        echo -e "${GREEN}✅ TripCalc nginx config exists${NC}"
    else
        echo -e "${YELLOW}⚠️  TripCalc nginx config not found${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Nginx not running or not installed${NC}"
fi

# Check SSL certificate
echo ""
echo -e "${BLUE}🔒 Checking SSL certificate...${NC}"
if command -v certbot &> /dev/null; then
    if sudo certbot certificates 2>/dev/null | grep -q "tripcalc.site"; then
        echo -e "${GREEN}✅ SSL certificate exists${NC}"
        CERT_EXPIRY=$(sudo certbot certificates 2>/dev/null | grep "Expiry Date" | head -1 | awk '{print $3, $4}')
        echo -e "   Expires: ${CERT_EXPIRY}"
    else
        echo -e "${YELLOW}⚠️  SSL certificate not found${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Certbot not installed${NC}"
fi

# Check resources
echo ""
echo -e "${BLUE}📊 Resource Usage:${NC}"
docker stats tripcalc-prod --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"

# Check disk space
echo ""
echo -e "${BLUE}💾 Disk Space:${NC}"
df -h / | tail -1 | awk '{print "   Total: "$2"  Used: "$3" ("$5")  Available: "$4}'

# Show recent errors from logs
echo ""
echo -e "${BLUE}🔍 Recent Errors (if any):${NC}"
ERROR_COUNT=$(docker logs tripcalc-prod --since 1h 2>&1 | grep -i error | wc -l)
if [ "$ERROR_COUNT" -gt 0 ]; then
    echo -e "${YELLOW}⚠️  Found ${ERROR_COUNT} errors in last hour${NC}"
    docker logs tripcalc-prod --since 1h 2>&1 | grep -i error | tail -5
else
    echo -e "${GREEN}✅ No errors in last hour${NC}"
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}   Health Check Complete${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

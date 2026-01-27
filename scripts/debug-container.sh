#!/bin/bash

# Debug Container Script
# Diagnostica qué hay dentro del container

set -e

# Colors
BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   Container Debugging${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if container is running
if ! docker ps | grep -q tripcalc-prod; then
    echo "❌ Container not running"
    exit 1
fi

echo -e "${BLUE}📁 Root directory:${NC}"
docker exec tripcalc-prod ls -la

echo ""
echo -e "${BLUE}📁 .next directory:${NC}"
docker exec tripcalc-prod ls -la .next

echo ""
echo -e "${BLUE}📁 .next/server/app:${NC}"
docker exec tripcalc-prod ls -la .next/server/app 2>/dev/null || echo "Not found"

echo ""
echo -e "${BLUE}📁 i18n directory:${NC}"
docker exec tripcalc-prod ls -la i18n 2>/dev/null || echo "Not found"

echo ""
echo -e "${BLUE}📁 messages directory:${NC}"
docker exec tripcalc-prod ls -la messages 2>/dev/null || echo "Not found"

echo ""
echo -e "${BLUE}🔍 Looking for HTML files:${NC}"
docker exec tripcalc-prod find .next -name "*.html" 2>/dev/null | head -10 || echo "No HTML files found"

echo ""
echo -e "${BLUE}🔍 Looking for [locale] directory:${NC}"
docker exec tripcalc-prod find .next/server/app -name "*locale*" 2>/dev/null || echo "No locale dirs found"

echo ""
echo -e "${BLUE}📝 Server.js exists:${NC}"
docker exec tripcalc-prod test -f server.js && echo "✅ Yes" || echo "❌ No"

echo ""
echo -e "${BLUE}🔍 Environment variables:${NC}"
docker exec tripcalc-prod env | grep -E "NEXT|NODE"

echo ""
echo -e "${BLUE}📋 Recent logs:${NC}"
docker logs tripcalc-prod --tail=30

echo ""
echo -e "${BLUE}========================================${NC}"

#!/bin/bash

# Test Routes Script
# Verifies that all Next.js routes are accessible

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Get port from docker-compose or default to 3000
PORT=${1:-3000}

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   Testing TripCalc Routes${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Test root redirect
echo -e "${BLUE}🔍 Testing root path (/)...${NC}"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:${PORT}/)
if [ "$RESPONSE" = "307" ] || [ "$RESPONSE" = "200" ]; then
    echo -e "${GREEN}✅ Root path OK (${RESPONSE})${NC}"
else
    echo -e "${RED}❌ Root path failed (${RESPONSE})${NC}"
fi

# Test /en
echo -e "${BLUE}🔍 Testing /en...${NC}"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:${PORT}/en)
if [ "$RESPONSE" = "200" ]; then
    echo -e "${GREEN}✅ /en OK${NC}"
else
    echo -e "${RED}❌ /en failed (${RESPONSE})${NC}"
fi

# Test /es
echo -e "${BLUE}🔍 Testing /es...${NC}"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:${PORT}/es)
if [ "$RESPONSE" = "200" ]; then
    echo -e "${GREEN}✅ /es OK${NC}"
else
    echo -e "${RED}❌ /es failed (${RESPONSE})${NC}"
fi

# Test /en/about
echo -e "${BLUE}🔍 Testing /en/about...${NC}"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:${PORT}/en/about)
if [ "$RESPONSE" = "200" ]; then
    echo -e "${GREEN}✅ /en/about OK${NC}"
else
    echo -e "${RED}❌ /en/about failed (${RESPONSE})${NC}"
fi

# Test /en/cities
echo -e "${BLUE}🔍 Testing /en/cities...${NC}"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:${PORT}/en/cities)
if [ "$RESPONSE" = "200" ]; then
    echo -e "${GREEN}✅ /en/cities OK${NC}"
else
    echo -e "${RED}❌ /en/cities failed (${RESPONSE})${NC}"
fi

# Test /en/cities/barcelona
echo -e "${BLUE}🔍 Testing /en/cities/barcelona...${NC}"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:${PORT}/en/cities/barcelona)
if [ "$RESPONSE" = "200" ]; then
    echo -e "${GREEN}✅ /en/cities/barcelona OK${NC}"
else
    echo -e "${RED}❌ /en/cities/barcelona failed (${RESPONSE})${NC}"
fi

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   Test Complete${NC}"
echo -e "${BLUE}========================================${NC}"

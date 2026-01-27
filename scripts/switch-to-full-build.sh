#!/bin/bash

# Switch to Full Build Mode
# Cambia de standalone a full build (mejor para next-intl)

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   Switching to Full Build Mode${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

echo -e "${YELLOW}⚠️  This will switch from standalone to full build${NC}"
echo -e "${YELLOW}⚠️  Better compatibility with next-intl${NC}"
echo ""

read -p "Continue? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "Cancelled"
    exit 0
fi

# Backup current files
echo -e "${BLUE}📦 Backing up current files...${NC}"
cp Dockerfile Dockerfile.standalone.backup
cp next.config.ts next.config.ts.standalone.backup

# Switch to full build
echo -e "${BLUE}🔄 Switching files...${NC}"
cp Dockerfile.full Dockerfile
cp next.config.full.ts next.config.ts

echo -e "${GREEN}✅ Files switched${NC}"
echo ""
echo -e "${BLUE}Now run:${NC}"
echo "  ./scripts/rebuild-clean.sh"
echo ""
echo -e "${YELLOW}To revert:${NC}"
echo "  cp Dockerfile.standalone.backup Dockerfile"
echo "  cp next.config.ts.standalone.backup next.config.ts"

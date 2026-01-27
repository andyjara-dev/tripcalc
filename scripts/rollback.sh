#!/bin/bash

# TripCalc Rollback Script
# Usage: ./scripts/rollback.sh [backup_name]

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

BACKUP_DIR="$HOME/backups/tripcalc"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   TripCalc Rollback${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if backup directory exists
if [ ! -d "$BACKUP_DIR" ]; then
    echo -e "${RED}❌ Backup directory not found: ${BACKUP_DIR}${NC}"
    exit 1
fi

# If no backup specified, show available backups
if [ -z "$1" ]; then
    echo -e "${YELLOW}Available backups:${NC}"
    echo ""
    ls -1 "${BACKUP_DIR}"/*_image.tar.gz 2>/dev/null | sed 's/_image.tar.gz//' | xargs -n1 basename
    echo ""
    echo -e "${YELLOW}Usage: ./scripts/rollback.sh [backup_name]${NC}"
    echo -e "${YELLOW}Example: ./scripts/rollback.sh tripcalc_20260127_120000${NC}"
    exit 0
fi

BACKUP_NAME="$1"
IMAGE_BACKUP="${BACKUP_DIR}/${BACKUP_NAME}_image.tar.gz"
CODE_BACKUP="${BACKUP_DIR}/${BACKUP_NAME}_code.tar.gz"
ENV_BACKUP="${BACKUP_DIR}/${BACKUP_NAME}_env"

# Check if backup exists
if [ ! -f "$IMAGE_BACKUP" ]; then
    echo -e "${RED}❌ Backup not found: ${IMAGE_BACKUP}${NC}"
    exit 1
fi

# Confirm rollback
echo -e "${YELLOW}⚠️  WARNING: This will rollback to backup: ${BACKUP_NAME}${NC}"
echo -e "${YELLOW}⚠️  Current version will be stopped${NC}"
read -p "Continue? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo -e "${RED}❌ Rollback cancelled${NC}"
    exit 0
fi

# Stop current container
echo ""
echo -e "${BLUE}🛑 Stopping current container...${NC}"
docker-compose -f docker-compose.prod.yml down

# Load backup image
echo -e "${BLUE}📦 Loading backup image...${NC}"
gunzip -c "$IMAGE_BACKUP" | docker load

# Restore code if available
if [ -f "$CODE_BACKUP" ]; then
    echo -e "${BLUE}📁 Restoring source code...${NC}"
    tar -xzf "$CODE_BACKUP" -C .
fi

# Restore environment if available
if [ -f "$ENV_BACKUP" ]; then
    echo -e "${BLUE}🔒 Restoring environment...${NC}"
    cp "$ENV_BACKUP" .env.production
fi

# Start container
echo -e "${BLUE}▶️  Starting container...${NC}"
docker-compose -f docker-compose.prod.yml up -d

# Wait and check
echo -e "${BLUE}⏳ Waiting for application...${NC}"
sleep 10

if docker ps | grep -q tripcalc-prod; then
    echo -e "${GREEN}✅ Rollback successful${NC}"
    echo ""
    echo -e "${BLUE}🧪 Testing endpoint...${NC}"
    if curl -f http://localhost:3000 > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Application is responding${NC}"
    else
        echo -e "${RED}❌ Application not responding${NC}"
    fi
else
    echo -e "${RED}❌ Rollback failed${NC}"
    docker-compose -f docker-compose.prod.yml logs --tail=50
    exit 1
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}   Rollback Complete${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

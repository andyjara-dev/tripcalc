#!/bin/bash

# TripCalc Backup Script
# Usage: ./scripts/backup.sh

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
BACKUP_DIR="$HOME/backups/tripcalc"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="tripcalc_${DATE}"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   TripCalc Backup${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Backup Docker image
echo -e "${BLUE}📦 Backing up Docker image...${NC}"
docker save tripcalc:production | gzip > "${BACKUP_DIR}/${BACKUP_NAME}_image.tar.gz"
echo -e "${GREEN}✅ Image backed up to: ${BACKUP_DIR}/${BACKUP_NAME}_image.tar.gz${NC}"

# Backup source code
echo -e "${BLUE}📁 Backing up source code...${NC}"
tar -czf "${BACKUP_DIR}/${BACKUP_NAME}_code.tar.gz" \
  --exclude='node_modules' \
  --exclude='.next' \
  --exclude='.git' \
  --exclude='*.log' \
  .
echo -e "${GREEN}✅ Code backed up to: ${BACKUP_DIR}/${BACKUP_NAME}_code.tar.gz${NC}"

# Backup environment files
echo -e "${BLUE}🔒 Backing up environment files...${NC}"
if [ -f .env.production ]; then
    cp .env.production "${BACKUP_DIR}/${BACKUP_NAME}_env"
    echo -e "${GREEN}✅ Environment backed up${NC}"
fi

# List backups
echo ""
echo -e "${BLUE}📋 Available backups:${NC}"
ls -lh "$BACKUP_DIR" | tail -5

# Backup size
TOTAL_SIZE=$(du -sh "$BACKUP_DIR" | cut -f1)
echo ""
echo -e "${GREEN}Total backup size: ${TOTAL_SIZE}${NC}"

# Cleanup old backups (keep last 5)
echo ""
echo -e "${BLUE}🧹 Cleaning old backups (keeping last 5)...${NC}"
cd "$BACKUP_DIR"
ls -t tripcalc_*_image.tar.gz 2>/dev/null | tail -n +6 | xargs -r rm --
ls -t tripcalc_*_code.tar.gz 2>/dev/null | tail -n +6 | xargs -r rm --
ls -t tripcalc_*_env 2>/dev/null | tail -n +6 | xargs -r rm --
echo -e "${GREEN}✅ Cleanup complete${NC}"

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}   Backup Complete${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "Backup location: ${BACKUP_DIR}"
echo -e "Backup name: ${BACKUP_NAME}"
echo ""

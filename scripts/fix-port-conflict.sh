#!/bin/bash

# Fix Port Conflict Script
# Helps identify and resolve port 3000 conflicts

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   Port Conflict Resolver${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check what's using port 3000
echo -e "${BLUE}🔍 Checking what's using port 3000...${NC}"
echo ""

if command -v lsof &> /dev/null; then
    PORT_INFO=$(sudo lsof -i :3000 -t 2>/dev/null || echo "")
    if [ -n "$PORT_INFO" ]; then
        echo -e "${YELLOW}⚠️  Port 3000 is in use:${NC}"
        sudo lsof -i :3000
        echo ""

        # Check if it's a docker container
        CONTAINER_USING_PORT=$(docker ps --format '{{.Names}}' --filter "publish=3000" 2>/dev/null || echo "")
        if [ -n "$CONTAINER_USING_PORT" ]; then
            echo -e "${YELLOW}Docker container using port 3000: ${CONTAINER_USING_PORT}${NC}"
            echo ""
        fi
    else
        echo -e "${GREEN}✅ Port 3000 is available${NC}"
        exit 0
    fi
else
    echo -e "${YELLOW}⚠️  lsof not available, using alternative method...${NC}"
    if netstat -tuln | grep -q ":3000 "; then
        echo -e "${YELLOW}⚠️  Port 3000 appears to be in use${NC}"
        netstat -tuln | grep ":3000"
    else
        echo -e "${GREEN}✅ Port 3000 appears to be available${NC}"
        exit 0
    fi
fi

echo ""
echo -e "${BLUE}📋 Options to resolve:${NC}"
echo ""
echo "1. Change TripCalc to use a different port (e.g., 3001, 3002)"
echo "2. Stop the process/container using port 3000"
echo "3. Keep current setup and configure nginx to use the alternative port"
echo ""

read -p "Select option (1/2/3) or press Enter to exit: " OPTION

case $OPTION in
    1)
        echo ""
        read -p "Enter new port for TripCalc (e.g., 3001): " NEW_PORT

        if [ -z "$NEW_PORT" ]; then
            echo -e "${RED}❌ No port specified${NC}"
            exit 1
        fi

        # Update docker-compose.prod.yml
        echo -e "${BLUE}📝 Updating docker-compose.prod.yml...${NC}"
        sed -i "s/\"3000:3000\"/\"${NEW_PORT}:3000\"/" docker-compose.prod.yml

        echo -e "${GREEN}✅ Updated to use port ${NEW_PORT}${NC}"
        echo ""
        echo -e "${YELLOW}⚠️  IMPORTANT: Update your nginx configuration!${NC}"
        echo -e "Edit /etc/nginx/sites-available/tripcalc.site"
        echo -e "Change: proxy_pass http://localhost:3000;"
        echo -e "To:     proxy_pass http://localhost:${NEW_PORT};"
        echo ""
        echo "Then run:"
        echo "  sudo nginx -t"
        echo "  sudo systemctl reload nginx"
        echo "  ./scripts/deploy.sh"
        ;;

    2)
        echo ""
        if [ -n "$CONTAINER_USING_PORT" ]; then
            echo -e "${YELLOW}Stopping container: ${CONTAINER_USING_PORT}${NC}"
            read -p "Are you sure? (yes/no): " CONFIRM
            if [ "$CONFIRM" = "yes" ]; then
                docker stop "$CONTAINER_USING_PORT"
                echo -e "${GREEN}✅ Container stopped${NC}"
                echo ""
                echo "Now you can run: ./scripts/deploy.sh"
            else
                echo -e "${YELLOW}Operation cancelled${NC}"
            fi
        elif [ -n "$PORT_INFO" ]; then
            echo -e "${YELLOW}Process ID using port 3000: ${PORT_INFO}${NC}"
            echo -e "${RED}⚠️  Be careful! Make sure you know what this process is before killing it${NC}"
            read -p "Kill this process? (yes/no): " CONFIRM
            if [ "$CONFIRM" = "yes" ]; then
                sudo kill -9 $PORT_INFO
                echo -e "${GREEN}✅ Process killed${NC}"
                echo ""
                echo "Now you can run: ./scripts/deploy.sh"
            else
                echo -e "${YELLOW}Operation cancelled${NC}"
            fi
        fi
        ;;

    3)
        echo ""
        echo -e "${BLUE}💡 To keep current setup:${NC}"
        echo ""
        echo "1. Choose a different port for TripCalc (option 1)"
        echo "2. Update nginx to proxy to that port"
        echo "3. Both services will run on different ports"
        echo ""
        ;;

    *)
        echo -e "${YELLOW}Operation cancelled${NC}"
        exit 0
        ;;
esac

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   Done${NC}"
echo -e "${BLUE}========================================${NC}"

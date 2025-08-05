#!/bin/bash

# Script to start Docker and Supabase local development
echo "🐳 Starting Docker and Supabase setup..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Step 1: Checking Docker installation...${NC}"

# Check if Docker is installed
if command -v docker &> /dev/null; then
    echo -e "${GREEN}✅ Docker is installed${NC}"
    docker --version
else
    echo -e "${RED}❌ Docker is not installed or not in PATH${NC}"
    exit 1
fi

echo -e "\n${BLUE}Step 2: Starting Docker Desktop...${NC}"

# Check if Docker Desktop is running
if docker info &> /dev/null; then
    echo -e "${GREEN}✅ Docker Desktop is already running${NC}"
else
    echo -e "${YELLOW}⏳ Starting Docker Desktop...${NC}"
    open -a Docker
    
    # Wait for Docker to start
    echo "Waiting for Docker Desktop to start..."
    while ! docker info &> /dev/null; do
        echo -n "."
        sleep 2
    done
    echo -e "\n${GREEN}✅ Docker Desktop is now running${NC}"
fi

echo -e "\n${BLUE}Step 3: Testing Docker...${NC}"
docker ps &> /dev/null
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Docker is working correctly${NC}"
else
    echo -e "${RED}❌ Docker is not working properly${NC}"
    exit 1
fi

echo -e "\n${BLUE}Step 4: Starting Supabase local database...${NC}"

# Navigate to project directory
cd "$(dirname "$0")/.."

# Start Supabase
echo "Starting Supabase local development environment..."
npm run db:start

echo -e "\n${GREEN}🎉 Setup complete!${NC}"
echo -e "${BLUE}Next steps:${NC}"
echo "1. Supabase should now be running locally"
echo "2. You can restart the full development environment with: npm run dev:full"
echo "3. Access your app at: http://localhost:3002/"

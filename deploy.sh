#!/bin/bash

# Deployment script for CCC Web News
# Usage: ./deploy.sh [platform]
# Platforms: vercel, netlify, surge, firebase, docker

set -e

PLATFORM=${1:-vercel}
echo "🚀 Deploying CCC Web News to $PLATFORM..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing dependencies...${NC}"
    npm ci
fi

# Build the project
echo -e "${YELLOW}🔨 Building project...${NC}"
npm run build

# Deploy based on platform
case $PLATFORM in
    "vercel")
        echo -e "${YELLOW}🚀 Deploying to Vercel...${NC}"
        npx vercel --prod
        ;;
    "netlify")
        echo -e "${YELLOW}🚀 Deploying to Netlify...${NC}"
        npx netlify deploy --prod --dir=dist
        ;;
    "surge")
        echo -e "${YELLOW}🚀 Deploying to Surge...${NC}"
        npx surge dist ccc-web-news.surge.sh
        ;;
    "firebase")
        echo -e "${YELLOW}🚀 Deploying to Firebase...${NC}"
        firebase deploy
        ;;
    "docker")
        echo -e "${YELLOW}🐳 Building Docker image...${NC}"
        docker build -t ccc-web-news .
        echo -e "${YELLOW}🚀 Running Docker container...${NC}"
        docker run -p 80:80 -d ccc-web-news
        ;;
    *)
        echo -e "${RED}❌ Unknown platform: $PLATFORM${NC}"
        echo "Available platforms: vercel, netlify, surge, firebase, docker"
        exit 1
        ;;
esac

echo -e "${GREEN}✅ Deployment completed successfully!${NC}"

# Show deployment info
case $PLATFORM in
    "vercel")
        echo -e "${GREEN}📱 Your app should be available at: https://ccc-web-news.vercel.app${NC}"
        ;;
    "netlify")
        echo -e "${GREEN}📱 Check your Netlify dashboard for the deployment URL${NC}"
        ;;
    "surge")
        echo -e "${GREEN}📱 Your app is available at: https://ccc-web-news.surge.sh${NC}"
        ;;
    "firebase")
        echo -e "${GREEN}📱 Check your Firebase console for the deployment URL${NC}"
        ;;
    "docker")
        echo -e "${GREEN}📱 Your app is running locally at: http://localhost${NC}"
        ;;
esac
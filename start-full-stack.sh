#!/bin/bash

# F1 Application - Complete Startup Script
# Starts MongoDB, Python FastF1 Service, and Node.js Backend

echo "🏎️  Starting F1 Application Stack"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 1. Check and Start MongoDB
echo -e "${YELLOW}[1/3] Starting MongoDB...${NC}"
if pgrep -x mongod > /dev/null; then
    echo -e "${GREEN}✓ MongoDB already running${NC}"
else
    mkdir -p ~/data/db
    mongod --dbpath ~/data/db --fork --logpath ~/data/db/mongod.log
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ MongoDB started successfully${NC}"
    else
        echo -e "${RED}✗ MongoDB failed to start${NC}"
        echo "  Try: mongod --dbpath ~/data/db"
        exit 1
    fi
fi
echo ""

# Wait for MongoDB to be ready
sleep 2

# 2. Start Python FastF1 Service
echo -e "${YELLOW}[2/3] Starting Python FastF1 Service...${NC}"
cd /Users/swayam.vernekar/Desktop/TheGridLive/f1-data-service

# Kill existing Python service if running
lsof -ti:5003 | xargs kill -9 2>/dev/null

# Start in background
python3 python_server.py > /dev/null 2>&1 &
PYTHON_PID=$!

sleep 3

if ps -p $PYTHON_PID > /dev/null; then
    echo -e "${GREEN}✓ Python FastF1 service started (PID: $PYTHON_PID)${NC}"
else
    echo -e "${RED}✗ Python FastF1 service failed to start${NC}"
    echo "  Try manually: cd f1-data-service && python3 python_server.py"
fi
echo ""

# 3. Start Node.js Backend
echo -e "${YELLOW}[3/3] Starting Node.js Backend...${NC}"
cd /Users/swayam.vernekar/Desktop/TheGridLive/backend

# Kill existing Node service if running
pkill -f "node.*server.js" 2>/dev/null

# Start in background
node server.js > /dev/null 2>&1 &
NODE_PID=$!

sleep 2

if ps -p $NODE_PID > /dev/null; then
    echo -e "${GREEN}✓ Node.js backend started (PID: $NODE_PID)${NC}"
else
    echo -e "${RED}✗ Node.js backend failed to start${NC}"
    echo "  Try manually: cd backend && node server.js"
    exit 1
fi
echo ""

# 4. Test all services
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧪 Testing Services..."
echo ""

# Test MongoDB
if mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ MongoDB connection OK${NC}"
else
    echo -e "${YELLOW}⚠ MongoDB connection failed (may need mongosh installed)${NC}"
fi

# Test FastF1
sleep 2
if curl -s http://localhost:5003/api/v1/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ FastF1 API responding on port 5003${NC}"
else
    echo -e "${YELLOW}⚠ FastF1 API not responding${NC}"
fi

# Test Backend
if curl -s http://localhost:5002/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Backend API responding on port 5002${NC}"
else
    echo -e "${RED}✗ Backend API not responding${NC}"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 Startup Complete!"
echo ""
echo "📡 Services:"
echo "   MongoDB:     mongodb://localhost:27017"
echo "   FastF1 API:  http://localhost:5003"
echo "   Backend API: http://localhost:5002"
echo ""
echo "🔗 Quick Links:"
echo "   Health Check: http://localhost:5002/api/health"
echo "   API Docs:     See MONGODB_SETUP_GUIDE.md"
echo ""
echo "🛑 To stop all services:"
echo "   ./stop-all.sh"
echo ""
echo "💡 Next Steps:"
echo "   1. Open MongoDB Compass: mongodb://localhost:27017/f1app"
echo "   2. Populate data: curl http://localhost:5002/api/data/standings/drivers?year=2024"
echo "   3. Start frontend: cd frontend && npm run dev"
echo ""

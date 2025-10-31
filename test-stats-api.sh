#!/bin/bash

# F1 App API Test Script
# Tests the new /api/data/stats endpoint

echo "🧪 Testing F1 App API Integration"
echo "=================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Check if backend is running
echo -n "1. Checking backend (port 5002)... "
if curl -s http://localhost:5002/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Running${NC}"
else
    echo -e "${RED}✗ Not running${NC}"
    echo -e "${YELLOW}Please start backend: cd backend && npm start${NC}"
    exit 1
fi

# Test 2: Test stats endpoint
echo -n "2. Testing /api/data/stats endpoint... "
STATS_RESPONSE=$(curl -s http://localhost:5002/api/data/stats)
if [ -n "$STATS_RESPONSE" ]; then
    echo -e "${GREEN}✓ Responding${NC}"
    
    # Parse response
    DRIVERS_COUNT=$(echo "$STATS_RESPONSE" | grep -o '"drivers"' | wc -l)
    TEAMS_COUNT=$(echo "$STATS_RESPONSE" | grep -o '"teams"' | wc -l)
    NEWS_COUNT=$(echo "$STATS_RESPONSE" | grep -o '"news"' | wc -l)
    LEGENDS_COUNT=$(echo "$STATS_RESPONSE" | grep -o '"legendaryDrivers"' | wc -l)
    
    echo "   └─ Data structure:"
    if [ $DRIVERS_COUNT -gt 0 ]; then
        echo -e "      ${GREEN}✓ drivers${NC}"
    else
        echo -e "      ${RED}✗ drivers missing${NC}"
    fi
    
    if [ $TEAMS_COUNT -gt 0 ]; then
        echo -e "      ${GREEN}✓ teams${NC}"
    else
        echo -e "      ${RED}✗ teams missing${NC}"
    fi
    
    if [ $NEWS_COUNT -gt 0 ]; then
        echo -e "      ${GREEN}✓ news${NC}"
    else
        echo -e "      ${RED}✗ news missing${NC}"
    fi
    
    if [ $LEGENDS_COUNT -gt 0 ]; then
        echo -e "      ${GREEN}✓ legendaryDrivers${NC}"
    else
        echo -e "      ${RED}✗ legendaryDrivers missing${NC}"
    fi
else
    echo -e "${RED}✗ No response${NC}"
    exit 1
fi

# Test 3: Check frontend API helper
echo -n "3. Checking frontend API helper... "
if [ -f "frontend/src/api/f1Api.js" ]; then
    if grep -q "fetchStats" frontend/src/api/f1Api.js; then
        echo -e "${GREEN}✓ fetchStats() found${NC}"
    else
        echo -e "${RED}✗ fetchStats() not found${NC}"
        exit 1
    fi
else
    echo -e "${RED}✗ f1Api.js not found${NC}"
    exit 1
fi

# Test 4: Check page integrations
echo "4. Checking page integrations:"

# F1Rewind
echo -n "   ├─ F1Rewind.jsx... "
if grep -q "fetchStats" frontend/src/pages/F1Rewind.jsx && \
   grep -q "useEffect" frontend/src/pages/F1Rewind.jsx && \
   grep -q "setLegendaryDrivers" frontend/src/pages/F1Rewind.jsx; then
    echo -e "${GREEN}✓ API integrated${NC}"
else
    echo -e "${RED}✗ Not integrated${NC}"
fi

# PodiumPredictor
echo -n "   ├─ PodiumPredictor.jsx... "
if grep -q "fetchStats" frontend/src/pages/PodiumPredictor.jsx && \
   grep -q "useEffect" frontend/src/pages/PodiumPredictor.jsx && \
   grep -q "setDrivers" frontend/src/pages/PodiumPredictor.jsx; then
    echo -e "${GREEN}✓ API integrated${NC}"
else
    echo -e "${RED}✗ Not integrated${NC}"
fi

# News
echo -n "   └─ News.jsx... "
if grep -q "fetchStats" frontend/src/pages/News.jsx && \
   grep -q "useEffect" frontend/src/pages/News.jsx && \
   grep -q "setNewsArticles" frontend/src/pages/News.jsx; then
    echo -e "${GREEN}✓ API integrated${NC}"
else
    echo -e "${RED}✗ Not integrated${NC}"
fi

echo ""
echo -e "${GREEN}✅ All tests passed!${NC}"
echo ""
echo "📊 Sample Response Preview:"
echo "$STATS_RESPONSE" | head -20
echo "..."
echo ""
echo "🎯 Next Steps:"
echo "  1. Start frontend: cd frontend && npm run dev"
echo "  2. Visit: http://localhost:5173/f1-rewind"
echo "  3. Visit: http://localhost:5173/podium-predictor"
echo "  4. Visit: http://localhost:5173/news"
echo ""

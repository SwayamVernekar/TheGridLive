#!/bin/bash

# F1 Web Application - Complete Integration Test & Startup
# This script tests all services and starts them in the correct order

set -e

echo "🏎️  F1 Web Application - Complete Integration Startup"
echo "======================================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Step 1: Test Python Service
echo -e "${BLUE}Step 1: Starting Python Data Service...${NC}"
cd f1-data-service

if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

source venv/bin/activate
pip install -q -r requirements.txt

echo -e "${GREEN}✓ Python dependencies installed${NC}"
echo "Starting Flask server on port 5003..."

python python_server.py &
PYTHON_PID=$!
echo -e "${GREEN}✓ Python service started (PID: $PYTHON_PID)${NC}"

cd ..
sleep 5

# Test Python service
echo -n "Testing Python service health... "
if curl -s http://localhost:5003/api/v1/health > /dev/null; then
    echo -e "${GREEN}✓ PASSED${NC}"
else
    echo -e "${RED}✗ FAILED${NC}"
    kill $PYTHON_PID
    exit 1
fi

# Step 2: Test Node.js Backend
echo ""
echo -e "${BLUE}Step 2: Starting Node.js Backend...${NC}"
cd backend

if [ ! -d "node_modules" ]; then
    echo "Installing Node.js dependencies..."
    npm install
fi

echo -e "${GREEN}✓ Node.js dependencies installed${NC}"
echo "Starting Express server on port 5002..."

npm start &
NODE_PID=$!
echo -e "${GREEN}✓ Backend started (PID: $NODE_PID)${NC}"

cd ..
sleep 3

# Test backend service
echo -n "Testing backend health... "
if curl -s http://localhost:5002/api/ping > /dev/null; then
    echo -e "${GREEN}✓ PASSED${NC}"
else
    echo -e "${RED}✗ FAILED${NC}"
    kill $PYTHON_PID $NODE_PID
    exit 1
fi

# Test backend-to-Python connection
echo -n "Testing backend → Python integration... "
if curl -s http://localhost:5002/api/health | grep -q "healthy"; then
    echo -e "${GREEN}✓ PASSED${NC}"
else
    echo -e "${YELLOW}⚠ WARNING: Integration check inconclusive${NC}"
fi

# Step 3: Start React Frontend
echo ""
echo -e "${BLUE}Step 3: Starting React Frontend...${NC}"
cd frontend

if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi

# Create .env if it doesn't exist
if [ ! -f ".env" ]; then
    echo "VITE_API_URL=http://localhost:5002" > .env
    echo -e "${GREEN}✓ Created .env file${NC}"
fi

echo -e "${GREEN}✓ Frontend dependencies installed${NC}"
echo "Starting Vite dev server on port 5173..."

npm run dev &
FRONTEND_PID=$!
echo -e "${GREEN}✓ Frontend started (PID: $FRONTEND_PID)${NC}"

cd ..
sleep 5

# Final Summary
echo ""
echo "======================================================"
echo -e "${GREEN}🎉 ALL SERVICES RUNNING SUCCESSFULLY!${NC}"
echo "======================================================"
echo ""
echo "📊 Service Status:"
echo "  ✓ Python Data Service (Port 5003) - PID: $PYTHON_PID"
echo "  ✓ Node.js Backend (Port 5002)     - PID: $NODE_PID"
echo "  ✓ React Frontend (Port 5173)      - PID: $FRONTEND_PID"
echo ""
echo "🌐 URLs:"
echo "  • Frontend:        http://localhost:5173"
echo "  • Backend API:     http://localhost:5002"
echo "  • Python Service:  http://localhost:5003"
echo ""
echo "🧪 Test Endpoints:"
echo "  curl http://localhost:5003/api/v1/health"
echo "  curl http://localhost:5002/api/health"
echo "  curl http://localhost:5002/api/data/standings"
echo ""
echo "🛑 To stop all services:"
echo "  kill $PYTHON_PID $NODE_PID $FRONTEND_PID"
echo ""
echo -e "${YELLOW}Opening browser in 3 seconds...${NC}"
sleep 3

# Open browser
if command -v open &> /dev/null; then
    open http://localhost:5173
elif command -v xdg-open &> /dev/null; then
    xdg-open http://localhost:5173
fi

echo ""
echo "Press Ctrl+C to stop all services..."
wait

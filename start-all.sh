#!/bin/bash

# F1 Web Application - Complete Startup Script
# This script starts all three services in the correct order

set -e  # Exit on error

echo "🏎️  F1 Web Application - Starting All Services"
echo "================================================"
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python 3 is not installed. Please install Python 3.8 or higher.${NC}"
    exit 1
fi

# Check if Node is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js 18 or higher.${NC}"
    exit 1
fi

# Check if MongoDB is running (optional)
if command -v mongod &> /dev/null; then
    if pgrep -x "mongod" > /dev/null; then
        echo -e "${GREEN}✅ MongoDB is running${NC}"
    else
        echo -e "${YELLOW}⚠️  MongoDB is not running. User data features will not work.${NC}"
        echo "   Start MongoDB with: brew services start mongodb-community (macOS)"
        echo "   Or use MongoDB Atlas cloud database"
    fi
fi

echo ""
echo "Starting services..."
echo ""

# Function to check if port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "${YELLOW}⚠️  Port $1 is already in use${NC}"
        return 1
    fi
    return 0
}

# Start Python Data Service
echo -e "${YELLOW}📊 Starting Python Data Service (Port 5003)...${NC}"
cd f1-data-service

if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

source venv/bin/activate
pip install -q -r requirements.txt

if check_port 5003; then
    python python_server.py &
    PYTHON_PID=$!
    echo -e "${GREEN}✅ Python service started (PID: $PYTHON_PID)${NC}"
else
    echo -e "${RED}Port 5003 is in use. Please stop the existing service.${NC}"
    exit 1
fi

cd ..
sleep 3

# Start Node.js Backend
echo ""
echo -e "${YELLOW}🚀 Starting Node.js Backend (Port 5002)...${NC}"
cd backend

if [ ! -d "node_modules" ]; then
    echo "Installing Node.js dependencies..."
    npm install
fi

if check_port 5002; then
    npm start &
    NODE_PID=$!
    echo -e "${GREEN}✅ Backend started (PID: $NODE_PID)${NC}"
else
    echo -e "${RED}Port 5002 is in use. Please stop the existing service.${NC}"
    kill $PYTHON_PID
    exit 1
fi

cd ..
sleep 2

# Start React Frontend
echo ""
echo -e "${YELLOW}⚛️  Starting React Frontend (Port 5173)...${NC}"
cd frontend

if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi

if check_port 5173; then
    npm run dev &
    FRONTEND_PID=$!
    echo -e "${GREEN}✅ Frontend started (PID: $FRONTEND_PID)${NC}"
else
    echo -e "${RED}Port 5173 is in use. Please stop the existing service.${NC}"
    kill $PYTHON_PID $NODE_PID
    exit 1
fi

cd ..

echo ""
echo "================================================"
echo -e "${GREEN}🎉 All services started successfully!${NC}"
echo ""
echo "Service URLs:"
echo "  • Python Data Service: http://localhost:5003"
echo "  • Node.js Backend:     http://localhost:5002"
echo "  • React Frontend:      http://localhost:5173"
echo ""
echo "PIDs:"
echo "  • Python: $PYTHON_PID"
echo "  • Backend: $NODE_PID"
echo "  • Frontend: $FRONTEND_PID"
echo ""
echo "To stop all services, press Ctrl+C or run:"
echo "  kill $PYTHON_PID $NODE_PID $FRONTEND_PID"
echo ""
echo -e "${YELLOW}Opening browser in 5 seconds...${NC}"
sleep 5

# Open browser (macOS)
if command -v open &> /dev/null; then
    open http://localhost:5173
elif command -v xdg-open &> /dev/null; then
    xdg-open http://localhost:5173
fi

# Wait for user to stop
echo ""
echo "Press Ctrl+C to stop all services..."
wait

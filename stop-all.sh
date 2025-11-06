#!/bin/bash

# F1 Application - Stop All Services Script

echo "🛑 Stopping F1 Application Services..."
echo ""

# Stop Node.js Backend
echo "Stopping Node.js Backend..."
pkill -f "node.*server.js"
lsof -ti:5002 | xargs kill -9 2>/dev/null
echo "✓ Node.js backend stopped"

# Stop Python FastF1 Service
echo "Stopping Python FastF1 Service..."
pkill -f "python.*python_server"
lsof -ti:5003 | xargs kill -9 2>/dev/null
echo "✓ Python service stopped"

# Stop MongoDB
echo "Stopping MongoDB..."
if pgrep -x mongod > /dev/null; then
    pkill -x mongod
    echo "✓ MongoDB stopped"
else
    echo "✓ MongoDB was not running"
fi

echo ""
echo "✅ All services stopped!"
echo ""

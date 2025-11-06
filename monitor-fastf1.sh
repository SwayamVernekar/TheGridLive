#!/bin/bash

# FastF1 Service Monitor
# Monitors the FastF1 API and tests endpoints until they're ready

echo "🔄 Monitoring FastF1 Service..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

check_count=0
max_checks=60  # 10 minutes max (10 second intervals)

while [ $check_count -lt $max_checks ]; do
    ((check_count++))
    echo -n "[$check_count] Checking FastF1 API... "
    
    # Check health endpoint
    health=$(curl -m 5 -s http://localhost:5003/api/v1/health 2>/dev/null)
    
    if [ $? -eq 0 ] && [ ! -z "$health" ]; then
        echo "✅ Health OK"
        
        # Try fetching 2024 standings
        echo -n "    Testing 2024 standings... "
        standings=$(curl -m 30 -s "http://localhost:5003/api/v1/standings?year=2024" 2>/dev/null)
        
        if echo "$standings" | grep -q '"standings"'; then
            echo "✅ SUCCESS!"
            echo ""
            echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
            echo "🎉 FastF1 API is ready!"
            echo ""
            echo "📊 Data available:"
            echo "$standings" | jq -r '"   Season: " + (.season|tostring) + " | Last Race: " + .lastRace + " | Drivers: " + (.standings|length|tostring)'
            echo ""
            echo "🚀 Now populating MongoDB..."
            echo ""
            
            # Populate MongoDB via backend
            cd /Users/swayam.vernekar/Desktop/TheGridLive
            
            echo "1️⃣  Fetching driver standings..."
            curl -s "http://localhost:5002/api/data/standings/drivers?year=2024" | jq '{source, year, drivers: (.standings|length)}' | grep -v null
            
            echo ""
            echo "2️⃣  Fetching schedule..."
            curl -s "http://localhost:5002/api/data/schedule?year=2024" | jq '{source, year, races: (.races|length)}' | grep -v null
            
            echo ""
            echo "✅ MongoDB populated! Check collections:"
            mongosh f1app --eval "db.getCollectionNames().forEach(c => print(c + ': ' + db[c].countDocuments()))" --quiet
            
            echo ""
            echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
            echo "✨ Setup complete! All services ready."
            echo ""
            exit 0
        else
            error=$(echo "$standings" | jq -r '.error // "Loading data"' 2>/dev/null || echo "Loading data")
            echo "⏳ $error"
        fi
    else
        echo "⏳ Service initializing..."
    fi
    
    echo "    Waiting 10 seconds... (Press Ctrl+C to stop)"
    sleep 10
done

echo ""
echo "⚠️  Timeout after 10 minutes. FastF1 may still be loading."
echo "   Check cache directory: f1-data-service/cache/"
echo "   Or try manually: curl http://localhost:5003/api/v1/standings?year=2024"

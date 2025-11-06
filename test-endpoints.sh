#!/bin/bash

# F1 Backend API Endpoint Tester
# Tests all available endpoints and reports results

BASE_URL="http://localhost:5002"
PASSED=0
FAILED=0

echo "🏎️  F1 Backend API Endpoint Test Suite"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Function to test an endpoint
test_endpoint() {
    local name=$1
    local endpoint=$2
    local expected_status=${3:-200}
    
    echo -n "Testing $name... "
    
    response=$(curl -s -w "\n%{http_code}" "$BASE_URL$endpoint")
    status_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)
    
    if [ "$status_code" == "$expected_status" ]; then
        echo "✅ PASSED (HTTP $status_code)"
        ((PASSED++))
        
        # Show a preview of the response
        if command -v jq &> /dev/null; then
            echo "$body" | jq -C '.' | head -n 10
            echo ""
        fi
    else
        echo "❌ FAILED (Expected HTTP $expected_status, got $status_code)"
        ((FAILED++))
        echo "Response: $body" | head -n 5
        echo ""
    fi
}

echo "📊 Testing API Endpoints..."
echo ""

# Test all endpoints
test_endpoint "Health Check" "/api/health"
test_endpoint "Driver Standings" "/api/data/standings/drivers"
test_endpoint "Constructor Standings" "/api/data/standings/constructors"
test_endpoint "All Drivers" "/api/data/drivers"
test_endpoint "All Teams" "/api/data/teams"
test_endpoint "Race Schedule" "/api/data/schedule"
test_endpoint "News" "/api/data/news"
test_endpoint "Statistics" "/api/data/stats"
test_endpoint "Race Results 2024 Round 1" "/api/data/race-results/2024/1"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Test Results Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Passed: $PASSED"
echo "❌ Failed: $FAILED"
echo ""

if [ $FAILED -eq 0 ]; then
    echo "🎉 All tests passed!"
    exit 0
else
    echo "⚠️  Some tests failed. Check the output above."
    exit 1
fi

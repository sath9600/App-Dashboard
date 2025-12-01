#!/bin/bash

# Test script for Docker deployment of Questioner App
# This script validates the Docker setup and tests the application

set -e

echo "========================================="
echo "  Testing Docker Deployment"
echo "========================================="
echo

# Function to cleanup on exit
cleanup() {
    echo "Cleaning up..."
    docker-compose down --remove-orphans 2>/dev/null || true
}
trap cleanup EXIT

# Check Docker installation
echo "Step 1: Checking Docker installation..."
if ! command -v docker &> /dev/null; then
    echo "❌ ERROR: Docker is not installed or not in PATH"
    echo "Please install Docker Desktop and ensure it's running"
    exit 1
fi

if ! docker info &> /dev/null; then
    echo "❌ ERROR: Docker daemon is not running"
    echo "Please start Docker Desktop"
    exit 1
fi

echo "✅ Docker is installed and running"
docker --version
echo

# Check Docker Compose
echo "Step 2: Checking Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    echo "❌ ERROR: Docker Compose is not installed"
    exit 1
fi

echo "✅ Docker Compose is available"
docker-compose --version
echo

# Build the application
echo "Step 3: Building Docker image..."
docker-compose build --no-cache
if [ $? -ne 0 ]; then
    echo "❌ ERROR: Failed to build Docker image"
    exit 1
fi
echo "✅ Docker image built successfully"
echo

# Start the application
echo "Step 4: Starting the application..."
docker-compose up -d
if [ $? -ne 0 ]; then
    echo "❌ ERROR: Failed to start containers"
    exit 1
fi
echo "✅ Containers started successfully"
echo

# Wait for application to be ready
echo "Step 5: Waiting for application to be ready..."
for i in {1..30}; do
    if curl -s http://localhost:3000/health > /dev/null 2>&1; then
        echo "✅ Application is responding"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "❌ ERROR: Application failed to start within 30 seconds"
        echo "Container logs:"
        docker-compose logs questioner-app
        exit 1
    fi
    echo "Waiting... ($i/30)"
    sleep 1
done
echo

# Test health endpoint
echo "Step 6: Testing health endpoint..."
HEALTH_RESPONSE=$(curl -s http://localhost:3000/health)
if echo "$HEALTH_RESPONSE" | grep -q '"status":"OK"'; then
    echo "✅ Health check passed"
    echo "Response: $HEALTH_RESPONSE"
else
    echo "❌ ERROR: Health check failed"
    echo "Response: $HEALTH_RESPONSE"
    exit 1
fi
echo

# Test main application
echo "Step 7: Testing main application..."
MAIN_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/)
if [ "$MAIN_RESPONSE" = "200" ]; then
    echo "✅ Main application is accessible (HTTP $MAIN_RESPONSE)"
else
    echo "❌ ERROR: Main application returned HTTP $MAIN_RESPONSE"
    exit 1
fi
echo

# Test API endpoints
echo "Step 8: Testing API endpoints..."

# Test categories endpoint
CATEGORIES_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/categories)
if [ "$CATEGORIES_RESPONSE" = "200" ]; then
    echo "✅ Categories API is working (HTTP $CATEGORIES_RESPONSE)"
else
    echo "❌ ERROR: Categories API returned HTTP $CATEGORIES_RESPONSE"
fi

# Test questions endpoint
QUESTIONS_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/questions)
if [ "$QUESTIONS_RESPONSE" = "200" ]; then
    echo "✅ Questions API is working (HTTP $QUESTIONS_RESPONSE)"
else
    echo "❌ ERROR: Questions API returned HTTP $QUESTIONS_RESPONSE"
fi
echo

# Test database connectivity
echo "Step 9: Testing database connectivity..."
DB_TEST=$(curl -s http://localhost:3000/api/categories | jq -r '.categories | length' 2>/dev/null || echo "error")
if [ "$DB_TEST" != "error" ] && [ "$DB_TEST" -gt 0 ]; then
    echo "✅ Database is connected and has $DB_TEST categories"
else
    echo "❌ ERROR: Database connectivity issue"
fi
echo

# Show container status
echo "Step 10: Container status..."
docker-compose ps
echo

# Show logs (last 20 lines)
echo "Step 11: Recent application logs..."
docker-compose logs --tail=20 questioner-app
echo

echo "========================================="
echo "  🎉 All tests passed successfully!"
echo "========================================="
echo
echo "Application is running at: http://localhost:3000"
echo "Health endpoint: http://localhost:3000/health"
echo
echo "To stop the application:"
echo "  docker-compose down"
echo
echo "To view live logs:"
echo "  docker-compose logs -f questioner-app"
echo

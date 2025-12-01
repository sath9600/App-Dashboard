#!/bin/bash

# Docker deployment script for Questioner App
# This script builds and runs the application in Docker containers

set -e

echo "========================================="
echo "  Questioner App - Docker Deployment"
echo "========================================="
echo

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "ERROR: Docker is not installed"
    echo "Please install Docker from: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "ERROR: Docker Compose is not installed"
    echo "Please install Docker Compose from: https://docs.docker.com/compose/install/"
    exit 1
fi

echo "Docker version:"
docker --version
echo

echo "Docker Compose version:"
docker-compose --version
echo

# Create logs directory if it doesn't exist
mkdir -p logs

# Stop any existing containers
echo "Stopping existing containers..."
docker-compose down --remove-orphans

# Build and start the application
echo "Building and starting the application..."
docker-compose up --build -d

# Wait for the application to be ready
echo "Waiting for application to start..."
sleep 10

# Check if the application is running
if docker-compose ps | grep -q "questioner-app.*Up"; then
    echo
    echo "========================================="
    echo "  Application started successfully!"
    echo "========================================="
    echo
    echo "Access the application at:"
    echo "  http://localhost:3000"
    echo
    echo "To view logs:"
    echo "  docker-compose logs -f questioner-app"
    echo
    echo "To stop the application:"
    echo "  docker-compose down"
    echo
else
    echo "ERROR: Application failed to start"
    echo "Check logs with: docker-compose logs questioner-app"
    exit 1
fi

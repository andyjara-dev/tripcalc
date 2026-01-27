#!/bin/bash

# Script to test Docker build and deployment
set -e

echo "🐳 Testing TripCalc Docker Build..."
echo ""

# Build the image
echo "📦 Building Docker image..."
docker build -t tripcalc:test .

# Check image size
echo ""
echo "📊 Image details:"
docker images tripcalc:test

# Run the container
echo ""
echo "🚀 Starting container..."
docker run -d -p 3000:3000 --name tripcalc-test tripcalc:test

# Wait for container to start
echo ""
echo "⏳ Waiting for application to start (10 seconds)..."
sleep 10

# Test the endpoint
echo ""
echo "🧪 Testing endpoint..."
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Application is running successfully!"
else
    echo "❌ Application failed to respond"
    docker logs tripcalc-test
    exit 1
fi

# Show logs
echo ""
echo "📝 Container logs:"
docker logs tripcalc-test --tail 20

# Cleanup
echo ""
echo "🧹 Cleaning up..."
docker stop tripcalc-test
docker rm tripcalc-test

echo ""
echo "✅ Docker test completed successfully!"
echo ""
echo "To run the container manually:"
echo "  docker run -p 3000:3000 --name tripcalc tripcalc:test"

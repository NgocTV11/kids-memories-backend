#!/bin/bash

# Kids Memories - Docker Setup Script for WSL
# Run this script in WSL terminal

echo "🚀 Kids Memories - Docker Setup"
echo "================================"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed or not in PATH"
    echo "Please install Docker Desktop for Windows and enable WSL integration"
    exit 1
fi

echo "✅ Docker found: $(docker --version)"

# Check if Docker daemon is running
if ! docker ps &> /dev/null; then
    echo "❌ Docker daemon is not running"
    echo "Please start Docker Desktop on Windows"
    exit 1
fi

echo "✅ Docker daemon is running"
echo ""

# Navigate to backend directory
BACKEND_DIR="/mnt/c/Users/NgocTV11/Desktop/AI_pp/kids-memories/source/backend/kids-memories-api"
cd "$BACKEND_DIR" || exit 1

echo "📂 Current directory: $(pwd)"
echo ""

# Check if docker-compose.yml exists
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ docker-compose.yml not found"
    exit 1
fi

echo "✅ docker-compose.yml found"
echo ""

# Start containers
echo "🐳 Starting PostgreSQL and Redis containers..."
echo ""

if docker compose up -d; then
    echo ""
    echo "✅ Containers started successfully!"
    echo ""
    
    # Wait for containers to be healthy
    echo "⏳ Waiting for containers to be ready..."
    sleep 5
    
    # Show running containers
    echo ""
    echo "📊 Running containers:"
    docker ps --filter "name=kids-memories" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    
    echo ""
    echo "✅ Database Setup Complete!"
    echo ""
    echo "📝 Next steps (run in PowerShell):"
    echo "   1. cd c:\\Users\\NgocTV11\\Desktop\\AI_pp\\kids-memories\\source\\backend\\kids-memories-api"
    echo "   2. npx prisma migrate dev --name init"
    echo "   3. npm run start:dev"
    echo ""
    echo "🔗 Connection details:"
    echo "   PostgreSQL: localhost:5432"
    echo "   User: postgres"
    echo "   Password: postgres123"
    echo "   Database: kids_memories"
    echo ""
    echo "   Redis: localhost:6379"
    echo ""
    echo "🛑 To stop containers: docker compose down"
    echo "📊 To view logs: docker compose logs -f"
    
else
    echo ""
    echo "❌ Failed to start containers"
    echo "Check the error messages above"
    exit 1
fi

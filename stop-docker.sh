#!/bin/bash

# Kids Memories - Docker Stop Script for WSL

echo "🛑 Stopping Kids Memories containers..."
echo ""

# Navigate to backend directory
BACKEND_DIR="/mnt/c/Users/NgocTV11/Desktop/AI_pp/kids-memories/source/backend/kids-memories-api"
cd "$BACKEND_DIR" || exit 1

# Stop containers
if docker compose down; then
    echo ""
    echo "✅ Containers stopped successfully!"
    echo ""
    echo "📝 To start again: ./start-docker.sh"
else
    echo ""
    echo "❌ Failed to stop containers"
    exit 1
fi

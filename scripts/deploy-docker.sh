#!/usr/bin/env sh
set -eu

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker is not installed. Install Docker first, then run this script again."
  exit 1
fi

if docker compose version >/dev/null 2>&1; then
  COMPOSE="docker compose"
elif command -v docker-compose >/dev/null 2>&1; then
  COMPOSE="docker-compose"
else
  echo "Docker Compose is not available."
  echo "Install it on Ubuntu with: sudo apt install docker-compose-v2"
  exit 1
fi

if [ ! -f .env ]; then
  cp .env.production.example .env
  echo "Created .env from .env.production.example."
  echo "Edit .env and set JWT_SECRET and CLIENT_URL before using this in production."
fi

$COMPOSE pull --ignore-buildable || true
$COMPOSE up -d --build

echo "Waiting for services to become healthy..."
$COMPOSE ps

echo "Deployment started."
echo "Frontend: ${CLIENT_URL:-http://localhost:8080}"
echo "Backend health: /api/health"

#!/usr/bin/env bash
set -euo pipefail

cd ~/dumbbell

# Log in to GHCR
echo "${REGISTRY_PASSWORD}" | docker login ghcr.io -u "${REGISTRY_USERNAME}" --password-stdin

# Pull the new image
docker compose -f docker-compose.prod.yml pull backend-blue backend-green

# Determine which slot is currently running
if docker ps --filter "name=dumbbell-backend-blue" --filter "status=running" --format '{{.Names}}' | grep -q blue; then
  ACTIVE=blue
  INACTIVE=green
elif docker ps --filter "name=dumbbell-backend-green" --filter "status=running" --format '{{.Names}}' | grep -q green; then
  ACTIVE=green
  INACTIVE=blue
else
  # Nothing running — start blue
  ACTIVE=none
  INACTIVE=blue
fi

echo "Active: $ACTIVE — deploying to: $INACTIVE"

# Start the inactive slot (Traefik auto-discovers it via labels)
docker compose -f docker-compose.prod.yml up -d --no-deps "backend-${INACTIVE}"

# Wait for it to be healthy
echo "Waiting for backend-${INACTIVE} to be healthy..."
for i in $(seq 1 36); do
  STATUS=$(docker inspect --format='{{.State.Health.Status}}' "dumbbell-backend-${INACTIVE}" 2>/dev/null || echo "starting")
  echo "  attempt $i/36: $STATUS"
  if [ "$STATUS" = "healthy" ]; then
    break
  fi
  if [ "$STATUS" = "unhealthy" ]; then
    echo "backend-${INACTIVE} is unhealthy — aborting, keeping $ACTIVE live"
    docker compose -f docker-compose.prod.yml stop "backend-${INACTIVE}"
    exit 1
  fi
  sleep 5
done

if [ "$STATUS" != "healthy" ]; then
  echo "backend-${INACTIVE} did not become healthy — aborting"
  docker compose -f docker-compose.prod.yml stop "backend-${INACTIVE}"
  exit 1
fi

# Stop the old slot (Traefik automatically removes it from routing)
if [ "$ACTIVE" != "none" ]; then
  docker compose -f docker-compose.prod.yml stop "backend-${ACTIVE}"
fi

echo "Deploy complete — active slot is now: $INACTIVE"

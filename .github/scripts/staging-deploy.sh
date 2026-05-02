#!/usr/bin/env bash
set -euo pipefail

cd ~/dumbbell

# Log in to GHCR
echo "${REGISTRY_PASSWORD}" | docker login ghcr.io -u "${REGISTRY_USERNAME}" --password-stdin

# Pull new image
docker compose -f docker-compose.staging.yml pull backend-staging

# Create staging database if it doesn't exist
docker exec mariadb-dumbbell mariadb -u root -p"${DB_ROOT_PASSWORD}" \
  -e "CREATE DATABASE IF NOT EXISTS dumbbell_staging;" \
  -e "GRANT ALL ON dumbbell_staging.* TO '${DB_USER}'@'%';" 2>/dev/null || true

# Restart staging container
docker compose -f docker-compose.staging.yml up -d --force-recreate backend-staging

# Wait for healthy
echo "Waiting for staging to be healthy..."
for i in $(seq 1 18); do
  STATUS=$(docker inspect --format='{{.State.Health.Status}}' "dumbbell-backend-staging" 2>/dev/null || echo "starting")
  echo "  attempt $i/18: $STATUS"
  if [ "$STATUS" = "healthy" ]; then
    echo "Staging deploy complete — running on port 8081"
    exit 0
  fi
  if [ "$STATUS" = "unhealthy" ]; then
    echo "Staging is unhealthy — check logs with: docker logs dumbbell-backend-staging"
    exit 1
  fi
  sleep 5
done

echo "Staging did not become healthy within 90s"
exit 1

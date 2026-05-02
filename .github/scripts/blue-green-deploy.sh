#!/usr/bin/env bash
set -euo pipefail

cd ~/dumbbell

# Log in to GHCR
echo "${REGISTRY_PASSWORD}" | docker login ghcr.io -u "${REGISTRY_USERNAME}" --password-stdin

# Pull the new image
docker compose -f docker-compose.prod.yml pull backend-blue backend-green

# Initialise upstream.conf on first deploy
if [[ ! -f nginx/upstream.conf ]]; then
  echo "No upstream.conf found — initialising to blue"
  mkdir -p nginx
  cat > nginx/upstream.conf << 'EOF'
upstream dumbbell_backend {
    server dumbbell-backend-blue:8080;
}
EOF
fi

# Determine which slot is currently active
if grep -q "backend-blue" nginx/upstream.conf; then
  ACTIVE=blue
  INACTIVE=green
else
  ACTIVE=green
  INACTIVE=blue
fi

echo "Active slot: $ACTIVE — deploying to: $INACTIVE"

# Start the inactive slot
docker compose -f docker-compose.prod.yml up -d --no-deps "backend-${INACTIVE}"

# Wait for it to be healthy
echo "Waiting for backend-${INACTIVE} to be healthy..."
HEALTHY=false
for i in $(seq 1 36); do
  STATUS=$(docker inspect --format='{{.State.Health.Status}}' "dumbbell-backend-${INACTIVE}" 2>/dev/null || echo "starting")
  echo "  attempt $i/36: $STATUS"
  if [ "$STATUS" = "healthy" ]; then
    HEALTHY=true
    break
  fi
  if [ "$STATUS" = "unhealthy" ]; then
    echo "backend-${INACTIVE} is unhealthy — aborting, keeping $ACTIVE live"
    docker compose -f docker-compose.prod.yml stop "backend-${INACTIVE}"
    exit 1
  fi
  sleep 5
done

if [ "$HEALTHY" != "true" ]; then
  echo "backend-${INACTIVE} did not become healthy within 3 minutes — aborting, keeping $ACTIVE live"
  docker compose -f docker-compose.prod.yml stop "backend-${INACTIVE}"
  exit 1
fi

# Swap nginx upstream to the new slot
cat > nginx/upstream.conf << EOF
upstream dumbbell_backend {
    server dumbbell-backend-${INACTIVE}:8080;
}
EOF

# Reload nginx (running as infrastructure via docker-compose.yml)
docker exec dumbbell-nginx nginx -s reload

echo "Traffic switched to backend-${INACTIVE}"

# Stop the old slot
docker compose -f docker-compose.prod.yml stop "backend-${ACTIVE}"

echo "Deploy complete — active slot is now: $INACTIVE"

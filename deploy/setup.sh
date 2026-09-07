#!/bin/bash
set -e

# Install Docker if not present
if ! command -v docker &> /dev/null; then
  curl -fsSL https://get.docker.com | sh
fi

# Pull all images
docker compose pull

# Run migrations (waits for MySQL to be ready)
docker compose run --rm database_migration

# Start everything
docker compose up -d proxy webapp server mysql redis gotenberg

echo ""
echo "Bigcapital is running at http://$(curl -s ifconfig.me)"

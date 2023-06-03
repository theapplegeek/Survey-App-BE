#!/bin/bash

# Start db on docker
./script/db.test.docker.sh

# Check if db is ready
check_database() {
  # Esegui un comando all'interno del container per verificare lo stato del database
  docker-compose exec db pg_isready -q
  return $?
}

# Wait for db to be ready
while ! check_database; do
  sleep 1
done

# Start E2E script
./script/e2e.sh "$@"

# Stop db on docker
docker compose down

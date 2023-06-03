#!/bin/sh

# Start E2E test on docker
docker compose -f compose-e2e.yml run --rm server "$@"

# Stop E2E test on docker and db
docker compose -f compose-e2e.yml down
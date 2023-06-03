#!/bin/bash

# Start db on docker with docker compose
echo "Starting db on docker"
docker compose -f compose-e2e.yml up -d db
EXIT_CODE_START_DB=$?
if [ $EXIT_CODE_START_DB -ne 0 ]; then
  echo "Error when starting db on docker"
  exit 1
fi
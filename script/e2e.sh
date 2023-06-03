#!/bin/bash

# Start prisma migration to create db schema if not exists
echo "Starting prisma migrate"
npm run prisma:migrate:dev > /dev/null
EXIT_CODE_MIGRATE_DB=$?
if [ $EXIT_CODE_MIGRATE_DB -ne 0 ]; then
  echo "Error when prisma migrate"
  exit 1
fi

# Run e2e tests
echo "Running e2e tests"
npm run test:start:e2e

# Clean db on docker
echo "Cleanup db on docker"
npm run prisma:migrate:reset -- --force > /dev/null

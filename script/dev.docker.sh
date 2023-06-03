#!/bin/bash

docker compose -f compose-dev.yml run --service-ports --rm server "$@"
SIGNAL=$?

if [ $SIGNAL -ne 0 ]; then
  docker compose -f compose-dev.yml down
  exit 1
fi

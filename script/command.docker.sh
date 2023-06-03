#!/bin/bash

docker compose -f compose-dev.yml run --rm server "$@"
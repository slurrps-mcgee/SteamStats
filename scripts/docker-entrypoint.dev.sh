#!/bin/sh
# Local development only — rebuilds shared types after bind-mount, then execs the service command.
set -e

npm run build --workspace=@steamstats/shared
exec "$@"

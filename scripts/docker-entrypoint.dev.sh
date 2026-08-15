#!/bin/sh
# Local development only — execs the service command after bind-mount.
set -e
exec "$@"

#!/bin/bash

# Create Lambda-compatible cache directory
# (Next.js needs a writable cache dir, Lambda fs is read-only except /tmp)
[ ! -d '/tmp/cache' ] && mkdir -p /tmp/cache

# Start Next.js standalone server
# HOSTNAME=0.0.0.0 ensures the server binds to all interfaces (required in Lambda)
# PORT is set via serverless.yml environment variables
HOSTNAME=0.0.0.0 exec node .next/standalone/server.js

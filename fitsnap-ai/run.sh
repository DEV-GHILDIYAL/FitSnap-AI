#!/bin/bash
export HOSTNAME=0.0.0.0
export PORT=8080
exec node .next/standalone/server.js

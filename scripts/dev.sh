#!/bin/bash
trap 'kill $TSCPID $ALIASPID 2>/dev/null' EXIT INT TERM
tsc --watch & TSCPID=$!
tsc-alias --watch & ALIASPID=$!
node dist/index.js

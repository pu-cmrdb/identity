#!/usr/bin/env bash
set -euo pipefail

export ESLINT_FORMAT=1

eslint_d --stdin --fix-to-stdout --stdin-filename "${1:-stdin.ts}"

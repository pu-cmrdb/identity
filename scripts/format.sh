#!/usr/bin/env bash
set -euo pipefail

eslint_d --config ../format.eslint.config.ts --stdin --fix-to-stdout --stdin-filename "${1:-stdin.ts}"

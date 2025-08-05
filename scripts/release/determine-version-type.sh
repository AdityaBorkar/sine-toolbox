#!/bin/bash

set -euo pipefail
source "$(dirname "$0")/../utils/github-helpers.sh"

case "${GITHUB_REF_NAME:-}" in
    "release-patch") BUMP_TYPE="patch" ;;
    "release-minor") BUMP_TYPE="minor" ;;
    "release-major") BUMP_TYPE="major" ;;
    *) BUMP_TYPE="patch" ;;
esac

log_info "Bump type: $BUMP_TYPE"
set_output "bump_type" "$BUMP_TYPE"
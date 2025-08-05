#!/bin/bash

set -euo pipefail
source "$(dirname "$0")/../utils/github-helpers.sh"

VERSION="$1"
BUMP_TYPE="$2"
TRIGGER_TAG="$3"

log_info "Finalizing release v$VERSION"

setup_git

# Commit changes
git add packages/*/package.json CHANGELOG.md
git commit -m "release: v$VERSION ($BUMP_TYPE)"
git push

# Create version tag
git tag "v$VERSION"
git push origin "v$VERSION"

# Clean up trigger tag
git push --delete origin "$TRIGGER_TAG" 2>/dev/null || true

log_success "Release finalized"
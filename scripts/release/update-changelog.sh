#!/bin/bash

set -euo pipefail
source "$(dirname "$0")/../utils/github-helpers.sh"

VERSION="$1"
RELEASE_DATE="$2"

log_info "Updating CHANGELOG.md for v$VERSION"

# Replace [Unreleased] with versioned release
sed -i "s/## \\[Unreleased\\]/## [$VERSION] - $RELEASE_DATE/" CHANGELOG.md

# Add new Unreleased section
sed -i "/## \\[$VERSION\\] - $RELEASE_DATE/i ## [Unreleased]\\n" CHANGELOG.md

log_success "CHANGELOG.md updated"
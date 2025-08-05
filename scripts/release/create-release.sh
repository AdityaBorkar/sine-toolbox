#!/bin/bash

set -euo pipefail
source "$(dirname "$0")/../utils/github-helpers.sh"

VERSION="$1"
BUMP_TYPE="$2"
SINE_VERSION="$3"
CREATE_VERSION="$4"

log_info "Creating GitHub release v$VERSION"

RELEASE_BODY="## 🚀 Release v${VERSION}

**Release Type:** ${BUMP_TYPE}

See [CHANGELOG.md](https://github.com/AdityaBorkar/sine-toolbox/blob/v${VERSION}/CHANGELOG.md) for detailed changes.

### 📦 Packages Published
- \`sine-toolbox@${SINE_VERSION}\`
- \`create-sine-mod@${CREATE_VERSION}\`

### 📥 Installation
\`\`\`bash
# Install sine-toolbox globally
bun install -g sine-toolbox@${SINE_VERSION}

# Create a new project
npx create-sine-mod@${CREATE_VERSION} my-mod
\`\`\`"

gh release create "v$VERSION" --title "Release v$VERSION" --notes "$RELEASE_BODY" --latest

log_success "GitHub release created"
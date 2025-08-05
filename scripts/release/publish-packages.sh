#!/bin/bash

set -euo pipefail
source "$(dirname "$0")/../utils/github-helpers.sh"

log_info "Publishing packages"

# Publish sine-toolbox
cd packages/sine-toolbox
log_info "Publishing sine-toolbox"
bun publish --provenance --access public
cd ../..

# Publish create-sine-mod
cd packages/create-sine-mod
log_info "Publishing create-sine-mod"
bun publish --provenance --access public
cd ../..

log_success "All packages published"
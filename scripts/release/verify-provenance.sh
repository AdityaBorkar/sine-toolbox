#!/bin/bash

set -euo pipefail
source "$(dirname "$0")/../utils/github-helpers.sh"

SINE_VERSION="$1"
CREATE_VERSION="$2"

log_info "Verifying provenance (waiting 10s for registry)"
sleep 10

# Check provenance (non-blocking)
npm view "sine-toolbox@$SINE_VERSION" --json | jq -e '.dist.attestations' >/dev/null 2>&1 && log_success "sine-toolbox has provenance" || true
npm view "create-sine-mod@$CREATE_VERSION" --json | jq -e '.dist.attestations' >/dev/null 2>&1 && log_success "create-sine-mod has provenance" || true

log_info "Provenance check complete"
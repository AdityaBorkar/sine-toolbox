#!/bin/bash

set -euo pipefail

# Simple logging functions
log_info() { echo "ℹ️  $1"; }
log_success() { echo "✅ $1"; }
log_error() { echo "❌ $1" >&2; }

# GitHub Actions output
set_output() {
    echo "${1}=${2}" >> "$GITHUB_OUTPUT"
}

# Git setup
setup_git() {
    git config --local user.email "action@github.com"
    git config --local user.name "GitHub Action"
}
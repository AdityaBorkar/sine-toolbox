#!/bin/bash

set -euo pipefail

git config --local user.email "action@github.com"
git config --local user.name "GitHub Action"

if git diff --quiet CHANGELOG.md; then
    echo "No changelog changes to commit"
    exit 0
fi

git add CHANGELOG.md
git commit -m "changelog: update unreleased section"
git push
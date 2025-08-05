#!/bin/bash

set -euo pipefail

# Get latest commit message
COMMIT_MSG=$(git log -1 --pretty=format:"%s")

# Skip certain commit types
[[ "$COMMIT_MSG" =~ ^(changelog|docs|ci): ]] && exit 0

# Parse conventional commit
if [[ "$COMMIT_MSG" =~ ^([a-z]+)(\([^)]*\))?: (.+)$ ]]; then
    TYPE="${BASH_REMATCH[1]}"
    DESC="${BASH_REMATCH[3]}"
else
    TYPE="misc"
    DESC="$COMMIT_MSG"
fi

# Map to changelog section
case "$TYPE" in
    feat|feature) SECTION="Added" ;;
    fix|bugfix) SECTION="Fixed" ;;
    *) SECTION="Changed" ;;
esac

ENTRY="- $DESC"

# Skip if entry already exists
grep -Fq "$ENTRY" CHANGELOG.md && exit 0

# Update changelog
awk -v entry="$ENTRY" -v section="$SECTION" '
/^## \[Unreleased\]/ { print; in_unreleased=1; next }
/^## / && in_unreleased { 
    if (!added) {
        print ""
        print "### " section
        print entry
        added=1
    }
    in_unreleased=0 
}
in_unreleased && /^### / && $0 == "### " section {
    print
    getline
    print entry
    added=1
}
{ print }
END {
    if (in_unreleased && !added) {
        print ""
        print "### " section  
        print entry
    }
}' CHANGELOG.md > CHANGELOG.tmp && mv CHANGELOG.tmp CHANGELOG.md
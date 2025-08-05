# Contributing

## Before You Start

**Please contact the maintainer before contributing.** This is a small project and we'd like to coordinate changes to avoid duplicate work.

## Getting Started

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally
5. Submit a pull request

## Development

```bash
bun install
```

## Commits

When making changes that should be included in the next release:

1. **Add a changeset** after making your changes:
   ```bash
   bun run changeset:add
   ```

2. **Select affected packages** and **change type**:
   - `patch` - Bug fixes, small improvements
   - `minor` - New features, non-breaking changes
   - `major` - Breaking changes

3. **Write a description** of your changes (this will appear in the changelog)

4. **Commit the changeset file** along with your changes

## Questions?

Open an issue or reach out to discuss your ideas first.

---
---

## For Maintainers

### Release Workflow

1. **Merge PRs** with changesets to `main` branch
2. **Changesets Action** automatically creates/updates a "Version Packages" PR
3. **Review and merge** the Version Packages PR to publish to npm

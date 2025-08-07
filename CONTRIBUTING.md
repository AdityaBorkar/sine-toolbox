# Contributing

## Before You Start

**Please contact the maintainer before contributing.** This is a small project and we'd like to coordinate changes to avoid duplicate work.

## Getting Started

1. Fork the repository
2. Create a feature branch from `main`
3. Make your changes
4. Add a changeset (see below)
5. Test locally
6. Submit a pull request

## Development Setup

```bash
# Install dependencies
bun install

# Build packages
bun run build

# Run type checks
bun run check:types

# Run code formatting and linting
bun run check:code
```

## Changesets Workflow

This project uses [Changesets](https://github.com/changesets/changesets) for version management, changelog generation, and publishing. **All PRs that modify source code must include a changeset.**

### When You Need a Changeset

Add a changeset when your PR includes:

- ✅ Bug fixes
- ✅ New features
- ✅ Breaking changes
- ✅ Performance improvements
- ✅ Any changes to package source code

### When You DON'T Need a Changeset

Skip changesets for:

- ❌ Documentation updates
- ❌ README changes
- ❌ Test file changes
- ❌ CI/build configuration
- ❌ Dev dependencies updates

### Adding a Changeset

1. **Make your code changes first**

2. **Add a changeset**:

   ```bash
   bun run changeset:add
   ```

3. **Select affected packages** using arrow keys and space to select/deselect

4. **Choose the change type**:

   - `patch` (1.0.0 → 1.0.1) - Bug fixes, small improvements
   - `minor` (1.0.0 → 1.1.0) - New features, non-breaking changes
   - `major` (1.0.0 → 2.0.0) - Breaking changes

5. **Write a clear description** of your changes:

   ```text
   # Good examples:
   Add support for TypeScript 5.0
   Fix memory leak in config parser
   BREAKING: Remove deprecated createMod function

   # Bad examples:
   Fix bug
   Updates
   Stuff
   ```

6. **Commit the changeset file** along with your changes:

   ```bash
   git add .changeset/your-changeset-file.md
   git commit -m "feat: add new feature + changeset"
   ```

### Changeset File Structure

Changeset files look like this:

```markdown
---
"sine-toolbox": minor
"create-sine-mod": patch
---

Add support for custom templates with TypeScript configuration
```

### CI Validation

Our CI will:

- ✅ Check that source code changes include changesets
- ✅ Skip changeset requirement for docs/config changes
- ✅ Provide helpful error messages if changesets are missing

## Questions?

Open an issue or reach out to discuss your ideas first.

---

## For Maintainers

### Release Workflow

This project uses an automated release workflow powered by Changesets:

#### 1. Development & PRs

- Contributors submit PRs with changesets
- CI validates changesets are present for source code changes
- Maintainers review and merge PRs to `main`

#### 2. Automated Release PR Creation

- When PRs with changesets are merged to `main`, the **Changesets GitHub Action** automatically:
  - Creates or updates a "Version Packages" PR
  - Bumps versions in `package.json` files
  - Updates `CHANGELOG.md` files with changeset descriptions
  - Removes consumed changeset files

#### 3. Publishing

- Maintainer reviews the "Version Packages" PR
- When merged, the action automatically:
  - Publishes packages to npm
  - Creates GitHub releases with generated changelogs
  - Tags the release commit

#### Manual Commands

For local testing or manual releases:

```bash
# Preview what changesets will do
bun run changeset:status

# Generate version updates locally (don't commit)
bun run changeset:version

# Publish packages (after version bump)
bun run release
```

#### Hotfix Releases

For urgent fixes:

1. Create a hotfix branch from the latest release tag
2. Make the minimal fix
3. Add a `patch` changeset
4. Open PR to `main`
5. After merge, the automated workflow handles the release

#### Emergency Manual Release

If automation fails:

```bash
# 1. Ensure you're on main with latest changes
git checkout main && git pull

# 2. Version packages
bun run changeset:version

# 3. Commit version changes
git add . && git commit -m "chore: version packages"

# 4. Publish
bun run release

# 5. Push changes and tags
git push && git push --tags
```

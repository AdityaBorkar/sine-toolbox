# TODOs

## General

---

- [ ] Workflow I need:
  - 1
    - Allow editing only a certain section of the changelog.md
    - ON PUSH TO MAIN, VERIFY THE FORMAT OF CHANGELOG.MD. No changes below the UNRELEASED section.
  - 2
    - How to perform changesets? (Writing Changelog, Releasing, Publishing)
    - Finalize the Changesets Workflow
  - 4
    - ON "release" Tagged Release
    - Changesets
    - Trigger the release and publish to npm with provenance & GitHub Release & GitHub Package
  - 3
    - Check if STATUS CHECKS PASS
- [ ] Add: cSpell
- [ ] Markdownlint

## create-sine-mod

---

- [ ] Document CLI commands and options
- [ ] Zen Profile Detection in MacOS
- [ ] Option to enable Filesystem Sandboxing. Restrict write access to the chrome/ directory using:

    ```bash
    chmod 444 ~/.mozilla/firefox/*.default-release/chrome/*.uc.js  # Linux/macOS
    Windows: Apply "Read-only" via Properties > Security 9
    ```

- [ ] Give only Permissions that are needed.

    ```js
    lockPref("dom.storage.enabled", false);  // Disable localStorage access
    lockPref("capability.policy.privilege.dom.storage.enabled", "noAccess");
    ```

- [ ] Browser Hardening: Enable privacy.firstparty.isolate and security.sandbox.content.level=4 in about:config
- [ ] Zen Profile Detection in Linux
- [ ] Add support for other Browsers

## sine-mod

---

- [ ] Document CLI commands and options
- Add link to Changelog.md
- Build into the directory
- Auto generate certain fields if missing
- TODO: Typescript Autocompletion
- TODO: CSS Autocompletion
- TODO: preferences.schema.json
- TODO: theme.schema.json

## AI Suggestions

---

### 5. **Improve Release Workflow**

**Issues**:

- No provenance attestation for security
- Missing tag creation
- No draft releases for review

**Recommendations**:

```yaml
# Add to publish.yml
- name: Attest Build Provenance
  uses: actions/attest-build-provenance@v1
  with:
    subject-path: 'packages/*/dist/**'

- name: Create GitHub Release
  if: steps.changesets.outputs.published == 'true'
  uses: actions/create-release@v1
```

### 6. **Matrix Testing Strategy**

**Current**: Only tests on Ubuntu latest
**Recommendation**: Add OS matrix testing

```yaml
strategy:
  matrix:
    os: [ubuntu-latest, windows-latest, macos-latest]
    bun-version: [latest, '1.0.0']
```

### 10. **Environment Variables & Secrets**

**Issues**:

- No validation of required secrets
- Secrets used without fallbacks

**Recommendations**:

```yaml
# Add secret validation
- name: Validate secrets
  run: |
    if [ -z "${{ secrets.NPM_TOKEN }}" ]; then
      echo "❌ NPM_TOKEN secret not set"
      exit 1
    fi
```

### 14. **Code Quality Improvements**

**Add**:

- Husky for git hooks
- lint-staged for pre-commit linting

### 15. **Improve Release Process**

**Issues**:

- No pre-release validation
- Missing provenance attestation
- No release notes automation

**Recommendations**:

```yaml
# Add pre-release checks
- name: Validate packages before publish
  run: |
    bun run build
    bun run test
    bun run check:types
    bunx publint packages/*/package.json
```

### 16. **Add Package Validation**

```yaml
- name: Test package installation
  run: |
    npm pack packages/create-sine-mod
    npm pack packages/sine-toolbox
    npm install -g create-sine-mod-*.tgz
    create-sine-mod --help
```

### 17. **Add Workflow Observability**

**Recommendations**:

- Add workflow timing metrics
- Set up failure notifications
- Monitor dependency vulnerabilities
- Track package download statistics

### 18. **Performance Monitoring**

```yaml
- name: Bundle size check
  run: |
    bun run build
    bunx bundlesize
```

### Publish on JSR with a 100 score

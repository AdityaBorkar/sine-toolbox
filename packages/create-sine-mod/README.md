- Write a README for the package (from create-next-app & create-astro-app)

- Setup the Github Repository
- Publishing Workflow (GitHub Actions)
    - Provenance
    - Conventional Commits
    - Semantic Versioning

### TODOs
---

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
- [ ] cSpell, Markdownlint

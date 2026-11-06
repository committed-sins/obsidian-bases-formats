# Repository guidance

- Build and test with `npm ci` and `npm run check`.
- Keep vault targets in environment variables, outside versioned configuration.
- Announce the first local deployment before executing it. Repository setup has not deployed this plugin.
- Preserve the old `bases-amount-formatter` plugin until the user approves the cutover. Never reuse its ID.
- Always sign Git commits with the user's configured backend and key. Never bypass signing. If signing fails, leave files uncommitted.
- Verify each newly created commit's signature. If verification is blocked by local trust/verifier configuration, report that limitation without rewriting the signed commit.
- Write commit messages in English.

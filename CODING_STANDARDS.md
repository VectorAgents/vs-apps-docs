# Coding standards

Read during review, not during implementation. Mechanical rules live in checks (`pnpm check`, `.githooks/pre-commit`, CI), so this file holds the judgement calls.

## Tests

- An edit that loosens a test assertion (a wider pattern, a removed assertion, a higher limit, a new allowed value) names its reason in the pull request body. A test edit that follows new page text is not loosening.
- A page test that pins page text changes in the same commit as the text.

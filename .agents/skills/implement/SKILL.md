---
name: implement
description: "Implement a piece of work based on a spec or set of tickets."
disable-model-invocation: true
---

Implement the work described by the user in the spec or tickets.

## Recon before files

**First step**, before creating files or following a stack skill's default layout: Grep/Read `package.json` and `tsconfig.json` (and `tsconfig*.json`) to verify directory structure. Check `paths`, `rootDir`, `include`, `exports`, and workspaces. Detect monorepos (`pnpm-workspace.yaml`, `nx.json`, `turbo.json`, `apps/`, `packages/`). Put new files next to existing code in the same package; import via real aliases, not boilerplate paths (`src/main.tsx`, `app/`, `drizzle/`). If the package root is ambiguous, ask — do not guess.

Follow the `tdd` skill where possible, at pre-agreed seams. Generated code must be TypeScript (`strict`) unless the repo is already JavaScript-only.

Run typechecking regularly, single test files regularly, and the full test suite once at the end.

**STOP and ask user for confirmation if the test suite fails 3 times in a row.** Count consecutive **full** suite runs (not a single red test on purpose). After the third failure: do not write more code, do not churn signatures or imports. Report the log, your hypothesis, and options (fix the seam, revert, or continue N more times). Reset the counter only after a green suite or an explicit "continue" from the user. Do not take another unattended attempt.

Once done, follow the `code-review` skill to review the work.

Do not commit, amend, or push unless the user explicitly asked to commit in this conversation.

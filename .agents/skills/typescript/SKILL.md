---
name: typescript
description: TypeScript strict typing for app and library code. Use when writing or reviewing TypeScript, fixing type errors, or when the project uses tsconfig strict. Prefer typed APIs over any.
---

# TypeScript

Default for this catalog: **TypeScript `strict`**, not JavaScript. Prefer typed APIs over `any`. `tsconfig` location and `paths` come from recon, not assumed repo root.

## Rules

- Enable `strict` in `tsconfig.json`. Do not weaken it for convenience.
- Do not use `any` unless the user accepts an escape hatch at a typed boundary (third-party untyped module). Prefer `unknown` and narrow.
- Type public APIs: function params/returns, React props, Express/Nest handlers, IPC commands, DB row types.
- Prefer `type` or `interface` consistently with the file you are editing.
- Do not use `as` to silence errors. Narrow or fix the source type.
- Generated examples in `.ts` / `.tsx` only.

## Boundaries

Serialize at process edges (HTTP, IPC, env). Validate input (schema or Nest pipes) then keep a typed value inward. Never print secrets from `process.env` into chat.

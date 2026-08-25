---
name: which-skill
description: >-
  Recommend which Cursor skill to apply for a user request. Use only when the
  user explicitly invokes this skill or asks to apply which-skill. Covers Cursor
  built-in skills and skills from this catalog. Triggers include какой скилл
  нужен, which skill, what skill do I need.
disable-model-invocation: true
---

# Which skill

Recommend 1–3 skills for the user's request. Answer in the user's language. Do not install or apply the recommended skills unless asked.

## Collect candidates

Read YAML frontmatter only (`name`, `description`, `disable-model-invocation`). Do not load full `SKILL.md` bodies unless the user asks to apply one.

**Cursor built-in (read-only):** glob `~/.cursor/skills-cursor/**/SKILL.md`. Also use session `available_skills` that are Cursor product skills. Never write under `~/.cursor/skills-cursor/`.

Heuristic (not exhaustive; prefer the live scan if it disagrees):

- Authoring Cursor artifacts: `create-skill`, `create-rule`, `create-hook`, `create-subagent`, `migrate-to-skills`
- Product/UI: `canvas`, `update-cursor-settings`, `statusline`, `automate`, `loop`
- Review/git: `review`, `review-bugbot`, `review-security`, `split-to-prs`
- Hosting/CLI: `new-repo`, `share`, `origin`, `sdk`, `shell`, `update-cli-config`

**This catalog / installed copy:** glob live `SKILL.md` files. Do not hardcode this repo's skill names.

1. If the workspace is this catalog (has `presets.json` and `skills/`): glob `skills/**/SKILL.md`.
2. Else: glob `.cursor/skills/**/SKILL.md` and `.agents/skills/**/SKILL.md`.
3. Skip `optional/` unless the user explicitly asks about Vercel deploy, tokens, or optimize.

If a catalog skill matches but is not installed in the current app, say so. For how to install, read `README.md` / `presets.json` in this catalog (or the GitHub README) — do not keep a preset list in this skill.

Do not search skills.sh / `find-skills` unless the user wants skills outside Cursor built-ins and this catalog.

## Match and answer

Match the request to `name` + `description` (domain, action, Cursor product vs code vs process). Prefer installed skills when the user wants to work now.

Template:

```
**Best**
- `<name>` — why it fits. Invoke: «примени скилл <name>» (if `disable-model-invocation`) or the agent may pick it up from description.

**Also**
- `<name>` — shorter why.

If none fit: say so; help with the task directly if asked.
```

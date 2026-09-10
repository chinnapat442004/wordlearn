---
name: wordlearn
description: Develop WORDLEARN using Next.js, TypeScript, PostgreSQL, Prisma, and Tailwind CSS with minimal token usage, focused changes, Thai-first UI, and plan-first implementation.
---

# WORDLEARN

## Stack

- Next.js App Router
- TypeScript
- PostgreSQL
- Prisma
- Tailwind CSS

## Core Features

- Vocabulary categories
- Vocabulary management
- Learned/unlearned status
- Guessing game
- Category selection
- Random questions
- Answer validation
- Score and final result

## Plan First

For non-trivial tasks:

1. Inspect relevant files only.
2. Identify affected files.
3. Create a concise plan.
4. Implement the plan.
5. Run relevant checks.

Format:

Plan:

1. [file] - [change]
2. [file] - [change]

Skip the plan for trivial changes.

## Save Token Max

- Minimize token usage at all times.
- Read only relevant files.
- Do not scan the entire project unless necessary.
- Do not repeat information already provided.
- Do not dump unchanged code.
- Do not explain obvious code.
- Keep responses concise.
- Do not generate unnecessary examples.
- Do not refactor unrelated code.
- Stop when the requested task is complete.

## Code Rules

- Use TypeScript.
- Avoid `any` when possible.
- Follow existing project structure and conventions.
- Reuse existing components, utilities, hooks, and services.
- Make the smallest necessary change.
- No unrelated refactoring.
- No unnecessary dependencies.
- No unnecessary comments.
- No decorative comments or emojis.

## Next.js Rules

- Use App Router.
- Prefer Server Components when appropriate.
- Use Client Components only when required.
- Do not add `"use client"` unnecessarily.
- Follow existing server/client boundaries.
- Reuse existing architecture.

## Database Rules

- Use Prisma.
- Keep database access server-side.
- Validate input.
- Do not modify the schema unless required.
- Do not reset or destroy the database unless explicitly requested.

## UI Rules

- Use Tailwind CSS.
- Thai is the primary UI language.
- New user-facing text should be Thai by default.
- Preserve existing UI style, layout, colors, spacing, and typography.
- Reuse existing components.
- Do not redesign unrelated UI.

## Scope Control

Implement exactly what was requested.

Do not:

- Add unrelated features
- Refactor unrelated code
- Redesign unrelated UI
- Rename unrelated files
- Change dependencies unnecessarily
- Change configuration unnecessarily
- Change database schema unnecessarily

## Testing

After implementation, run relevant checks when available:

- Typecheck
- ESLint
- Relevant tests
- Build when appropriate

Fix errors caused by the current change only.

## Git Safety

- Do not reset or revert user changes.
- Do not delete files unless required.
- Do not discard uncommitted work.
- Do not commit unless requested.

## Final Response

Keep the response concise:

Changed:

- [file] - [change]

Test:

- [check] - [result]

Issues:

- None

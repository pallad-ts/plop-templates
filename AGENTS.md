# Project Guide

This repository publishes `@pallad/plop-templates`, a small Plop generator package for Pallad TypeScript projects.

It registers two generators in `index.js`:

- `root-configuration` copies shared root tooling config into a target repo and updates root `package.json` dependencies.
- `package` creates a new package scaffold under `package/{{packageName}}`, copies package-level config templates, creates `src/index.ts`, and normalizes generated `package.json` scripts.

Templates live in `templates/`. Generator definitions live in `generators/`.

Keep generator changes minimal and prefer copying templates with `skipIfExists: true` so rerunning Plop does not overwrite user edits.

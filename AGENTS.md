# Agent Instructions

Repository-level operating instructions for coding agents (OpenCode, Claude Code, or others) working on PriceWatch QA. `AGENTS.md` is the single shared source of project instructions.

## Project Purpose

PriceWatch QA is a modular web price-monitoring platform built to demonstrate professional QA Automation engineering (Playwright, TypeScript, E2E/API testing, resilient automation, CI/CD). Amazon Spain is the first Store Adapter, not the architecture. See docs/ARCHITECTURE.md.

## Architecture Constraints

- Follow the Store Adapter pattern: core domain code must never depend on Amazon (or any store's) selectors, DOM structure, or store-specific identifiers.
- Store-specific code lives under `src/stores/<store>/`, split into crawler, parser, selectors, config.
- Strong TypeScript typing; `any` requires justification.
- Never convert missing/invalid data into fake valid values (e.g. `price = 0`). Fail explicitly.
- No CAPTCHA bypass, anti-bot evasion, fingerprint spoofing, auth bypass, or aggressive/uncontrolled crawling — ever. If a target blocks automation, document the limitation.
- Don't refactor unrelated code to fix unrelated debt; document debt instead and mention it.
- Don't change the architecture because of personal preference — if you think there's a better approach, explain the trade-off first.

Full detail: docs/ARCHITECTURE.md.

## Development Workflow

1. Read docs/PROJECT_STATE.md before starting work.
2. Read the relevant section of docs/ARCHITECTURE.md.
3. Inspect the actual repository and recent Git history — do not trust documentation blindly if it disagrees with the code.
4. Implement the smallest logical next task incrementally.
5. Compile, lint, and run relevant tests after meaningful changes. Do not claim something works without running it.
6. Update docs/PROJECT_STATE.md at the end of a meaningful work session.

Do not implement the entire roadmap in one session. Do not perform major architectural rewrites without explaining the trade-off first.

## Testing Requirements

- Unit tests for parsers/validators/normalization must be deterministic — no network, no browser, no hitting Amazon.
- Integration tests use local HTML fixtures for the Amazon parser.
- E2E/browser tests are clearly separated from deterministic tests.
- On browser automation failure, preserve QA evidence (screenshot, trace, timestamp, URL, failure stage) where appropriate — not on every successful run.

## Documentation Requirements

Keep these current and non-duplicative:

- docs/ARCHITECTURE.md — update only on genuine architecture change.
- docs/ROADMAP.md — future direction.
- docs/PROJECT_STATE.md — current state, updated every meaningful session (see below).
- docs/CHANGELOG.md — notable changes.
- docs/ADR/ — for significant architectural decisions only, not trivial choices.

## LinkedIn Editorial Workflow

- `skills/linkedin-qa-content/SKILL.md` governs requests to draft, review, schedule, or catalog LinkedIn content from this project.
- Tuesday content is a minipill from completed project practice; Thursday content is QA Automation theory selected from a reviewed visual asset. Do not publish planned work as practice. Both require a reviewed image or diagram and human approval before publication.
- Keep personal PKM notes and media outside this public repository. Do not commit private source material, raw screenshots, secrets, or unpublished post drafts unless intentionally prepared for public release.
- Update this file when non-negotiable rules or workflow change.

## Current Context

- docs/PROJECT_STATE.md — what's done, in progress, pending, blockers, next task.
- docs/ARCHITECTURE.md — technical source of truth.
- docs/ROADMAP.md — version plan (V0.1 → V1.0).
- Use `qa-automation-copilot` by default for QA Automation strategy, test design, and automation work.

## Session Continuity Protocol

At the start of every session: read this file, read docs/PROJECT_STATE.md, read the relevant part of docs/ARCHITECTURE.md, inspect the repo and recent Git history, verify PROJECT_STATE.md still matches the code (correct it if not), then pick the smallest next task.

At the end of a meaningful session: update docs/PROJECT_STATE.md with completed work, remaining work, blockers, decisions, tests run and their results, and the next recommended task.

Use meaningful, conventional commit messages (`feat(amazon): implement product crawler`, `test(amazon): add parser fixtures`) — never `update`, `changes`, `fix stuff`.

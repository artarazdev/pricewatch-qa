# Project State

Last updated: 2026-09-01
Current version: V0.1 — Amazon Crawler Foundation (in progress)

## Current Objective

Bootstrap the repository and establish the modular Store Adapter foundation.

## Completed

- Repository documentation structure created: README.md, AGENTS.md, CLAUDE.md, docs/ARCHITECTURE.md, docs/ROADMAP.md, docs/PROJECT_STATE.md, docs/CHANGELOG.md, docs/ADR/.
- Initial architecture decisions recorded (ADR-001, ADR-002).
- Node.js + TypeScript project scaffolding: package.json, tsconfig.json (strict, NodeNext), ESLint 9 flat config (typescript-eslint strict+stylistic, eslint-config-prettier), Prettier, .gitignore/.prettierignore, placeholder src/index.ts.
- Playwright + Playwright Test installed, Chromium browser binary installed, playwright.config.ts (testDir `tests`, chromium project), `npm test` / `npm run test:e2e` scripts added.
- Core domain contract (`src/core/`): `Product`, `Currency`, `Availability` (product.ts); `CrawlResult` discriminated union success/failure (crawl-result.ts); `StoreCrawler` interface (store-crawler.ts). No Amazon-specific code.
- Obsidian PKM for project notes created outside the repo at `/home/ez1zena/Apuntes_IT/IT/Proyectos GITHUB/PriceWatch-QA`; repo docs remain the formal technical source of truth.
- Obsidian PKM expanded with installation/bootstrap commands, `package.json` scripts/dependencies rationale, core domain explanation, and current file-by-file reference.
- LinkedIn editorial workflow established: project skill, Spanish Tuesday/Thursday templates, backlog, and visual-asset catalog outside the repository. All 96 visual assets are registered as pending semantic and rights review.
- `AGENTS.md` and `CLAUDE.md` are synchronized for shared non-negotiable rules and workflow, including the editorial workflow.
- Public-repository hygiene strengthened: generated reports, local tooling state, secrets, certificates, coverage, and editor metadata are ignored; agent instructions and OpenSpec artifacts remain trackable.
- Core-neutral validation boundary completed: `ProductCandidate`, typed validation/extraction errors, and a pure validator now reject invalid candidates without coercion and return a validated `Product` only on success.
- Deterministic validator unit tests cover valid candidates, omitted optional seller, invalid name/price/currency/availability, and accumulated failures.

## In Progress

- Amazon adapter OpenSpec change: core validation work unit complete (tasks 1.1, 1.2, and 5.4); Amazon-specific implementation remains pending.

## Pending

- Git repository initialization (explicitly deferred by user for now — do not assume a git repo exists).
- Amazon adapter: crawler, parser, selectors, config (src/stores/amazon/), implementing `StoreCrawler`.
- Basic CLI entrypoint.
- Deterministic parser unit tests against local HTML fixtures.
- Basic Playwright browser test.
- Failure evidence handling (screenshot/trace on crawl failure).

## Known Problems / Blockers

- `npm run format:check` still reports four pre-existing formatting issues under `openspec/changes/amazon-adapter/` and `openspec/config.yaml`. They are unrelated to this session and were not reformatted.

## Recent Important Decisions

- Store Adapter architecture chosen so the core domain never depends on Amazon-specific DOM/selectors (see docs/ARCHITECTURE.md and ADR-002).
- Playwright + TypeScript chosen as the primary automation/testing stack (see ADR-001).
- SQLite, CI/CD, and a second store adapter are explicitly deferred past V0.1 (see docs/ROADMAP.md).
- Documentation convention: use `docs/PROJECT_STATE.md` for current technical state, `docs/ARCHITECTURE.md` for architecture source of truth, and Obsidian as a PKM for project notes, explanations, commands, concepts, and session context.
- LinkedIn content is Spanish. Tuesday posts document completed project practice; Thursday posts explain QA Automation theory from a reviewed visual asset. Planned work is never presented as completed practice.
- The validation boundary uses core `ProductCandidate`, not Amazon `RawProduct`, so `src/core` remains adapter-neutral; the approved correction is recorded in the active OpenSpec design and tasks.

## Last Validation

- 2026-08-10: `npm run typecheck`, `npm run lint`, `npm run format:check`, `npm run build` all pass clean with Playwright config + core domain contract added. `npx playwright --version` confirms 1.62.1 installed; `npx playwright test` correctly reports "No tests found" (no specs added yet, expected).
- 2026-08-10: Obsidian PKM structure added/reworked; no code changed, so no build/test command was required for this documentation-only update.
- 2026-08-10: Obsidian PKM expanded with stack, commands, installation, core contract, and file reference notes; only Markdown documentation changed, so no build/test command was required.
- 2026-08-31: `npm run typecheck`, `npm run lint`, and `npm run build` pass after the editorial workflow and public-repository hygiene changes. The updated skill and repository Markdown files pass targeted Prettier verification. Full `npm run format:check` remains blocked only by four pre-existing OpenSpec formatting warnings.
- 2026-08-31: LinkedIn cadence refined in the skill, agent instructions, and Obsidian workflow. Only documentation changed; targeted Prettier verification passed.
- 2026-08-31: Editorial policy and Obsidian notes reduced to the minimum operational set. `qa-automation-copilot` is the default skill for QA Automation work; targeted Prettier verification passed.
- 2026-09-01: Validator TDD work unit completed. RED: `npx playwright test tests/unit/validator.test.ts` failed because `src/core/domain/validator.js` did not exist. Final validation after review: 8 validator tests and `npm test` pass; `npm run typecheck`, `npm run lint`, targeted Prettier, and `npm run build` pass.

## Next Recommended Task

Implement the next Amazon adapter work unit: centralized configuration and selector fallback chains (tasks 2.1 and 2.2). Keep Amazon DOM details outside `src/core`; later map adapter-local raw data into `ProductCandidate` before validation.

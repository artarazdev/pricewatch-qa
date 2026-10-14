# Project State

Last updated: 2026-10-14
Current version: V0.1 — Amazon Crawler Foundation (in progress)

## Current Objective

Bootstrap the repository and establish the modular Store Adapter foundation.

## Completed

- Repository documentation structure created: README.md, AGENTS.md, docs/ARCHITECTURE.md, docs/ROADMAP.md, docs/PROJECT_STATE.md, docs/CHANGELOG.md, docs/ADR/.
- Initial architecture decisions recorded (ADR-001, ADR-002).
- Git repository initialized on `main` with the bootstrap commit (`f535707`, 2026-09-17).
- Node.js + TypeScript project scaffolding: package.json, tsconfig.json (strict, NodeNext), ESLint 9 flat config (typescript-eslint strict+stylistic, eslint-config-prettier), Prettier, .gitignore/.prettierignore, placeholder src/index.ts.
- Playwright + Playwright Test installed, Chromium browser binary installed, playwright.config.ts (testDir `tests`, chromium project), `npm test` / `npm run test:e2e` scripts added.
- Core domain contract (`src/core/`): `Product`, `Currency`, `Availability` (product.ts); `CrawlResult` discriminated union success/failure (crawl-result.ts); `StoreCrawler` interface (store-crawler.ts). No Amazon-specific code.
- `AGENTS.md` is the single shared source of instructions for coding agents.
- Public-repository hygiene strengthened: generated reports, local tooling state, secrets, certificates, coverage, and editor metadata are ignored; agent instructions and OpenSpec artifacts remain trackable.
- Core-neutral validation boundary completed: `ProductCandidate`, typed validation/extraction errors, and a pure validator now reject invalid candidates without coercion and return a validated `Product` only on success.
- Deterministic validator unit tests cover valid candidates, omitted optional seller, invalid name/price/currency/availability, and accumulated failures.
- Amazon adapter configuration completed through strict TDD: `AmazonConfig` and `amazonConfig` define the fixed Amazon ES base URL, timeout, and expected currency.
- Amazon selector evidence captured (task 2.1a): a manual, headed capture script saves sanitized real product pages to the git-ignored `captures/amazon/` directory. Two layouts were verified: a buy-box accordion with new and used offers, and a single offer sold by a third party.
- Amazon new-offer selector chains completed through strict TDD (task 2.2): `SELECTORS` defines fixture-verified chains for name, price (accordion primary, single-offer fallback), availability, seller, and canonical URL.

## In Progress

- Amazon adapter OpenSpec change: core validation work unit complete (tasks 1.1, 1.2, and 5.4); Phase 2 (tasks 2.1, 2.1a, and 2.2) is complete; Phase 3 (parser) is next.

## Pending

- Amazon adapter: crawler and parser (src/stores/amazon/), implementing `StoreCrawler`.
- Basic CLI entrypoint.
- Deterministic parser unit tests against committed synthetic HTML fixtures in `tests/fixtures/amazon/`, modeled on the verified layouts. Task 5.x still describes the old fixture selectors and must be updated first.
- Basic Playwright browser test.
- Failure evidence handling (screenshot/trace on crawl failure).

## Known Problems / Blockers

- `npm run format:check` still reports four pre-existing formatting issues under `openspec/changes/amazon-adapter/` and `openspec/config.yaml`. They are unrelated to this session and were not reformatted.

## Recent Important Decisions

- Store Adapter architecture chosen so the core domain never depends on Amazon-specific DOM/selectors (see docs/ARCHITECTURE.md and ADR-002).
- Playwright + TypeScript chosen as the primary automation/testing stack (see ADR-001).
- SQLite, CI/CD, and a second store adapter are explicitly deferred past V0.1 (see docs/ROADMAP.md).
- Documentation convention: use `docs/PROJECT_STATE.md` for current technical state and `docs/ARCHITECTURE.md` as the architecture source of truth.
- Personal tooling and notes live outside the public repository; `AGENTS.md` now carries public-repository hygiene rules instead.
- The validation boundary uses core `ProductCandidate`, not Amazon `RawProduct`, so `src/core` remains adapter-neutral; the approved correction is recorded in the active OpenSpec design and tasks.
- `AGENTS.md` is the canonical project instruction file; the duplicated `CLAUDE.md` was removed now that Claude Code supports `AGENTS.md` directly.
- The Amazon adapter monitors only the new offer; used and other offers are never extracted. Seller is the merchant, not the fulfiller.
- Real store captures are third-party content: they are sanitized, kept in the git-ignored `captures/`, and never used as test input. Committed tests use synthetic fixtures so the repository stays plug and play.
- Engram agent memory is not committed (`.engram/` is git-ignored): an export contained verbatim prompts, local paths, and unpublished drafts. Shared knowledge lives in OpenSpec, ADRs, and these docs.
- TypeScript explicitly loads Node type declarations, so Node globals such as `URL` are available to the editor and compiler without adding browser DOM types.

## Last Validation

- 2026-08-10: `npm run typecheck`, `npm run lint`, `npm run format:check`, `npm run build` all pass clean with Playwright config + core domain contract added. `npx playwright --version` confirms 1.62.1 installed; `npx playwright test` correctly reports "No tests found" (no specs added yet, expected).
- 2026-08-31: `npm run typecheck`, `npm run lint`, and `npm run build` pass after the public-repository hygiene changes. Repository Markdown files pass targeted Prettier verification. Full `npm run format:check` remains blocked only by four pre-existing OpenSpec formatting warnings.
- 2026-08-31: `qa-automation-copilot` established as the default skill for QA Automation work; targeted Prettier verification passed.
- 2026-09-01: Validator TDD work unit completed. RED: `npx playwright test tests/unit/validator.test.ts` failed because `src/core/domain/validator.js` did not exist. Final validation after review: 8 validator tests and `npm test` pass; `npm run typecheck`, `npm run lint`, targeted Prettier, and `npm run build` pass.
- 2026-10-13: Consolidated coding-agent instructions into `AGENTS.md`; documentation-only change, so no test command was required.
- 2026-10-13: Declared Node types explicitly in `tsconfig.json`; `npm run typecheck`, `npm run lint`, and targeted Prettier verification pass.
- 2026-10-13: Phase 2 configuration TDD cycle completed: the focused `amazon-config` test passes. Broader verification remains pending until the selector work unit is complete.
- 2026-10-14: Selector TDD cycle completed. RED: `npx playwright test tests/unit/amazon-selectors.test.ts` failed because `src/stores/amazon/selectors.js` did not exist. GREEN: 16 unit tests pass; `npm run typecheck`, `npm run lint`, and `npm run build` pass. All `SELECTORS` chains resolve the expected values on both sanitized captures. Note: `npm test -- <pattern>` does not focus a run, because the script already passes the test directories.

## Next Recommended Task

Start Phase 3 (Amazon parser). First update the Phase 5 fixture tasks to describe synthetic fixtures that model the verified layouts, then build the parser through RED → GREEN against them. Keep Amazon DOM details outside `src/core` and map adapter-local raw data into `ProductCandidate` before validation.

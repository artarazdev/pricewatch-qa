# Changelog

All notable changes to this project are documented here. Format loosely follows [Keep a Changelog](https://keepachangelog.com/).

## [Unreleased]

### Added

- Repository documentation foundation: README.md, AGENTS.md, docs/ARCHITECTURE.md, docs/ROADMAP.md, docs/PROJECT_STATE.md, docs/CHANGELOG.md.
- ADR-001: Playwright + TypeScript selection.
- ADR-002: Store Adapter architecture selection.
- Node.js + TypeScript project scaffolding: package.json, tsconfig.json, ESLint 9 flat config, Prettier, no business logic yet.
- Playwright + Playwright Test setup (playwright.config.ts, Chromium binary, test/test:e2e scripts).
- Core domain contract: `Product`, `CrawlResult`, `StoreCrawler` (src/core/), no Amazon-specific code.
- Obsidian PKM documentation for stack rationale, initialization commands, package scripts/dependencies, core contracts, and current file reference.
- LinkedIn editorial workflow skill with evidence, visual-review, and human-approval requirements.
- External Obsidian editorial MOC, backlog, templates, and initial visual-asset inventory.
- Public-repository ignore rules for local tooling state, generated reports, coverage, editor metadata, and credentials.
- LinkedIn cadence refined: Tuesday minipills document completed project practice; Thursday posts explain QA Automation theory from reviewed visual assets.
- Simplified the LinkedIn editorial policy and notes; established `qa-automation-copilot` as the default QA Automation skill.
- Core-neutral validation boundary: added `ProductCandidate`, typed validation/extraction errors, and a non-coercing validator that returns either a validated `Product` or all typed field errors.
- Deterministic validator unit tests for valid, optional, invalid, and multi-error product candidates.
- Validator output omits an explicitly undefined optional seller so it satisfies the strict `Product` contract.
- Amazon ES store configuration (`amazonConfig`) with a deterministic unit test.
- Sanitized Amazon page capture script for selector evidence; captures stay local in the git-ignored `captures/`.
- Amazon new-offer selector chains (`SELECTORS`) with structural unit tests, including a new-offer scoping invariant.

### Changed

- Consolidated coding-agent instructions into `AGENTS.md` and removed the duplicated `CLAUDE.md`.
- Declared Node type definitions explicitly in TypeScript configuration so Node globals such as `URL` resolve consistently.
- Amazon selector spec grounded in captured page evidence: legacy `priceblock_*` selectors removed, new-offer-only rule added, and seller separated from fulfiller.
- Removed a local absolute path from the project state document.

### Removed

- LinkedIn editorial skill and its `AGENTS.md` section; personal editorial tooling now lives outside the public repository.

# PriceWatch QA

> A modular ecommerce price-monitoring platform, built primarily as a professional QA Automation engineering showcase.

**Status: early development (V0.1 — Amazon Crawler Foundation, in progress).** See [docs/PROJECT_STATE.md](docs/PROJECT_STATE.md) for exact current state.

## Purpose

PriceWatch QA crawls selected ecommerce product pages, extracts and validates product data, maintains price history, and detects meaningful price changes.

Scraping is the use case. **Automated quality, resilience, modularity, and maintainability are the actual engineering focus.** Amazon Spain is the first supported store, implemented strictly as a pluggable Store Adapter — the core domain never depends on Amazon-specific selectors or DOM structure, so additional stores (PcComponentes, MediaMarkt, Decathlon, Bike24, Deporvillage, ...) can be added without touching core business logic. V0.5 on the roadmap exists specifically to prove that claim.

## Architecture Overview

```
                PriceWatch QA
                     |
                Application
                     |
                StoreCrawler
                     |
          +----------+----------+
          |                     |
       Amazon               Future Store
          |                     |
      Playwright             Adapter
          |
        Parser
          |
          v
       Product
          |
      Validator
          |
      Persistence
          |
    Price Intelligence
```

Full technical detail: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Tech Stack

- Node.js + TypeScript
- Playwright + Playwright Test
- ESLint + Prettier
- Planned: SQLite, GitHub Actions, Docker

## Installation

```bash
npm ci
npx playwright install chromium
```

## Usage

Planned CLI usage:

```bash
npm run crawl -- --store amazon --url "<URL>"
```

## Testing

Testing is a first-class part of this project, split into unit (deterministic, no network), integration (parser against local HTML fixtures, repository), and E2E (real browser) layers. See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md#testing-architecture).

```bash
npm test
npm run test:e2e
npm run lint
npm run typecheck
```

### Refreshing selector evidence

Store selectors break when the store changes its DOM. Every selector chain in `src/stores/amazon/selectors.ts` must be backed by a real page capture. To capture one:

```bash
node scripts/capture-amazon-fixture.ts "https://www.amazon.es/dp/<ASIN>" <scenario-name>
```

The script runs TypeScript directly, so it needs a Node.js version with native type stripping (Node 23.6 or later; verified on Node 26). Capture while logged out: the sanitizer removes session data from attributes, but not visible text such as an account name or delivery address.

The script opens a visible browser with the `es-ES` locale. Solve any CAPTCHA or cookie banner by hand; the script never bypasses them. Press Enter to capture. The page is sanitized (scripts, styles, and session, CSRF, and token values are removed) and saved to `captures/amazon/`.

Captures are third-party content and stay local: `captures/` is git-ignored. Committed tests never depend on them.

## Roadmap

| Version | Focus                       |
| ------- | --------------------------- |
| V0.1    | Amazon Crawler Foundation   |
| V0.2    | Persistence & Price History |
| V0.3    | CI/CD Automation            |
| V0.4    | Price Intelligence          |
| V0.5    | Second Store Adapter        |
| V1.0    | Portfolio-ready platform    |

Full roadmap: [docs/ROADMAP.md](docs/ROADMAP.md).

## Documentation

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — technical source of truth
- [docs/ROADMAP.md](docs/ROADMAP.md) — future direction
- [docs/PROJECT_STATE.md](docs/PROJECT_STATE.md) — current development state
- [docs/CHANGELOG.md](docs/CHANGELOG.md) — notable changes
- [docs/ADR/](docs/ADR/) — architecture decision records
- [AGENTS.md](AGENTS.md) — shared instructions for coding agents working on this repo

## AI Assistance

This project uses AI as an engineering assistant for exploration, drafting, and implementation support. Architecture decisions, technical validation, test evidence, and final changes are reviewed by the project author. The repository keeps its agent instructions and change artifacts visible so contributors can understand and reuse the workflow.

## Ethical Boundaries

This is a small portfolio proof of concept. It intentionally does not implement CAPTCHA bypass, anti-bot evasion, authentication bypass, or aggressive/uncontrolled crawling. It uses a small number of explicitly configured URLs at low request frequency, and documents limitations rather than bypassing them.

# Roadmap

This roadmap describes the intended direction of PriceWatch QA. It may evolve as engineering trade-offs become clearer — see docs/PROJECT_STATE.md for what is actually true right now, and docs/ADR/ for why major decisions were made.

## V0.1 — Amazon Crawler Foundation

Smallest professional, functional and testable foundation.

- Node.js + TypeScript project scaffolding
- Playwright + Playwright Test
- ESLint + Prettier
- Core domain: `Product`, `CrawlResult`, `StoreCrawler` contract
- Amazon adapter (`src/stores/amazon/`): crawler, parser, centralized selectors, config
- Validation layer
- Basic CLI (`npm run crawl -- --store amazon --url "<URL>"`)
- Deterministic parser tests against local HTML fixtures
- Basic browser test
- Explicit failure handling (no bypass techniques if Amazon blocks automation)
- Professional README

Explicitly NOT in V0.1: SQLite, PostgreSQL, Crawlee, dashboard, notifications, complex analytics, multiple stores.

## V0.2 — Persistence & Price History

- SQLite
- Repository layer
- Products table
- Price observations table
- Historical queries

## V0.3 — CI/CD Automation

- GitHub Actions
- Automated test execution on push/PR
- Scheduled crawling
- Reports and failure artifacts published from CI

## V0.4 — Price Intelligence

- Previous price
- Historical minimum / maximum
- Average price
- Percentage change
- Target price
- Deal detection

## V0.5 — Second Store Adapter

The most important architectural milestone: proves whether the Store Adapter pattern is actually reusable. Adding a second store (candidates: PcComponentes, MediaMarkt, Decathlon, Bike24, Deporvillage) should require minimal or no changes to core domain logic.

## V1.0 — Portfolio-Ready Platform

Consolidation milestone: stable core, at least two store adapters, CI/CD, persistence, and documentation ready for public/recruiter review.

## Possible V1.x

- Dashboard
- Notifications
- PostgreSQL
- Docker deployment
- Enhanced reporting
- Observability

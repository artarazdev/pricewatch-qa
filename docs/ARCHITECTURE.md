# Architecture

This document is the technical source of truth for PriceWatch QA's intended architecture. Update it when architecture genuinely changes — not for trivial implementation details. Current implementation status lives in docs/PROJECT_STATE.md, not here.

## Guiding Principle

Scraping is the use case. Automated quality, resilience, modularity and maintainability are the engineering focus. Amazon is the first Store Adapter, not the architecture.

## Module Overview

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

- **Application** — orchestrates a crawl run: selects a store, invokes its `StoreCrawler`, hands the result to validation and (later) persistence.
- **StoreCrawler contract** — the boundary every store adapter must implement. The core domain talks only to this contract, never to a store's internals.
- **Store Adapter (e.g. `src/stores/amazon/`)** — owns everything store-specific: browser interaction, selectors, parsing, adapter-local config.
- **Parser** — converts raw/store-specific extracted values into the normalized `Product` domain model.
- **Validator** — rejects invalid data before it reaches persistence. See "Validation Rules" below.
- **Persistence** (from V0.2) — stores products and price observations. Not implemented in V0.1.
- **Price Intelligence** (from V0.4) — derives trends/deals from historical price observations.

## Store Adapter Pattern

Every store implementation conforms to the same crawler contract, conceptually:

```
StoreCrawler
     |
     v
CrawlResult
     |
     v
Product
```

Rules:

- The core domain must never depend on Amazon selectors, Amazon DOM structure, or any other store-specific implementation detail.
- Store-specific identifiers (e.g. an Amazon ASIN) must not leak into the generic `Product` model and must not make it Amazon-shaped.
- Store-specific responsibilities are split into: crawler (browser interaction), parser (raw → normalized), selectors (centralized per store), and configuration (centralized per store). Amazon selectors are not scattered across the repository.
- Exact TypeScript interfaces are designed during implementation, not blindly copied from documentation. Strong typing throughout; `any` requires technical justification.

Rationale: see docs/ADR/002-store-adapter-architecture.md.

## Normalized Product Domain

Generic domain fields (approximate — finalized during implementation):

- internal identifier
- external/store identifier
- store
- product name
- price
- currency
- availability
- seller (when available)
- product URL
- scrape timestamp

## Selector Resilience

DOM changes are a realistic QA scenario. Selectors support a controlled fallback strategy where appropriate:

```
Primary
  |
  X
Fallback 1
  |
  X
Fallback 2
  |
Failure
```

A missing required selector produces an explicit failure or validation error — never a silently fabricated value (e.g. `price = 0`). Where useful, the successful selector strategy is recorded for diagnostics.

## Validation Boundary

Scraped data must pass validation before it is considered a valid observation. At minimum:

- product name exists
- price is numeric and > 0
- currency is valid/recognized
- URL is valid
- store exists
- timestamp exists

Invalid data never silently enters persistence as a valid observation.

## Testing Architecture

- **Unit** — price/currency normalization, parser behavior, validators, future deal calculations. No network, no browser.
- **Integration** — Amazon parser against deterministic local HTML fixtures; repository/database integration (from V0.2); crawler → parser → validator pipeline.
- **E2E** — real browser navigation, extraction, normalized `Product` generation, validation, failure behavior.

Deterministic local fixtures are preferred for parser tests. Unit tests must not hit Amazon. Real-browser tests are clearly separated from deterministic tests.

## Failure Evidence

On browser automation failure, preserve: screenshot, Playwright trace, timestamp, URL, failure stage, selector/error context. No artifacts are generated for successful runs beyond what's normally logged.

## Persistence Boundary (V0.2+)

Not yet implemented. When introduced, persistence will sit behind a repository layer so the domain and crawler logic remain unaware of the storage engine (SQLite initially).

## Performance Principle (Future)

Not implemented in V0.1. Intended direction — not every data source requires a browser:

```
         Data required
              |
      Browser necessary?
         /        \
       YES         NO
        |           |
   Playwright    HTTP/API
        \           /
         \         /
            Parser
              |
            Product
```

## Ethical / Operational Boundaries

This is a small portfolio PoC. Out of scope, permanently: CAPTCHA bypass, anti-bot bypass, fingerprint spoofing to evade protections, authentication bypass, aggressive/uncontrolled crawling, proxy rotation to bypass restrictions. A small number of explicitly configured product URLs, low request frequency, and respect for site restrictions/terms are required. If a target blocks or challenges automation, the limitation is documented — not bypassed.

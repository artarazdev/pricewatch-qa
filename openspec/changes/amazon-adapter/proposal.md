# Proposal: amazon-adapter

## Intent

Implement the Amazon Spain Store Adapter following the Store Adapter pattern, plus a Validation Layer to enforce the core domain's strict `Product` type contract. This delivers V0.1's Amazon crawler foundation without allowing store-specific code to leak into core domain logic.

## Scope

### In Scope
- `src/stores/amazon/crawler.ts` — `StoreCrawler` implementation using Playwright
- `src/stores/amazon/parser.ts` — DOM-to-domain object transformation
- `src/stores/amazon/selectors.ts` — Amazon Spain CSS selectors (isolated, no leakage)
- `src/stores/amazon/config.ts` — Store-specific configuration (base URL, timeouts)
- `src/core/domain/validator.ts` — Product field validation against the 10-field contract
- `src/core/domain/errors.ts` — Explicit failure types (no silent coercion)
- Unit tests for parser and validator using local HTML fixtures
- Integration tests using Playwright with a mock Amazon Spain page

### Out of Scope
- CLI entrypoint or REPL
- Git repository initialization
- E2E tests against live Amazon Spain
- Additional store adapters (eBay, etc.)
- Price history storage or persistence layer

## Capabilities

### New Capabilities
- `amazon-crawl`: Crawl a product page URL and return a `CrawlResult` discriminated union
- `product-validate`: Validate raw parsed data against the `Product` type contract before returning
- `amazon-parse`: Transform Amazon Spain HTML into a normalized product object

## Approach

1. **Stub core contracts first** — Write `StoreCrawler` interface and `CrawlResult` type in `src/core/` to anchor the contract
2. **Build Amazon adapter** — Implement `src/stores/amazon/` files, keeping selectors and DOM logic Amazon-specific
3. **Validation layer** — Build `validator.ts` that accepts any store's raw output and enforces the `Product` schema
4. **Test-first** — Write parser unit tests against HTML fixtures before implementing the parser; validate validator with edge cases (missing fields, wrong currency, null prices)

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/stores/amazon/` | New | Full Amazon adapter (crawler, parser, selectors, config) |
| `src/core/domain/validator.ts` | New | Product field validation against 10-field contract |
| `src/core/domain/errors.ts` | New | Explicit failure types |
| `tests/unit/` | New | Parser and validator unit tests |
| `tests/integration/` | New | Adapter integration tests with fixtures |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Amazon Spain DOM changes break selectors | Medium | Isolate selectors in `selectors.ts`; add regression fixture tests |
| Playwright browser automation detected | Low | No anti-bot evasion; document limitation if blocked |
| Currency mismatch (EUR vs GBP) | Low | Validation layer rejects non-EUR currencies for Amazon Spain |

## Rollback Plan

1. Delete `src/stores/amazon/` directory entirely — no core code references it yet
2. Remove `src/core/domain/validator.ts` and `errors.ts`
3. Remove test files under `tests/unit/` and `tests/integration/` for these modules
4. No migration or data cleanup needed — this is greenfield

## Dependencies

- `@playwright/test` (already installed per session #28)
- Playwright browser binary (`npx playwright install chromium` — needs sudo; document in PROJECT_STATE)

## Success Criteria

- [ ] `src/stores/amazon/crawler.ts` exports `AmazonCrawler` implementing `StoreCrawler` interface
- [ ] Parser produces a `Product` object with all required fields populated; optional `seller` may be absent
- [ ] Validator rejects invalid data with typed error messages (no silent coercion to defaults)
- [ ] Unit tests for parser pass against HTML fixture
- [ ] Validator correctly identifies missing required fields and invalid currency/availability values
- [ ] `npm test` runs without errors

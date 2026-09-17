# SDD Tasks: Amazon Store Adapter + Validation Layer

**Change:** amazon-adapter  
**Created:** 2026-08-12

---

## Phase 1: Core Validation Layer

### Task 1.1 [x]
- **action:** create
- **target:** `src/core/domain/errors.ts`
- **description:** Create typed error data objects for validation and extraction failures. Exports `ValidationError` (type, field, message) and `ExtractionError` (type, field, reason). No class hierarchies — plain data objects as specified.
- **verify:** File exists, exports both interfaces, `type` discriminator is literal `'ValidationError'` and `'ExtractionError'` respectively.

### Supporting contract [x]
- **action:** create
- **target:** `src/core/product-candidate.ts`
- **description:** Create adapter-neutral `ProductCandidate` with optional untrusted fields. This approved design correction prevents `src/core` from importing Amazon `RawProduct`.
- **verify:** Core validation boundary has no Amazon imports.

### Task 1.2 [x]
- **action:** create
- **target:** `src/core/domain/validator.ts`
- **description:** Create validator module with a discriminated `ValidationResult` and `validate(candidate: ProductCandidate): ValidationResult` function. Enforces the required `Product` fields, including name required/non-empty, price required/>0, currency EUR/USD/GBP, availability in_stock/out_of_stock/unknown, URL valid, and scrapedAt a valid Date. Optional seller is skipped. Collects ALL errors before returning — not fail-fast.
- **verify:** `npm run lint` passes. Unit tests (Task 5.1) cover all scenarios from product-validation spec.

---

## Phase 2: Amazon Selectors + Config

### Task 2.1
- **action:** create
- **target:** `src/stores/amazon/config.ts`
- **description:** Create Amazon store configuration exporting `AmazonConfig` interface and const object with `baseUrl: 'https://www.amazon.es'`, `timeoutMs: 30_000`, `expectedCurrency: 'EUR'`. No runtime loading.
- **verify:** File exists, exports `AmazonConfig` and `amazonConfig` const, types match design.

### Task 2.2
- **action:** create
- **target:** `src/stores/amazon/selectors.ts`
- **description:** Create selector fallback chains exporting `SelectorChain` and `FieldSelectors` interfaces, and `SELECTORS` record. Chains for: name (primary `#productTitle`, fallback `[data-automation="product-title"]`), price (primary `.a-price .a-offscreen`, fallbacks `#priceblock_ourprice`, `#priceblock_dealprice`), availability, seller, url/externalId. Each chain entry has selector string, attribute ('textContent'|'href'|'src'|'aria-label'), optional transform function.
- **verify:** File exists, `SELECTORS` record contains all specified fields, primary and fallback chains are defined as specified.

---

## Phase 3: Amazon Parser

### Task 3.1
- **action:** create
- **target:** `src/stores/amazon/parser.ts`
- **description:** Create Amazon parser exporting `RawProduct` interface and `parseProduct(page: Page, url: string): Promise<RawProduct>`. Implements selector chain iteration — tries primary then fallbacks until success. Applies field transforms (strip currency symbols from price). Returns RawProduct with undefined fields for failed extractions. Does NOT throw. Also exports `normalize(raw: RawProduct): UnvalidatedProduct` that converts string prices to numbers, parses availability, sets store identifier and scrapedAt.
- **verify:** File exists, exports `RawProduct`, `parseProduct`, `normalize`. Parser.test.ts (Task 5.2) passes.

---

## Phase 4: Amazon Crawler

### Task 4.1
- **action:** create
- **target:** `src/stores/amazon/crawler.ts`
- **description:** Create `AmazonCrawler` class implementing `StoreCrawler` interface (store = 'amazon-es'). Implements `crawl(url: string): Promise<CrawlResult>` with four stages: (1) navigation via Playwright page.goto — returns `CrawlFailure { stage: 'navigation' }` on failure/timeout, (2) extraction via parser.parseProduct — returns `CrawlFailure { stage: 'extraction' }` if all selectors exhausted, (3) parsing via parser.normalize — returns `CrawlFailure { stage: 'parsing' }` on malformed data, (4) validation via validate() — returns `CrawlFailure { stage: 'validation' }` with concatenated reasons on failure, returns `CrawlSuccess { status: 'success', product }` on valid.
- **verify:** File exists, class implements StoreCrawler, all four failure stages are covered. Compiles without errors.

---

## Phase 5: Tests and Fixtures

### Task 5.1
- **action:** create
- **target:** `tests/fixtures/amazon/product-in-stock.html`
- **description:** Create static HTML fixture simulating Amazon Spain product page in stock. Must include all selectors from SELECTORS chain: `#productTitle` with product name text, `.a-price .a-offscreen` with price (e.g. "29,99 €"), in-stock availability indicator, seller name, product link with external ID.
- **verify:** File exists, contains valid HTML with all expected selectors present.

### Task 5.2
- **action:** create
- **target:** `tests/fixtures/amazon/product-out-of-stock.html`
- **description:** Create static HTML fixture same structure as in-stock but with out-of-stock availability indicator and price if present.
- **verify:** File exists, out-of-stock state is represented.

### Task 5.3
- **action:** create
- **target:** `tests/fixtures/amazon/product-partial.html`
- **description:** Create static HTML fixture missing some optional fields (seller absent). Required fields still present.
- **verify:** File exists, seller field is absent/empty.

### Task 5.4 [x]
- **action:** create
- **target:** `tests/unit/validator.test.ts`
- **description:** Create validator unit tests covering all scenarios from product-validation spec: valid product → valid: true, missing name → valid: false, zero/negative price → valid: false, invalid currency → valid: false, invalid availability → valid: false, undefined seller → valid: true, multiple errors → all reported (not fail-fast). Also covers explicit-failure spec: missing name not coerced, invalid price not coerced to zero, invalid currency not normalized.
- **verify:** `npm test` runs this test file and all cases pass.

> **Approved design correction:** Task 1.2 originally named Amazon `RawProduct` as a core validator input. The validator instead accepts core `ProductCandidate`; Amazon `RawProduct` remains adapter-local when Task 3.1 is implemented.

### Task 5.5
- **action:** create
- **target:** `tests/unit/parser.test.ts`
- **description:** Create parser unit tests loading HTML fixtures and testing: parseProduct returns expected RawProduct structure, price string extracted without currency symbol, all fields present on in-stock fixture, missing selector results in undefined field in RawProduct, partial fixture missing optional fields.
- **verify:** `npm test` runs this test file and all cases pass.

---

## Review Workload Forecast

| Metric | Value |
|--------|-------|
| **Total estimated new lines** | ~900-1100 |
| **Files to create** | 11 |
| **Estimated complexity** | MEDIUM |
| **Chained PRs recommended** | No |
| **400-line budget risk** | LOW |
| **Decision needed before apply** | No |

### Breakdown
- **Phase 1** (errors.ts + validator.ts): ~100-120 lines, 2 files
- **Phase 2** (config.ts + selectors.ts): ~150-180 lines, 2 files
- **Phase 3** (parser.ts): ~200-250 lines, 1 file
- **Phase 4** (crawler.ts): ~120-150 lines, 1 file
- **Phase 5** (tests + fixtures): ~350-450 lines across 5 files

### Rationale
- Single cohesive feature with clear boundaries
- No cross-cutting concerns beyond the defined interfaces
- Tests are unit tests against fixtures (no network, no browser)
- Crawler is the only integration point and is straightforward pipeline code
- Complexity is medium due to selector fallback logic and validation accumulation pattern, but neither is novel

# SDD: Amazon Store Adapter + Validation Layer

## 1. File Structure and Locations

```
src/
├── stores/
│   └── amazon/
│       ├── crawler.ts       # AmazonCrawler implementing StoreCrawler
│       ├── parser.ts         # DOM → RawProduct → Product
│       ├── selectors.ts      # CSS selectors with fallback chains
│       └── config.ts          # Store base URL, timeouts, currency
│
├── core/
│   ├── product-candidate.ts # Adapter-neutral, unvalidated product boundary
│   └── domain/
│       ├── validator.ts     # Product field validation
│       └── errors.ts        # Explicit failure types

tests/
├── fixtures/
│   └── amazon/
│       ├── product-in-stock.html
│       ├── product-out-of-stock.html
│       └── product-partial.html
└── unit/
    ├── parser.test.ts
    └── validator.test.ts
```

**Files to create:**

| File | Purpose |
|------|---------|
| `src/stores/amazon/config.ts` | Store config (base URL, timeouts, expected currency) |
| `src/stores/amazon/selectors.ts` | Selector fallback chains for each field |
| `src/stores/amazon/parser.ts` | HTML → RawProduct → validated Product |
| `src/stores/amazon/crawler.ts` | Playwright browser automation → CrawlResult |
| `src/core/domain/errors.ts` | ValidationError, ExtractionError types |
| `src/core/domain/validator.ts` | validate(product): ValidationResult |
| `tests/unit/parser.test.ts` | Parser against HTML fixtures |
| `tests/unit/validator.test.ts` | Validator edge cases |

---

## 2. Module Responsibilities

### `src/stores/amazon/config.ts`

Exports a `AmazonConfig` object:

```typescript
export interface AmazonConfig {
  baseUrl: 'https://www.amazon.es';
  timeoutMs: 30_000;
  expectedCurrency: 'EUR';
}
```

No runtime loading. Config is a simple const object imported by crawler and parser.

### `src/stores/amazon/selectors.ts`

Exports a `SELECTORS` object keyed by product field. Each field has a fallback chain:

```typescript
export interface SelectorChain {
  selector: string;
  attribute?: 'textContent' | 'href' | 'src' | 'aria-label';
  transform?: (raw: string) => string;
}

export interface FieldSelectors {
  primary: SelectorChain;
  fallbacks?: SelectorChain[];
}

export const SELECTORS: Record<string, FieldSelectors> = {
  name: {
    primary: { selector: '#productTitle', attribute: 'textContent' },
    fallbacks: [
      { selector: '[data-automation="product-title"]', attribute: 'textContent' },
    ],
  },
  price: {
    primary: { selector: '.a-price .a-offscreen', attribute: 'textContent' },
    fallbacks: [
      { selector: '#priceblock_ourprice', attribute: 'textContent' },
      { selector: '#priceblock_dealprice', attribute: 'textContent' },
    ],
  },
  // ...
};
```

Selector chains are store-internal. The core domain never references them.

### `src/stores/amazon/parser.ts`

**Input:** Playwright `Page` object  
**Output:** `RawProduct` (internal intermediate) → `Product` after validation

Exports `parseProduct(page: Page, url: string): Promise<RawProduct>`

Steps:
1. For each field, iterate its selector chain until one succeeds
2. Extract text/value via the specified attribute
3. Apply field-specific transforms (strip currency symbols, parse price strings)
4. Return `RawProduct` with all fields populated or `undefined`

Does NOT throw. Returns a structured raw object that validator then checks.

### `src/stores/amazon/crawler.ts`

**Input:** product URL string  
**Output:** `Promise<CrawlResult>`

```typescript
export class AmazonCrawler implements StoreCrawler {
  readonly store = 'amazon-es';

  async crawl(url: string): Promise<CrawlResult> {
    // 1. navigation stage
    // 2. extraction stage (uses parser)
    // 3. parsing stage
    // 4. validation stage (uses validator)
    // Returns CrawlSuccess or CrawlFailure with accurate stage
  }
}
```

Uses Playwright. On failure at any stage, returns `CrawlFailure` with that `stage` field populated.

### `src/core/domain/errors.ts`

```typescript
export interface ValidationError {
  type: 'ValidationError';
  field: string;
  message: string;
}

export interface ExtractionError {
  type: 'ExtractionError';
  field: string;
  reason: string;
}
```

No error class hierarchies. Plain data objects.

### `src/core/domain/validator.ts`

**Input:** `ProductCandidate`  
**Output:** `{ valid: true, product: Product } | { valid: false, errors: ValidationError[] }`

```typescript
export interface ValidationResult {
  valid: boolean;
  product?: Product;
  errors?: ValidationError[];
}

export function validate(candidate: ProductCandidate): ValidationResult
```

Rules enforced:
- `name`: required, non-empty string
- `price`: required, number > 0
- `currency`: required, must match store's expected currency
- `availability`: required, one of defined literals
- `seller`: optional
- `url`: required, valid URL
- `scrapedAt`: required, Date instance

All errors collected before returning — not fail-fast.

---

## 3. Data Flow

```
URL string
    │
    ▼
AmazonCrawler.crawl(url)
    │
    ├── [navigation stage]
    │   └── Playwright page.goto(url)
    │       ├── success → Page object
    │       └── failure → CrawlFailure { stage: 'navigation', reason: string }
    │
    ▼
    │
    ├── [extraction stage]
    │   └── parser.extract(page)
    │       ├── success → RawProduct
    │       └── failure (all selectors exhausted)
    │           └── CrawlFailure { stage: 'extraction', reason: string }
    │
    ▼
    │
    ├── [parsing stage]
    │   └── parser.normalize(raw)
    │       ├── success → Product (unvalidated)
    │       └── failure (malformed data)
    │           └── CrawlFailure { stage: 'parsing', reason: string }
    │
    ▼
    │
    ├── [validation stage]
    │   └── validate(product)
    │       ├── valid: true → CrawlSuccess { status: 'success', product }
    │       └── valid: false → CrawlFailure { stage: 'validation', reason: string }
    │
    ▼
CrawlResult (discriminated union)
```

---

## 4. Key Type Definitions

### New types beyond core domain

```typescript
// src/stores/amazon/parser.ts

export interface RawProduct {
  name?: string;
  price?: string;       // unparsed string from DOM
  currency?: string;
  availability?: string;
  seller?: string;
  url: string;
  externalId?: string;
}

// src/core/product-candidate.ts
// Adapter-neutral product data at the untrusted validation boundary.
export interface ProductCandidate {
  id?: unknown;
  externalId?: unknown;
  store?: unknown;
  name?: unknown;
  price?: unknown;
  currency?: unknown;
  availability?: unknown;
  seller?: unknown;
  url?: unknown;
  scrapedAt?: unknown;
}

// Selector chain result
export interface SelectorResult {
  field: string;
  value: string | undefined;
  selectorUsed: string;
}
```

---

## 5. Selector Strategy

Each field in `SELECTORS` defines a fallback chain. The parser tries them in order:

```typescript
async function extractField(page: Page, field: string): Promise<SelectorResult> {
  const chain = SELECTORS[field];
  for (const { selector, attribute, transform } of [chain.primary, ...(chain.fallbacks ?? [])]) {
    const element = await page.locator(selector).first();
    if (await element.count() === 0) continue;
    
    const raw = attribute === 'textContent'
      ? await element.textContent()
      : await element.getAttribute(attribute);
    
    if (raw === null || raw === '') continue;
    
    return {
      field,
      value: transform ? transform(raw) : raw,
      selectorUsed: selector,
    };
  }
  return { field, value: undefined, selectorUsed: 'none' };
}
```

On complete failure (no selector in chain matches), the crawler returns `CrawlFailure` at extraction stage.

On partial success, the field is `undefined` in `RawProduct` and the validator catches it.

---

## 6. Error Handling Approach

**Explicit failures, no coercion:**

- Parser returns `RawProduct` with fields as `undefined` when extraction fails — it does not guess
- Validator receives the raw object and returns a `ValidationResult` with all errors collected
- If validation fails, `AmazonCrawler.crawl()` returns `CrawlFailure { stage: 'validation' }`
- `CrawlFailure.reason` concatenates all validation error messages

**Error objects are data, not thrown exceptions** — the crawler returns typed results, exceptions are reserved for truly unexpected programming errors.

```typescript
// Validation error accumulation
const errors: ValidationError[] = [];
if (!product.name || product.name.trim() === '') {
  errors.push({ type: 'ValidationError', field: 'name', message: 'name is required' });
}
if (product.price === undefined || product.price <= 0) {
  errors.push({ type: 'ValidationError', field: 'price', message: 'price must be a number greater than 0' });
}
// ...
```

---

## 7. Testing Strategy

### Fixtures location

```
tests/fixtures/amazon/
├── product-in-stock.html      # Full product page, in stock, all fields present
├── product-out-of-stock.html  # Same structure, out of stock
└── product-partial.html       # Missing some optional fields (seller, etc.)
```

Fixtures are static HTML files that simulate Amazon Spain product page structure. They live in `tests/fixtures/amazon/` and are loaded via `path.join(__dirname, '../../fixtures/amazon/product-in-stock.html')`.

### Unit tests

**`tests/unit/validator.test.ts`**
- Valid product → `valid: true`
- Missing `name` → `valid: false`, error on `name`
- Zero price → `valid: false`, error on `price`
- Negative price → `valid: false`
- Invalid currency → `valid: false`
- Invalid availability → `valid: false`
- Undefined optional `seller` → `valid: true`
- Multiple errors → all reported (not fail-fast)

**`tests/unit/parser.test.ts`**
- Loads fixture HTML
- `parseProduct(page, url)` returns expected RawProduct
- Price string is extracted without currency symbol
- All fields present → no undefined on required fields
- Missing selector → field is `undefined` in RawProduct

### Integration tests

`tests/integration/` not implemented in V0.1 — deferred per proposal out-of-scope list. The `AmazonCrawler` integration with real Playwright against a live Amazon page is explicitly out of scope.

### Test types separation

- `npm test` runs unit tests only (via Playwright test runner on `tests/unit/`)
- `npm run test:e2e` runs E2E tests (`tests/e2e/`) — not created in this change

---

## 8. Key Architectural Decisions

### Decision 1: Core-neutral ProductCandidate validation boundary

**Choice:** Store parsers retain adapter-local raw extraction types (for example, Amazon `RawProduct`) and map them to the core `ProductCandidate`. The core validator accepts only `ProductCandidate` and returns a validated `Product` or typed validation errors.

**Rationale:** Importing Amazon `RawProduct` into `src/core` would reverse the Store Adapter dependency direction. `ProductCandidate` makes the untrusted boundary reusable by every adapter while allowing the validator to reject missing, malformed, or unsupported values without coercion.

**Alternative considered:** Import Amazon `RawProduct` into the core validator. Rejected because it makes the core depend on one adapter and prevents future adapters from sharing the validation boundary.

### Decision 2: Selector chains in a single exported object, not per-field files

**Choice:** All Amazon selector chains live in one `selectors.ts` file, keyed by field name.

**Rationale:** Centralizes store-specific DOM knowledge in one place. When Amazon changes a selector, one file is updated. Fallback chains are co-located with their primary, making it easy to see the full resolution strategy for a field. Alternative (per-field files) creates import sprawl without benefit at this scale.

**Alternative considered:** Per-field files under `selectors/` directory. Over-engineered for a single store adapter. Can be refactored later if stores multiply.

### Decision 3: Validation errors are data, not thrown exceptions

**Choice:** `validate()` returns a `ValidationResult` discriminated object, not `throws` on error.

**Rationale:** The crawler pipeline (navigation → extraction → parsing → validation) maps cleanly onto `CrawlResult` discriminated unions when each stage returns data. If validator threw, the crawler would need try/catch to convert exceptions into `CrawlFailure`. Returning typed results keeps the pipeline pure: each stage is a pure transform from one typed value to another (or a failure).

**Alternative considered:** Validator throws `ValidationException`. Adds exception handling boilerplate to crawler and makes it harder to collect all validation errors in one pass.

---

## 9. Rollback Plan

Since this is greenfield with no existing code referencing the new modules:

1. **Delete** `src/stores/amazon/` directory — contains all Amazon-specific code
2. **Delete** `src/core/domain/validator.ts` and `src/core/domain/errors.ts`
3. **Delete** `tests/unit/parser.test.ts` and `tests/unit/validator.test.ts`
4. **Delete** `tests/fixtures/amazon/` directory

No migration needed. No core domain files are modified by this change — only new files are added. The `src/core/` stub files (`store-crawler.ts`, `crawl-result.ts`, `product.ts`) were written in a prior stub-only session and remain as contract anchors.

If the implementation is done incrementally (stub files first, then parser, then validator, then crawler), rollback can be staged:
- After parser + fixtures: delete `src/stores/amazon/parser.ts` and `tests/unit/parser.test.ts`
- After validator + errors: delete `src/core/domain/` files
- After crawler: delete `src/stores/amazon/crawler.ts` and `config.ts`

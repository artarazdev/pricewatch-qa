# Delta for amazon-crawl

## ADDED Requirements

### Requirement: store-adapter-shim

The store adapter SHALL accept a valid store product URL and return a normalized product record conforming to the core `Product` domain type.

The adapter MUST NOT expose store-internal identifiers or DOM structures outside the adapter boundary.

#### Scenario: successful crawl returns valid product

- GIVEN a reachable product page URL for a supported store
- WHEN the `crawl(url)` method is invoked
- THEN the result SHALL be `CrawlSuccess` with a `Product` object where all required fields are populated or explicitly `undefined`
- AND the `status` field SHALL be `'success'`
- AND the `product.store` field SHALL match the adapter's store identifier

#### Scenario: crawl result conforms to domain contract

- GIVEN a successful crawl of any product page
- WHEN the `Product` object is inspected
- THEN `product.id` SHALL be a non-empty string
- AND `product.externalId` SHALL be a non-empty string
- AND `product.store` SHALL be a non-empty string
- AND `product.name` SHALL be a non-empty string
- AND `product.price` SHALL be a number greater than zero
- AND `product.currency` SHALL be one of `'EUR' | 'USD' | 'GBP'`
- AND `product.availability` SHALL be one of `'in_stock' | 'out_of_stock' | 'unknown'`
- AND `product.url` SHALL be a valid URL string
- AND `product.scrapedAt` SHALL be a valid `Date` instance

#### Scenario: crawl completes within configured timeout

- GIVEN a valid product URL
- WHEN `crawl(url)` is called
- THEN the operation SHALL complete or fail with a `CrawlFailure` within the configured store timeout
- AND SHALL NOT hang indefinitely

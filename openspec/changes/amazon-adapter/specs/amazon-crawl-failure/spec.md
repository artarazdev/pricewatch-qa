# Delta for amazon-crawl-failure

## ADDED Requirements

### Requirement: crawl-failure-with-stage

The store adapter SHALL return a `CrawlFailure` with an accurate `stage` field when crawling cannot produce a valid product.

The `stage` field SHALL identify which phase of the crawl pipeline failed: `navigation`, `extraction`, `parsing`, or `validation`.

#### Scenario: unreachable URL produces navigation failure

- GIVEN a product URL that results in a connection failure or HTTP 4xx/5xx response
- WHEN `crawl(url)` is invoked
- THEN the result SHALL be `CrawlFailure` with `stage` set to `'navigation'`
- AND `reason` SHALL contain a human-readable description of the failure
- AND `url` SHALL echo the requested URL

#### Scenario: missing page structure produces extraction failure

- GIVEN a valid URL that returns HTML which lacks the expected product page structure
- WHEN `crawl(url)` is invoked
- THEN the result SHALL be `CrawlFailure` with `stage` set to `'extraction'`
- AND `reason` SHALL indicate that required content was not found

#### Scenario: malformed product data produces parsing failure

- GIVEN a URL that returns HTML with product structure but with data that cannot be parsed into a normalized `Product`
- WHEN `crawl(url)` is invoked
- THEN the result SHALL be `CrawlFailure` with `stage` set to `'parsing'`
- AND `reason` SHALL describe the parsing error

#### Scenario: invalid product data produces validation failure

- GIVEN a parsed `Product` object that fails domain validation
- WHEN `crawl(url)` is invoked
- THEN the result SHALL be `CrawlFailure` with `stage` set to `'validation'`
- AND `reason` SHALL list the validation errors

#### Scenario: timeout produces navigation failure

- GIVEN a product URL that causes the browser to hang beyond the configured timeout
- WHEN `crawl(url)` is invoked
- THEN the result SHALL be `CrawlFailure` with `stage` set to `'navigation'`
- AND `reason` SHALL indicate a timeout

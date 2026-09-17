# Delta for explicit-failure

## ADDED Requirements

### Requirement: no-silent-coercion

The validation layer and store adapter SHALL fail explicitly with typed errors when required data is missing or invalid.

The system SHALL NOT convert invalid data into plausible-looking defaults (e.g., `price = 0`, empty string for `name`).

#### Scenario: missing required field produces explicit error

- GIVEN a raw product object with an undefined or empty `name` field
- WHEN validation runs
- THEN the validation result SHALL contain an explicit error with field name `'name'`
- AND the error message SHALL state the field is required
- AND `name` SHALL NOT be coerced to a default value

#### Scenario: invalid price is not coerced to zero

- GIVEN a raw product object with `price` as `null`, `undefined`, or a non-numeric string
- WHEN validation runs
- THEN the validation result SHALL be `valid: false`
- AND `price` SHALL NOT be set to `0` or any default number
- AND an explicit error SHALL describe the invalid `price` value

#### Scenario: invalid currency is not normalized to a valid one

- GIVEN a raw product object with `currency` set to an unsupported value like `'GBP'` when the store is EUR-only
- WHEN validation runs
- THEN the result SHALL be `valid: false`
- AND the `currency` value SHALL NOT be coerced to `'EUR'`
- AND an explicit error SHALL describe the invalid currency

#### Scenario: unparseable price does not become zero

- GIVEN a raw product object with `price` as a non-numeric string like `'N/A'`
- WHEN validation runs
- THEN the result SHALL be `valid: false`
- AND `price` SHALL NOT be coerced to `0`
- AND an explicit error SHALL indicate the unparseable price

#### Scenario: crawler does not return partial product on validation failure

- GIVEN a crawl that produces a `Product` object failing validation
- WHEN the crawl completes
- THEN the result SHALL be `CrawlFailure` with `stage: 'validation'`
- AND the result SHALL NOT contain a `Product` with defaulted/coerced fields

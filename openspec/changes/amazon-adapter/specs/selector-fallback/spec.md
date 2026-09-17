# Delta for selector-fallback

## ADDED Requirements

### Requirement: selector-resilience

The store adapter SHALL attempt selector resolution in a defined fallback order when the primary selector fails to extract required content.

The system SHALL NOT fabricate values from failed selectors; a fully failed extraction chain SHALL result in an explicit `CrawlFailure`.

#### Scenario: primary selector success skips fallbacks

- GIVEN a product page where the primary selector successfully extracts a required field
- WHEN the extraction phase runs
- THEN only the primary selector SHALL be attempted
- AND no fallback selectors SHALL be invoked for that field

#### Scenario: primary selector failure triggers first fallback

- GIVEN a product page where the primary selector returns no match
- WHEN the extraction phase runs
- THEN the adapter SHALL attempt the first fallback selector
- AND if the first fallback succeeds, extraction SHALL proceed

#### Scenario: all fallbacks exhausted produces extraction failure

- GIVEN a product page where all selectors in the fallback chain fail to extract a required field
- WHEN the extraction phase runs
- THEN the crawl result SHALL be `CrawlFailure` with `stage: 'extraction'`
- AND `reason` SHALL indicate that the required field could not be extracted

#### Scenario: successful fallback is recorded for diagnostics

- GIVEN a product page where the primary selector fails but a fallback succeeds
- WHEN the extraction phase completes
- THEN the resulting `Product` SHALL contain the extracted value from the fallback selector
- AND diagnostic information SHALL record which selector in the chain succeeded

#### Scenario: fallback order is store-specific and isolated

- GIVEN the store adapter configuration
- WHEN the adapter runs
- THEN the fallback chain SHALL be defined in the store's selector configuration file
- AND the core domain SHALL NOT contain store-specific selector logic

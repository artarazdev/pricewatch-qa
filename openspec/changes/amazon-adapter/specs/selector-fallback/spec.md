# Delta for selector-fallback

## ADDED Requirements

### Requirement: selector-resilience

The store adapter SHALL attempt selector resolution in a defined fallback order when the primary selector fails to extract required content.

The system SHALL NOT fabricate values from failed selectors. A fully failed extraction chain for a required field SHALL result in an explicit `CrawlFailure`.

### Requirement: field-specific extraction semantics

The Amazon adapter SHALL keep selector chains and field semantics inside `src/stores/amazon/`.

- The adapter SHALL monitor only the new offer. When the buy box shows several offers (for example new and used), every offer-level selector SHALL be scoped to the new-offer container, and values from any other offer SHALL NOT be extracted.
- `name`, final `price`, and `availability` SHALL be extracted from DOM selector chains and are required fields.
- `seller` SHALL be extracted from an adapter-local DOM selector chain and is optional; an exhausted seller chain SHALL produce `undefined`, not an extraction failure. `seller` is the merchant that sells the new offer, not the party that fulfills or ships it.
- `price` SHALL be the price to pay for the new offer. Amazon ES consumer pages show a single VAT-inclusive price; the adapter SHALL NOT extract the strikethrough list or reference price.
- When a selector matches several nodes inside the same offer container, the parser SHALL use the first match. A selector SHALL NOT be able to match nodes that belong to different offers.
- Every selector in a chain SHALL be backed by at least one real page capture where it resolves the expected value. Captures are sanitized third-party content kept locally in the git-ignored `captures/amazon/` directory and SHALL NOT be committed. A fallback without capture evidence SHALL NOT be added.
- The requested product URL SHALL remain available as the crawl input. A canonical URL MAY be extracted from `link[rel="canonical"]`, but the parser SHALL not substitute it for the requested URL until the URL policy is defined.
- `externalId` SHALL be derived only from an explicitly documented and fixture-tested Amazon URL grammar; it SHALL NOT be fabricated from an unverified DOM selector.

#### Scenario: new offer takes precedence over other offers

- GIVEN a product page whose buy box shows a new offer and a used offer
- WHEN the extraction phase runs
- THEN the adapter SHALL extract the price, availability, and seller of the new offer
- AND it SHALL NOT extract any value from the used offer

#### Scenario: list price is ignored

- GIVEN a product page that shows a strikethrough list price and a price to pay
- WHEN the extraction phase runs
- THEN the extracted price SHALL be the price to pay
- AND it SHALL NOT be the list price

#### Scenario: seller differs from fulfiller

- GIVEN a product page where a third-party merchant sells the new offer and Amazon fulfills it
- WHEN the extraction phase runs
- THEN the extracted seller SHALL be the third-party merchant
- AND it SHALL NOT be the fulfiller

#### Scenario: optional seller is absent

- GIVEN a product page where the seller selector chain has no match
- WHEN the extraction phase runs
- THEN the extracted seller value SHALL be `undefined`
- AND extraction SHALL continue for the required fields

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

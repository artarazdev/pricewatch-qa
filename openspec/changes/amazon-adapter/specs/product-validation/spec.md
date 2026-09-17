# Delta for product-validation

## ADDED Requirements

### Requirement: product-field-validation

The validation layer SHALL accept any raw product object and return a typed validation result indicating whether the data conforms to the `Product` domain contract.

The validator MUST NOT silently coerce invalid values into defaults.

#### Scenario: valid product passes validation

- GIVEN a `Product` object with all required fields correctly typed and within valid ranges
- WHEN `validate(product)` is called
- THEN the result SHALL indicate `valid: true`
- AND no error list SHALL be returned

#### Scenario: missing required field fails validation

- GIVEN a `Product` object where `name` is `undefined` or an empty string
- WHEN `validate(product)` is called
- THEN the result SHALL indicate `valid: false`
- AND the errors SHALL include a message identifying `name` as required and missing or empty

#### Scenario: zero price fails validation

- GIVEN a `Product` object where `price` is `0` or a negative number
- WHEN `validate(product)` is called
- THEN the result SHALL indicate `valid: false`
- AND the errors SHALL indicate that `price` must be greater than zero

#### Scenario: invalid currency fails validation

- GIVEN a `Product` object where `currency` is not one of `'EUR' | 'USD' | 'GBP'`
- WHEN `validate(product)` is called
- THEN the result SHALL indicate `valid: false`
- AND the errors SHALL indicate an invalid currency value

#### Scenario: invalid availability value fails validation

- GIVEN a `Product` object where `availability` is not one of `'in_stock' | 'out_of_stock' | 'unknown'`
- WHEN `validate(product)` is called
- THEN the result SHALL indicate `valid: false`
- AND the errors SHALL indicate an invalid availability value

#### Scenario: undefined optional field passes validation

- GIVEN a `Product` object where `seller` is `undefined`
- WHEN `validate(product)` is called
- THEN the result SHALL indicate `valid: true`
- AND no error SHALL be produced for the `seller` field

#### Scenario: multiple validation errors are all reported

- GIVEN a `Product` object with more than one invalid field
- WHEN `validate(product)` is called
- THEN the result SHALL indicate `valid: false`
- AND the errors SHALL include all individual field errors
- AND the errors SHALL NOT stop at the first error

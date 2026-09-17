import type { ProductCandidate } from '../product-candidate.js';
import type { Availability, Currency, Product } from '../product.js';
import type { ValidationError } from './errors.js';

export type ValidationResult =
  { valid: true; product: Product } | { valid: false; errors: ValidationError[] };

type ValidatedProductCandidate = Omit<Product, 'seller'> & { seller?: string | undefined };

export function validate(candidate: ProductCandidate): ValidationResult {
  const errors: ValidationError[] = [];

  if (!isValidProductCandidate(candidate, errors)) {
    return { valid: false, errors };
  }

  return { valid: true, product: toProduct(candidate) };
}

function isValidProductCandidate(
  candidate: ProductCandidate,
  errors: ValidationError[],
): candidate is ValidatedProductCandidate {
  const idIsValid = validateRequiredString(candidate.id, 'id', errors);
  const externalIdIsValid = validateRequiredString(candidate.externalId, 'externalId', errors);
  const storeIsValid = validateRequiredString(candidate.store, 'store', errors);
  const nameIsValid = validateRequiredString(candidate.name, 'name', errors);
  const priceIsValid = validatePrice(candidate.price, errors);
  const currencyIsValid = validateCurrency(candidate.currency, errors);
  const availabilityIsValid = validateAvailability(candidate.availability, errors);
  const sellerIsValid = validateOptionalSeller(candidate.seller, errors);
  const urlIsValid = validateUrl(candidate.url, errors);
  const scrapedAtIsValid = validateScrapedAt(candidate.scrapedAt, errors);

  return (
    idIsValid &&
    externalIdIsValid &&
    storeIsValid &&
    nameIsValid &&
    priceIsValid &&
    currencyIsValid &&
    availabilityIsValid &&
    sellerIsValid &&
    urlIsValid &&
    scrapedAtIsValid
  );
}

function toProduct(candidate: ValidatedProductCandidate): Product {
  const product: Product = {
    id: candidate.id,
    externalId: candidate.externalId,
    store: candidate.store,
    name: candidate.name,
    price: candidate.price,
    currency: candidate.currency,
    availability: candidate.availability,
    url: candidate.url,
    scrapedAt: candidate.scrapedAt,
  };

  if (candidate.seller !== undefined) {
    product.seller = candidate.seller;
  }

  return product;
}

function validateRequiredString(
  value: unknown,
  field: string,
  errors: ValidationError[],
): value is string {
  if (typeof value === 'string' && value.trim() !== '') {
    return true;
  }

  errors.push({ type: 'ValidationError', field, message: `${field} is required` });
  return false;
}

function validatePrice(value: unknown, errors: ValidationError[]): value is number {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
    return true;
  }

  errors.push({
    type: 'ValidationError',
    field: 'price',
    message: 'price must be a number greater than 0',
  });
  return false;
}

function validateCurrency(value: unknown, errors: ValidationError[]): value is Currency {
  if (value === 'EUR' || value === 'USD' || value === 'GBP') {
    return true;
  }

  errors.push({ type: 'ValidationError', field: 'currency', message: 'currency is invalid' });
  return false;
}

function validateAvailability(value: unknown, errors: ValidationError[]): value is Availability {
  if (value === 'in_stock' || value === 'out_of_stock' || value === 'unknown') {
    return true;
  }

  errors.push({
    type: 'ValidationError',
    field: 'availability',
    message: 'availability is invalid',
  });
  return false;
}

function validateOptionalSeller(
  value: unknown,
  errors: ValidationError[],
): value is string | undefined {
  if (value === undefined || typeof value === 'string') {
    return true;
  }

  errors.push({ type: 'ValidationError', field: 'seller', message: 'seller must be a string' });
  return false;
}

function validateUrl(value: unknown, errors: ValidationError[]): value is string {
  if (typeof value === 'string') {
    try {
      new URL(value);
      return true;
    } catch {
      // Invalid URLs are reported as validation data, not thrown exceptions.
    }
  }

  errors.push({ type: 'ValidationError', field: 'url', message: 'url must be valid' });
  return false;
}

function validateScrapedAt(value: unknown, errors: ValidationError[]): value is Date {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return true;
  }

  errors.push({
    type: 'ValidationError',
    field: 'scrapedAt',
    message: 'scrapedAt must be a valid Date',
  });
  return false;
}

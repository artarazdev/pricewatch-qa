import { expect, test } from '@playwright/test';

import type { ProductCandidate } from '../../src/core/product-candidate.js';
import { validate } from '../../src/core/domain/validator.js';

const validCandidate: ProductCandidate = {
  id: 'product-1',
  externalId: 'external-1',
  store: 'amazon-es',
  name: 'Noise Cancelling Headphones',
  price: 29.99,
  currency: 'EUR',
  availability: 'in_stock',
  seller: 'Example Seller',
  url: 'https://www.example.com/product-1',
  scrapedAt: new Date('2026-09-01T10:00:00.000Z'),
};

test('accepts a complete product candidate and returns a Product', () => {
  const result = validate(validCandidate);

  expect(result).toEqual({ valid: true, product: validCandidate });
});

test('accepts a complete product candidate without an optional seller', () => {
  const candidateWithoutSeller: ProductCandidate = { ...validCandidate };
  delete candidateWithoutSeller.seller;

  const result = validate(candidateWithoutSeller);

  expect(result).toEqual({ valid: true, product: candidateWithoutSeller });
});

test('omits an explicitly undefined optional seller from the validated Product', () => {
  const candidate: ProductCandidate = { ...validCandidate, seller: undefined };
  const expectedProduct = { ...validCandidate };
  delete expectedProduct.seller;

  const result = validate(candidate);

  expect(result).toEqual({ valid: true, product: expectedProduct });
  expect(candidate.seller).toBeUndefined();
});

test('returns an explicit name error without coercing an empty name', () => {
  const candidate = { ...validCandidate, name: '' };

  const result = validate(candidate);

  expect(result).toEqual({
    valid: false,
    errors: [{ type: 'ValidationError', field: 'name', message: 'name is required' }],
  });
  expect(candidate.name).toBe('');
});

test('returns explicit price errors for zero and non-numeric values without defaults', () => {
  const zeroPriceResult = validate({ ...validCandidate, price: 0 });
  const nonNumericPriceResult = validate({ ...validCandidate, price: 'N/A' });

  expect(zeroPriceResult).toEqual({
    valid: false,
    errors: [
      {
        type: 'ValidationError',
        field: 'price',
        message: 'price must be a number greater than 0',
      },
    ],
  });
  expect(nonNumericPriceResult).toEqual({
    valid: false,
    errors: [
      {
        type: 'ValidationError',
        field: 'price',
        message: 'price must be a number greater than 0',
      },
    ],
  });
});

test('does not coerce missing values or unsupported currency', () => {
  const candidate: ProductCandidate = {
    ...validCandidate,
    price: null,
    currency: 'JPY',
  };

  const result = validate(candidate);

  expect(result).toEqual({
    valid: false,
    errors: [
      {
        type: 'ValidationError',
        field: 'price',
        message: 'price must be a number greater than 0',
      },
      { type: 'ValidationError', field: 'currency', message: 'currency is invalid' },
    ],
  });
  expect(candidate.price).toBeNull();
  expect(candidate.currency).toBe('JPY');
});

test('returns explicit errors for unsupported currency and availability values', () => {
  const result = validate({
    ...validCandidate,
    currency: 'JPY',
    availability: 'backorder',
  });

  expect(result).toEqual({
    valid: false,
    errors: [
      { type: 'ValidationError', field: 'currency', message: 'currency is invalid' },
      { type: 'ValidationError', field: 'availability', message: 'availability is invalid' },
    ],
  });
});

test('collects all required-field errors instead of returning a partial Product', () => {
  const result = validate({
    id: '',
    externalId: undefined,
    store: '',
    name: undefined,
    price: -1,
    currency: undefined,
    availability: undefined,
    url: 'not a url',
    scrapedAt: '2026-09-01',
  });

  expect(result).toEqual({
    valid: false,
    errors: [
      { type: 'ValidationError', field: 'id', message: 'id is required' },
      { type: 'ValidationError', field: 'externalId', message: 'externalId is required' },
      { type: 'ValidationError', field: 'store', message: 'store is required' },
      { type: 'ValidationError', field: 'name', message: 'name is required' },
      {
        type: 'ValidationError',
        field: 'price',
        message: 'price must be a number greater than 0',
      },
      { type: 'ValidationError', field: 'currency', message: 'currency is invalid' },
      { type: 'ValidationError', field: 'availability', message: 'availability is invalid' },
      { type: 'ValidationError', field: 'url', message: 'url must be valid' },
      { type: 'ValidationError', field: 'scrapedAt', message: 'scrapedAt must be a valid Date' },
    ],
  });
});

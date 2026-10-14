import { expect, test } from '@playwright/test';

import { amazonConfig } from '../../src/stores/amazon/config.js';
import type { AmazonConfig } from '../../src/stores/amazon/config.js';

const config: AmazonConfig = amazonConfig;

test('defines the fixed Amazon Spain store configuration', () => {
  expect(config.baseUrl).toBe('https://www.amazon.es');
  expect(config.timeoutMs).toBe(30_000);
  expect(config.expectedCurrency).toBe('EUR');
});

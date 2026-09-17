/**
 * Adapter-neutral product data before it satisfies the core Product contract.
 * Store adapters may populate these fields from untrusted external input.
 */
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

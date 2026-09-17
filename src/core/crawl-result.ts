import type { Product } from './product.js';

export type CrawlFailureStage = 'navigation' | 'extraction' | 'parsing' | 'validation';

export interface CrawlSuccess {
  status: 'success';
  product: Product;
}

export interface CrawlFailure {
  status: 'failure';
  stage: CrawlFailureStage;
  reason: string;
  url: string;
}

export type CrawlResult = CrawlSuccess | CrawlFailure;

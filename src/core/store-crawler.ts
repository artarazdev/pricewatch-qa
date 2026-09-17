import type { CrawlResult } from './crawl-result.js';

export interface StoreCrawler {
  readonly store: string;
  crawl(url: string): Promise<CrawlResult>;
}

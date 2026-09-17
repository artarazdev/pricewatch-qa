export type Currency = 'EUR' | 'USD' | 'GBP';

export type Availability = 'in_stock' | 'out_of_stock' | 'unknown';

export interface Product {
  id: string;
  externalId: string;
  store: string;
  name: string;
  price: number;
  currency: Currency;
  availability: Availability;
  seller?: string;
  url: string;
  scrapedAt: Date;
}

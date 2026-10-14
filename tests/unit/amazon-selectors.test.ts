import { expect, test } from '@playwright/test';

import { SELECTORS } from '../../src/stores/amazon/selectors.js';
import type { FieldSelectors, SelectorAttribute } from '../../src/stores/amazon/selectors.js';

// Chains are verified against local real page captures (Task 2.1a evidence).
function chainOf(field: FieldSelectors): { selector: string; attribute: SelectorAttribute }[] {
  return [field.primary, ...(field.fallbacks ?? [])].map(({ selector, attribute }) => ({
    selector,
    attribute,
  }));
}

test('defines selector chains only for the extracted Amazon fields', () => {
  expect(Object.keys(SELECTORS).sort()).toEqual(
    ['availability', 'canonicalUrl', 'name', 'price', 'seller'].sort(),
  );
});

test('reads the product name from the visible title span only', () => {
  expect(chainOf(SELECTORS.name)).toEqual([
    { selector: 'span#productTitle', attribute: 'textContent' },
  ]);
});

test('reads the new-offer price from the accordion layout, then the single-offer layout', () => {
  expect(chainOf(SELECTORS.price)).toEqual([
    {
      selector: '#newAccordionRow_0 #corePrice_feature_div .a-price .a-offscreen',
      attribute: 'textContent',
    },
    {
      selector: '#qualifiedBuybox #corePrice_feature_div .a-price .a-offscreen',
      attribute: 'textContent',
    },
  ]);
});

test('reads the new-offer availability from the qualified buy box', () => {
  expect(chainOf(SELECTORS.availability)).toEqual([
    {
      selector: '#desktop_qualifiedBuyBox #availability .primary-availability-message',
      attribute: 'textContent',
    },
  ]);
});

test('reads the new-offer seller, not the fulfiller, from the qualified buy box', () => {
  expect(chainOf(SELECTORS.seller)).toEqual([
    {
      selector:
        '#desktop_qualifiedBuyBox #merchantInfoFeature_feature_div .offer-display-feature-text-message',
      attribute: 'textContent',
    },
  ]);
});

test('reads the canonical URL from the link href attribute', () => {
  expect(chainOf(SELECTORS.canonicalUrl)).toEqual([
    { selector: 'link[rel="canonical"]', attribute: 'href' },
  ]);
});

test('scopes every offer-level selector to a new-offer container', () => {
  const newOfferContainers = [
    '#newAccordionRow_0 ',
    '#qualifiedBuybox ',
    '#desktop_qualifiedBuyBox ',
  ];
  const offerFields = [SELECTORS.price, SELECTORS.availability, SELECTORS.seller];

  for (const { selector } of offerFields.flatMap(chainOf)) {
    expect(newOfferContainers.some((container) => selector.startsWith(container))).toBe(true);
  }
});

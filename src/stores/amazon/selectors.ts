// Every selector below is verified against real page captures (see scripts/capture-amazon-fixture.ts).
// Offer-level selectors are scoped to the new offer; used offers are never extracted.

export type SelectorAttribute = 'textContent' | 'href' | 'src' | 'aria-label';

export interface SelectorChain {
  selector: string;
  attribute: SelectorAttribute;
  transform?: (raw: string) => string;
}

export interface FieldSelectors {
  primary: SelectorChain;
  fallbacks?: readonly SelectorChain[];
}

export type SelectorField = 'name' | 'price' | 'availability' | 'seller' | 'canonicalUrl';

export const SELECTORS: Readonly<Record<SelectorField, FieldSelectors>> = {
  name: {
    // Amazon also renders a hidden <input id="productTitle">.
    primary: { selector: 'span#productTitle', attribute: 'textContent' },
  },
  price: {
    // Accordion layout (new + used offers) first, then the single-offer layout.
    primary: {
      selector: '#newAccordionRow_0 #corePrice_feature_div .a-price .a-offscreen',
      attribute: 'textContent',
    },
    fallbacks: [
      {
        selector: '#qualifiedBuybox #corePrice_feature_div .a-price .a-offscreen',
        attribute: 'textContent',
      },
    ],
  },
  availability: {
    primary: {
      selector: '#desktop_qualifiedBuyBox #availability .primary-availability-message',
      attribute: 'textContent',
    },
  },
  seller: {
    // The merchant that sells the offer, not #fulfillerInfoFeature_feature_div.
    primary: {
      selector:
        '#desktop_qualifiedBuyBox #merchantInfoFeature_feature_div .offer-display-feature-text-message',
      attribute: 'textContent',
    },
  },
  canonicalUrl: {
    primary: { selector: 'link[rel="canonical"]', attribute: 'href' },
  },
};

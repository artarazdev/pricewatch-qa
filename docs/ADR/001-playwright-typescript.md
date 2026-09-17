# ADR-001: Playwright + TypeScript as the Primary Stack

## Context

PriceWatch QA needs browser automation capable of extracting product data from JavaScript-heavy ecommerce pages, plus a testing story that demonstrates QA Automation engineering as a portfolio artifact — not just working scraper code.

## Decision

Use Node.js + TypeScript with Playwright and Playwright Test as the primary automation and testing stack.

## Alternatives Considered

- **Puppeteer** — mature and Chromium-focused, but weaker built-in test runner story and multi-browser support compared to Playwright Test.
- **Selenium/WebDriver** — broad language/browser support, but heavier setup and slower iteration for a TypeScript-first portfolio project; auto-waiting is less robust than Playwright's.
- **Plain HTTP scraping (cheerio/axios)** — insufficient alone: many product pages render critical data client-side, and a portfolio meant to showcase Playwright needs real browser automation as a first-class capability, not an afterthought.

## Consequences

- Playwright Test doubles as the E2E test runner and the browser-automation engine, keeping the toolchain small.
- Strong TypeScript typing is enforced project-wide; `any` requires justification.
- Future performance work (docs/ARCHITECTURE.md §Performance Principle) may introduce HTTP-based extraction for sources that don't need a full browser — this does not replace Playwright, it complements it.

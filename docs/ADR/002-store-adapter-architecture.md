# ADR-002: Store Adapter Architecture

## Context

Amazon Spain is the first crawl target, but the project's engineering value is in demonstrating a maintainable, extensible architecture — not in an Amazon-specific scraper. V0.5 explicitly plans a second store adapter to prove reusability.

## Decision

Isolate all store-specific logic (browser interaction, selectors, parsing, config) behind a common `StoreCrawler` contract. The core domain (`Product`, validation, persistence, price intelligence) depends only on that contract and the normalized `Product` model — never on any store's DOM structure, selectors, or store-specific identifiers.

Each store adapter lives under `src/stores/<store>/` and is internally split into crawler, parser, selectors, and configuration, so store-specific code stays centralized instead of scattered across the repository.

## Alternatives Considered

- **Amazon-only, no abstraction** — faster for V0.1, but would require a rewrite at V0.5 and wouldn't demonstrate the modularity this project is meant to showcase.
- **Generic "scraper config" (selectors-as-data) instead of code adapters** — appealing for very uniform sites, but ecommerce sites differ enough in navigation/pagination/anti-bot behavior that a config-only approach would leak store-specific logic into the interpreter, defeating the isolation goal.
- **Plugin/DI framework for store registration** — rejected as premature complexity for a project with one (soon two) store adapters; a simple contract + explicit selection is enough.

## Consequences

- Adding a store should require zero or minimal changes to core domain/validation/persistence code — this is the concrete test applied at V0.5.
- Selector fallback strategy (Primary → Fallback → explicit failure) lives inside each adapter, not in the core.
- Slightly more upfront structure in V0.1 (contract + one adapter) than a quick single-file scraper would need — accepted as the cost of the architecture the project exists to demonstrate.

import { existsSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { stdin, stdout } from 'node:process';
import { createInterface } from 'node:readline/promises';
import { chromium } from '@playwright/test';
import { amazonConfig } from '../src/stores/amazon/config.ts';
import { sanitizeHtml } from './sanitize-html.ts';

// Manual capture of a rendered Amazon ES product page as sanitized local evidence.
// Usage: node scripts/capture-amazon-fixture.ts <product-url> <scenario-name>
// The operator solves any CAPTCHA by hand; this script never bypasses it.
// Captures are git-ignored third-party content; committed test fixtures are synthetic.

const FIXTURES_DIR = 'captures/amazon';
// Amazon also renders a hidden <input id="productTitle">; target the visible span only.
const PRODUCT_READY_SELECTOR = 'span#productTitle';
const MANUAL_WAIT_MS = 5 * 60_000;
const SCENARIO_NAME = /^[a-z0-9]+(-[a-z0-9]+)*$/;

function parseArgs(argv: string[]): { url: URL; scenario: string } {
  const [rawUrl, scenario] = argv;
  if (!rawUrl || !scenario) {
    throw new Error('Usage: node scripts/capture-amazon-fixture.ts <product-url> <scenario-name>');
  }

  const url = new URL(rawUrl);
  if (url.origin !== amazonConfig.baseUrl) {
    throw new Error(`URL origin must be ${amazonConfig.baseUrl}, got ${url.origin}`);
  }
  if (!SCENARIO_NAME.test(scenario)) {
    throw new Error(`Scenario name must be kebab-case, got "${scenario}"`);
  }

  return { url, scenario };
}

async function main(): Promise<void> {
  const { url, scenario } = parseArgs(process.argv.slice(2));
  const htmlPath = `${FIXTURES_DIR}/${scenario}.html`;
  const metaPath = `${FIXTURES_DIR}/${scenario}.meta.json`;

  if (existsSync(htmlPath)) {
    throw new Error(`Fixture already exists: ${htmlPath}. Delete it first to recapture.`);
  }

  const browser = await chromium.launch({ headless: false });
  try {
    const context = await browser.newContext({
      locale: 'es-ES',
      timezoneId: 'Europe/Madrid',
    });
    const page = await context.newPage();

    await page.goto(url.href, {
      waitUntil: 'domcontentloaded',
      timeout: amazonConfig.timeoutMs,
    });

    console.log('Waiting for the product page. Solve any CAPTCHA or cookie banner in the browser.');
    await page.locator(PRODUCT_READY_SELECTOR).waitFor({ timeout: MANUAL_WAIT_MS });

    const prompt = createInterface({ input: stdin, output: stdout });
    await prompt.question(
      'Product page ready. Adjust the page if needed, then press Enter to capture.',
    );
    prompt.close();

    if ((await page.locator(PRODUCT_READY_SELECTOR).count()) === 0) {
      throw new Error('Product title is gone; the page is not a product page anymore.');
    }

    const html = await sanitizeHtml(browser, await page.content());
    const meta = {
      scenario,
      requestedUrl: url.href,
      finalUrl: page.url(),
      capturedAt: new Date().toISOString(),
      locale: 'es-ES',
      userAgent: await page.evaluate(() => navigator.userAgent),
    };

    await mkdir(FIXTURES_DIR, { recursive: true });
    await writeFile(htmlPath, html, 'utf8');
    await writeFile(metaPath, `${JSON.stringify(meta, null, 2)}\n`, 'utf8');
    console.log(`Saved ${htmlPath} and ${metaPath}`);
  } finally {
    await browser.close();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

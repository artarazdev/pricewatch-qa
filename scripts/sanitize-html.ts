import type { Browser } from '@playwright/test';

// Strips executable, styling, and session data from a captured page while keeping
// the DOM structure that selectors depend on. Runs with JavaScript and network disabled.
export async function sanitizeHtml(browser: Browser, html: string): Promise<string> {
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    await context.route('**/*', (route) => route.abort());
    const page = await context.newPage();
    await page.setContent(html, { waitUntil: 'domcontentloaded' });

    await page.evaluate(() => {
      const removable = 'script, style, noscript, iframe, link:not([rel="canonical"])';
      for (const node of document.querySelectorAll(removable)) node.remove();

      const sensitiveName = /session|csrf|token/i;
      // JSON stored in data-* attributes, e.g. {"sessionId":"522-..."} or {"slateToken":"..."}.
      const sensitiveJsonValue = /("[^"]*(?:session|csrf|token)[^"]*"\s*:\s*)"[^"]*"/gi;
      const sessionIdPattern = /\b\d{3}-\d{7}-\d{7}\b/g;
      for (const element of document.querySelectorAll('*')) {
        for (const { name, value } of [...element.attributes]) {
          if (sensitiveName.test(name)) {
            element.removeAttribute(name);
            continue;
          }
          const scrubbed = value
            .replace(sensitiveJsonValue, '$1""')
            .replace(sessionIdPattern, '000-0000000-0000000');
          if (scrubbed !== value) element.setAttribute(name, scrubbed);
        }
        const fieldName = element.getAttribute('name') ?? element.id;
        if (element.tagName === 'INPUT' && sensitiveName.test(fieldName)) {
          element.removeAttribute('value');
        }
      }
    });

    return await page.content();
  } finally {
    await context.close();
  }
}

/**
 * Font Checker Utility
 * Developer: Rakula (ID: 3222)
 * Created: June 2025
 */

const { chromium } = require('playwright');

const COMPONENTS = [
  { name: 'Header', tags: ['h1', 'h2', 'h3'], expected: 'lato-bold' },
  { name: 'Subheader', tags: ['h4', 'h5', 'h6'], expected: 'Inter' },
  { name: 'Body Text', tags: ['.body-text', 'p'], expected: 'Inter' },
  { name: 'Disclaimer Text', tags: ['.disclaimer', 'small'], expected: 'Inter' },
];

async function extractFontsFromPage(page) {
  const results = [];
  for (const comp of COMPONENTS) {
    for (const tag of comp.tags) {
      try {
        const elements = await page.$$(tag);
        for (const el of elements) {
          try {
            // Get text content with error handling
            let text = '';
            try {
              text = await el.innerText();
            } catch (textError) {
              text = await page.evaluate(e => e.textContent?.trim() || '', el);
            }
            
            // Get computed font family
            const fontFamily = await page.evaluate(e => getComputedStyle(e).fontFamily, el);
            
            // Get the selector with error handling
            let selector = '';
            try {
              selector = await page.evaluate(e => {
                if (e.className) return `${e.tagName.toLowerCase()}.${e.className.split(' ').join('.')}`;
                return e.tagName.toLowerCase();
              }, el);
            } catch (selectorError) {
              selector = tag;
            }
              results.push({
              component: comp.name,
              tag: tag,
              selector,
              text: text.substring(0, 100) + (text.length > 100 ? '...' : ''), // Truncate long text but keep more content
              expected: comp.expected,
              actual: fontFamily,
              status: fontFamily.includes(comp.expected) ? '✅ Passed' : '❌ Failed',
            });
          } catch (elementError) {
            console.error(`Error processing element ${tag}:`, elementError);
          }
        }
      } catch (tagError) {
        console.error(`Error finding elements with tag ${tag}:`, tagError);
      }
    }
  }
  return results;
}

module.exports = { extractFontsFromPage, COMPONENTS };

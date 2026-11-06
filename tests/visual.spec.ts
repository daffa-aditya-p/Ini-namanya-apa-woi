import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import * as fs from 'node:fs';
import * as path from 'node:path';

const pagesToTest = [
  { name: 'home', path: '/' },
  { name: 'javascript-j1', path: '/curriculum/javascript/j1' },
  { name: 'python-p1', path: '/curriculum/python/p1' },
];

test.describe('3-Breakpoint Visual Screenshots & Axe Accessibility Audit', () => {
  for (const pageInfo of pagesToTest) {
    test(`captures screenshot & checks a11y for ${pageInfo.name}`, async ({
      page,
    }, testInfo) => {
      const projectName = testInfo.project.name;
      const screenshotDir = path.resolve(process.cwd(), 'screenshots', projectName);
      if (!fs.existsSync(screenshotDir)) {
        fs.mkdirSync(screenshotDir, { recursive: true });
      }

      await page.goto(pageInfo.path, { waitUntil: 'networkidle' });

      // Verify essential page landmarks
      await expect(page.locator('header nav')).toBeVisible();
      await expect(page.locator('main')).toBeVisible();

      // Take full page screenshot across breakpoint
      const screenshotPath = path.join(screenshotDir, `${pageInfo.name}.png`);
      await page.screenshot({
        path: screenshotPath,
        fullPage: true,
      });

      console.log(`Saved screenshot: ${screenshotPath}`);

      // Run axe accessibility analysis
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
        .analyze();

      // Exclude minor third-party editor false-positives if any, but ensure critical is zero
      const criticalViolations = accessibilityScanResults.violations.filter(
        (v) => v.impact === 'critical' || v.impact === 'serious'
      );

      expect(criticalViolations).toEqual([]);
    });
  }
});

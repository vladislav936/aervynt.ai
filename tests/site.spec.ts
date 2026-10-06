import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { categories, pages } from '../src/lib/content';
test('all public routes render and fit the viewport', async ({ page }) => { const errors: string[] = []; page.on('pageerror', e => errors.push(e.message)); for (const route of ['/', ...Object.keys(pages).map(s => `/${s}`), ...categories.map(c => `/robotics/${c.slug}`), '/contact', '/privacy']) {
    const response = await page.goto(route);
    expect(response?.status(), route).toBe(200);
    await expect(page.locator('h1')).toHaveCount(1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), route).toBe(true);
} expect(errors).toEqual([]); });
test('navigation, mobile menu and accessibility', async ({ page }, testInfo) => { await page.goto('/'); if (testInfo.project.name === 'mobile') {
    await page.getByRole('button', { name: 'Menu' }).click();
    await expect(page.getByRole('button', { name: 'Close' })).toHaveAttribute('aria-expanded', 'true');
} await page.getByRole('navigation').getByRole('link', { name: 'Robotics', exact: true }).click(); await expect(page).toHaveURL(/\/robotics$/); expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]); await page.goto('/contact?intent=audit&model=RaaS&category=quadruped-robots'); await expect(page.locator('select[name=intent]')).toHaveValue('audit'); await expect(page.locator('select[name=model]')).toHaveValue('RaaS'); await expect(page.locator('select[name=category]')).toHaveValue('quadruped-robots'); expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]); });
test('enquiries fail honestly when delivery is unconfigured', async ({ page }) => { await page.goto('/contact?intent=audit'); await page.getByLabel('Your name').fill('Test Operator'); await page.getByLabel('Work email').fill('test@example.com'); await page.getByLabel('Company', { exact: true }).fill('Test Organization'); await page.getByLabel('Country / region').fill('United Arab Emirates'); await page.getByLabel('Tell us about your project').fill('Inspect a facility with defined routes and human supervision.'); await page.getByRole('checkbox').check(); await page.getByRole('button', { name: 'Send enquiry' }).click(); await expect(page.getByRole('status')).toContainText('Online enquiries are not available yet'); });
test('lead endpoint rejects invalid requests', async ({ request }) => { const crossOrigin = await request.post('/api/leads', { headers: { Origin: 'https://untrusted.example' }, data: {} }); expect(crossOrigin.status()).toBe(403); const invalid = await request.post('/api/leads', { headers: { Origin: 'http://localhost:3000' }, data: { name: 'Only a name' } }); expect(invalid.status()).toBe(400); const oversized = await request.post('/api/leads', { headers: { Origin: 'http://localhost:3000' }, data: { message: 'x'.repeat(17000) } }); expect(oversized.status()).toBe(413); });

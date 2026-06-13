import { test, expect } from '@playwright/test';

// Verify environment variables and fail with a clear message if any are missing
const requiredEnvVars = [
  'VERCEL_APP_URL',
  'WAO_TEST_LUCA_EMAIL',
  'WAO_TEST_LUCA_PASSWORD',
  'WAO_TEST_SARA_EMAIL',
  'WAO_TEST_SARA_PASSWORD',
  'WAO_TEST_ADMIN_EMAIL',
  'WAO_TEST_ADMIN_PASSWORD'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`TEST CONFIG ERROR: Missing required environment variable ${envVar}`);
  }
}

const BASE_URL = process.env.VERCEL_APP_URL;
const LUCA_EMAIL = process.env.WAO_TEST_LUCA_EMAIL;
const LUCA_PASSWORD = process.env.WAO_TEST_LUCA_PASSWORD;
const SARA_EMAIL = process.env.WAO_TEST_SARA_EMAIL;
const SARA_PASSWORD = process.env.WAO_TEST_SARA_PASSWORD;
const ADMIN_EMAIL = process.env.WAO_TEST_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.WAO_TEST_ADMIN_PASSWORD;

// Helper to dismiss onboarding modal if it appears
async function dismissOnboarding(page) {
  const dismissButton = page.getByRole('button', { name: 'Ho capito' });
  if (await dismissButton.isVisible()) {
    await dismissButton.click();
  }
}

// Helper to reset the frontend session completely and go fresh to URL
async function resetSession(page, appUrl) {
  await page.goto(appUrl, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.context().clearCookies();
  await page.goto(appUrl, { waitUntil: 'domcontentloaded' });
  await dismissOnboarding(page);
}

// Helper to login dynamically and verify successful login view
async function login(page, email, password) {
  // Navigate to Profilo tab
  await page.locator('.bottom-nav-bar').getByText('Profilo').click();
  
  // Fill credentials
  await page.locator('#auth-email').fill(email);
  await page.locator('#auth-password').fill(password);
  
  // Submit Accedi
  await page.getByRole('button', { name: 'Accedi' }).click();
  
  // Wait until either the Profile Details view or the Disconnect button is visible
  await expect(page.getByRole('button', { name: 'Disconnetti' })).toBeVisible({ timeout: 15000 });
}

test.describe('Vercel Real App - User and Session Isolation Smoke Test', () => {

  test('Luca, Sara, and Admin have isolated read-only profiles and access', async ({ page }) => {
    // -------------------------------------------------------------
    // 1. LUCA VERIFICATION
    // -------------------------------------------------------------
    await resetSession(page, BASE_URL);
    await login(page, LUCA_EMAIL, LUCA_PASSWORD);

    // Verify Luca identity/profile context is visible
    const profileHeaderLuca = page.locator('.profile-panel-content h2');
    await expect(profileHeaderLuca).toBeVisible({ timeout: 10000 });
    const textContentLuca = await profileHeaderLuca.textContent();
    expect(textContentLuca.toLowerCase()).toContain('luca');

    // Verify Sara identity is not the active user
    expect(textContentLuca.toLowerCase()).not.toContain('sara');
    const profileContentLuca = await page.locator('.profile-panel-content').textContent();
    expect(profileContentLuca.toLowerCase()).not.toContain('sara');

    // -------------------------------------------------------------
    // 2. SARA VERIFICATION
    // -------------------------------------------------------------
    await resetSession(page, BASE_URL);
    await login(page, SARA_EMAIL, SARA_PASSWORD);

    // Verify Sara identity/profile context is visible
    const profileHeaderSara = page.locator('.profile-panel-content h2');
    await expect(profileHeaderSara).toBeVisible({ timeout: 10000 });
    const textContentSara = await profileHeaderSara.textContent();
    expect(textContentSara.toLowerCase()).toContain('sara');

    // Verify Luca identity is not the active user
    expect(textContentSara.toLowerCase()).not.toContain('luca');
    const profileContentSara = await page.locator('.profile-panel-content').textContent();
    expect(profileContentSara.toLowerCase()).not.toContain('luca');

    // -------------------------------------------------------------
    // 3. ADMIN VERIFICATION & CONTROL ROOM
    // -------------------------------------------------------------
    await resetSession(page, BASE_URL);
    await login(page, ADMIN_EMAIL, ADMIN_PASSWORD);

    // Open Control Room
    const controlRoomBtn = page.getByRole('button', { name: /Control Room/ });
    if (await controlRoomBtn.isVisible()) {
      await controlRoomBtn.click();
    } else {
      await page.locator('.bottom-nav-bar').getByText('Messaggi').click();
      await expect(page.getByRole('button', { name: /Control Room/ })).toBeVisible({ timeout: 10000 });
      await page.getByRole('button', { name: /Control Room/ }).click();
    }

    // Verify Control Room is visible (Do not perform any cleanup)
    await expect(page.getByRole('heading', { name: 'Control Room' })).toBeVisible({ timeout: 10000 });
  });

});

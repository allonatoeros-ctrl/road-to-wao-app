import { test, expect } from '@playwright/test';

// Verify environment variables and fail with a clear message if any are missing
const requiredEnvVars = [
  'SARA_EMAIL',
  'SARA_PASSWORD',
  'ADMIN_EMAIL',
  'ADMIN_PASSWORD'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`TEST CONFIG ERROR: Missing required environment variable ${envVar}`);
  }
}

const BASE_URL = process.env.VERCEL_APP_URL || 'https://road-to-wao-app.vercel.app';
const SARA_EMAIL = process.env.SARA_EMAIL;
const SARA_PASSWORD = process.env.SARA_PASSWORD;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

// Helper to confirm age checkbox
async function confirmAge(page) {
  const checkbox = page.locator('input[name="isOfAge"]');
  await checkbox.scrollIntoViewIfNeeded();
  const label = page.locator('label.checkbox-container', { has: checkbox });
  await label.click();
}

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

test.describe('Vercel Real App - General Request Lifecycle Smoke Test', () => {

  test('Sara creates general request -> Sara sees it -> Admin sees it', async ({ page }) => {
    const generalLabel = `TEST VERCEL GENERAL LIFECYCLE ${Date.now()}`;

    // -------------------------------------------------------------
    // 1. SARA: Create a General Request
    // -------------------------------------------------------------
    await resetSession(page, BASE_URL);
    await login(page, SARA_EMAIL, SARA_PASSWORD);

    // Go to Bacheca
    await page.locator('.bottom-nav-bar').getByText('Bacheca').click();
    await expect(page.getByRole('heading', { name: 'Bacheca Viaggi' })).toBeVisible();

    // Click "Lascia richiesta generale"
    await page.getByRole('button', { name: 'Lascia richiesta generale' }).click();

    // Fill the General Request form
    const generalNickname = page.locator('#nickname');
    if (await generalNickname.isVisible() && await generalNickname.isEditable()) {
      await generalNickname.fill('Sara Raver Demo');
    }
    await page.locator('#departureCity').fill('Milano');
    await page.locator('#tripType').selectOption('andata e ritorno');
    await page.locator('#travelTime').selectOption('flessibile');
    await page.locator('#nearbyFlexible').selectOption('sì');
    await page.locator('#passengers').selectOption('1');
    await page.locator('#luggageNeed').selectOption('medio');
    await page.locator('#departureDate').fill('2026-08-14');
    await page.locator('#returnDate').fill('2026-08-18');
    await page.locator('#message').fill(generalLabel);

    await confirmAge(page);

    // Submit
    await page.getByRole('button', { name: 'Invia richiesta' }).click();
    await expect(page.getByRole('heading', { name: 'Richiesta inviata' })).toBeVisible();

    // Go to messages
    await page.getByRole('button', { name: 'Vai ai messaggi' }).click();
    await expect(page.getByRole('heading', { name: 'Messaggi' })).toBeVisible();

    // Verify Sara sees her general request
    const saraReqCard = page.locator('.ride-card', { hasText: 'Richiesta generale per Milano' }).first();
    await expect(saraReqCard).toBeVisible({ timeout: 15000 });
    await saraReqCard.getByRole('button', { name: /Apri dettagli/ }).click();
    await expect(saraReqCard).toContainText('Richiesta generale per Milano');
    await expect(saraReqCard).toContainText('Città: Milano');
    await expect(saraReqCard).toContainText('Bagaglio: medio');
    await expect(saraReqCard).toContainText('Persone: 1');

    // -------------------------------------------------------------
    // 2. ADMIN: Verify sees the TEST VERCEL General Request
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

    await expect(page.getByRole('heading', { name: 'Control Room' })).toBeVisible({ timeout: 15000 });

    // Enable "Mostra dati di test" check
    const showTestToggle = page.locator('input[type="checkbox"]');
    if (!(await showTestToggle.isChecked())) {
      await page.getByText('Mostra dati di test').click();
    }

    // Verify Admin sees the general request label
    await expect(page.locator('.cr-root')).toContainText(generalLabel);
  });

});

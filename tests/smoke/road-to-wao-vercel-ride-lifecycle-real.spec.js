import { test, expect } from '@playwright/test';

// Verify environment variables and fail with a clear message if any are missing
const requiredEnvVars = [
  'LUCA_EMAIL',
  'LUCA_PASSWORD',
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
const LUCA_EMAIL = process.env.LUCA_EMAIL;
const LUCA_PASSWORD = process.env.LUCA_PASSWORD;
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

test.describe('Vercel Real App - Ride Lifecycle Smoke Test', () => {

  test('Luca creates ride -> Sara asks to join -> Luca sees Sara request -> Admin sees it', async ({ page }) => {
    const rideLabel = `TEST VERCEL RIDE LIFECYCLE ${Date.now()}`;
    const joinLabel = 'TEST VERCEL JOIN LIFECYCLE';

    // -------------------------------------------------------------
    // 1. LUCA: Create a ride offer
    // -------------------------------------------------------------
    await resetSession(page, BASE_URL);
    await login(page, LUCA_EMAIL, LUCA_PASSWORD);

    // Go to Bacheca
    await page.locator('.bottom-nav-bar').getByText('Bacheca').click();
    await expect(page.getByRole('heading', { name: 'Bacheca Viaggi' })).toBeVisible();

    // Start offering a ride
    await page.getByRole('button', { name: 'Offri un passaggio' }).click();

    // Fill details
    const offerNickname = page.locator('#offer-nickname');
    if (await offerNickname.isVisible() && await offerNickname.isEditable()) {
      await offerNickname.fill('Luca Driver Demo');
    }

    await page.locator('#offer-departureCity').fill('Milano');
    await page.locator('#offer-departureDate').fill('14 Agosto');
    await page.locator('#offer-tripType').selectOption('solo andata');
    await page.locator('#offer-travelTime').selectOption('mattina');
    await page.locator('#offer-spots').selectOption('2 posti liberi');
    await page.locator('#offer-message').fill(rideLabel);

    await confirmAge(page);

    // Publish
    await page.getByRole('button', { name: 'Pubblica Offerta' }).click();
    await expect(page.getByRole('heading', { name: 'Offerta inviata' })).toBeVisible();

    // Go back to bacheca
    await page.getByRole('button', { name: 'Torna alla bacheca' }).click();
    await expect(page.getByRole('heading', { name: 'Bacheca Viaggi' })).toBeVisible();

    // Verify Luca sees the ride on the board
    const lucaRideCard = page.locator('.ride-card')
      .filter({ hasText: 'Milano' })
      .first();
    await expect(lucaRideCard).toBeVisible({ timeout: 15000 });

    // -------------------------------------------------------------
    // 2. SARA: Find the ride and ask to join
    // -------------------------------------------------------------
    await resetSession(page, BASE_URL);
    await login(page, SARA_EMAIL, SARA_PASSWORD);

    // Go to Bacheca
    await page.locator('.bottom-nav-bar').getByText('Bacheca').click();
    await expect(page.getByRole('heading', { name: 'Bacheca Viaggi' })).toBeVisible();

    // Locate Luca's ride
    const targetRideCard = page.locator('.ride-card')
      .filter({ hasText: 'Milano' })
      .first();
    await expect(targetRideCard).toBeVisible({ timeout: 15000 });

    // Click "Chiedi di unirti"
    await targetRideCard.scrollIntoViewIfNeeded();
    await targetRideCard.getByRole('button', { name: 'Chiedi di unirti' }).click();

    // Fill request modal
    const joinNickname = page.locator('#nickname');
    if (await joinNickname.isVisible() && await joinNickname.isEditable()) {
      await joinNickname.fill('Sara Raver Demo');
    }
    await page.locator('#departureCity').fill('Milano');
    await page.locator('#tripType').selectOption('solo andata');
    await page.locator('#travelTime').selectOption('flessibile');
    await page.locator('#nearbyFlexible').selectOption('sì');
    await page.locator('#passengers').selectOption('1');
    await page.locator('#luggageNeed').selectOption('leggero');
    await page.locator('#message').fill(joinLabel);

    await confirmAge(page);

    // Submit
    await page.getByRole('button', { name: 'Invia richiesta' }).click();
    await expect(page.getByRole('heading', { name: 'Richiesta inviata' })).toBeVisible();

    // Navigate to messages
    await page.getByRole('button', { name: 'Vai ai messaggi' }).click();
    await expect(page.getByRole('heading', { name: 'Messaggi' })).toBeVisible();

    // Verify Sara sees pending request with the label
    const saraReqCard = page.locator('.ride-card', { hasText: 'Richiesta per Milano' }).first();
    await expect(saraReqCard).toBeVisible({ timeout: 15000 });
    await saraReqCard.getByRole('button', { name: /Apri dettagli/ }).click();
    await expect(saraReqCard).toContainText(joinLabel);

    // -------------------------------------------------------------
    // 3. LUCA: Verify sees Sara's request
    // -------------------------------------------------------------
    await resetSession(page, BASE_URL);
    await login(page, LUCA_EMAIL, LUCA_PASSWORD);

    // Go to Messaggi
    await page.locator('.bottom-nav-bar').getByText('Messaggi').click();
    await expect(page.getByRole('heading', { name: 'Messaggi' })).toBeVisible();

    // Verify Luca sees request from Sara
    const lucaReqCard = page.locator('.ride-card', { hasText: 'Richiesta per Milano' }).first();
    await expect(lucaReqCard).toBeVisible({ timeout: 15000 });
    await lucaReqCard.getByRole('button', { name: /Apri dettagli/ }).click();
    await expect(lucaReqCard).toContainText(joinLabel);

    // -------------------------------------------------------------
    // 4. ADMIN: Verify sees the TEST VERCEL ride & request
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

    // Expand all test ride cards to ensure visibility of pending joins
    const testRideHeaders = page.locator('.cr-ride-header', { has: page.locator('.cr-test-badge') });
    const testRideCount = await testRideHeaders.count();
    for (let i = 0; i < testRideCount; i++) {
      await testRideHeaders.nth(i).click();
    }

    // Verify Admin sees the ride details and the join request label
    await expect(page.locator('.cr-root')).toContainText('Milano → WAO Festival');
    await expect(page.locator('.cr-root')).toContainText('Luca Supabase');
    await expect(page.locator('.cr-root')).toContainText(joinLabel);
  });

});

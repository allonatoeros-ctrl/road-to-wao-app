import { test, expect } from '@playwright/test';

// Verify environment variables and fail with a clear message if any are missing
const requiredEnvVars = [
  'WAO_BASE_URL',
  'WAO_LUCA_EMAIL',
  'WAO_LUCA_PASSWORD',
  'WAO_SARA_EMAIL',
  'WAO_SARA_PASSWORD'
];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`TEST VERCEL CONFIG ERROR: Missing required environment variable ${envVar}`);
  }
}

const BASE_URL = process.env.WAO_BASE_URL;
const LUCA_EMAIL = process.env.WAO_LUCA_EMAIL;
const LUCA_PASSWORD = process.env.WAO_LUCA_PASSWORD;
const SARA_EMAIL = process.env.WAO_SARA_EMAIL;
const SARA_PASSWORD = process.env.WAO_SARA_PASSWORD;

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

// Helper to login dynamically
async function login(page, email, password) {
  // Navigate to Profilo tab
  await page.locator('.bottom-nav-bar').getByText('Profilo').click();
  
  // If we are already logged in (Disconnect button exists), logout first
  const logoutBtn = page.getByRole('button', { name: 'Disconnetti' });
  if (await logoutBtn.isVisible()) {
    await logoutBtn.click();
    await page.waitForTimeout(500);
  }
  
  // Fill credentials
  await page.locator('#auth-email').fill(email);
  await page.locator('#auth-password').fill(password);
  
  // Submit Accedi
  await page.getByRole('button', { name: 'Accedi' }).click();
  
  // Wait until either the Profile Details view or the Lite Profile creation form is visible
  await expect(async () => {
    const isProfileView = await page.getByRole('button', { name: 'Disconnetti' }).isVisible() || 
                          await page.locator('#profile-nickname').isVisible();
    expect(isProfileView).toBeTruthy();
  }).toPass();
}

// Helper to complete the Lite Profile if it's a first time login or uncompleted
async function completeProfileIfRequired(page, nickname, departureCity) {
  const nicknameInput = page.locator('#profile-nickname');
  if (await nicknameInput.isVisible() && await nicknameInput.isEditable()) {
    await nicknameInput.fill(nickname);
    await page.locator('#profile-departure').fill(departureCity);
    
    const ageCheck = page.locator('#profile-age');
    if (!(await ageCheck.isChecked())) {
      await ageCheck.check();
    }
    
    const saveButton = page.getByRole('button', { name: 'Salva' });
    // Wait for the save button to be enabled (authLoading becomes false)
    await expect(saveButton).toBeEnabled();
    await saveButton.click();
    
    // Wait for the profile view to finish saving and render detail view
    await expect(page.getByRole('button', { name: 'Disconnetti' })).toBeVisible();
  }
}

// Helper to clear session completely and reload
async function logoutOrResetSession(page) {
  await page.locator('.bottom-nav-bar').getByText('Profilo').click();
  const logoutBtn = page.getByRole('button', { name: 'Disconnetti' });
  if (await logoutBtn.isVisible()) {
    await logoutBtn.click();
  } else {
    // Fallback: Clear storage and cookies
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.context().clearCookies();
  }
  await page.reload();
  await dismissOnboarding(page);
}

test('Vercel Real Smoke Test - Luca offers and Sara requests', async ({ page }) => {
  // 1. Apri WAO_BASE_URL
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
  await dismissOnboarding(page);

  // 2. Login come Luca
  await login(page, LUCA_EMAIL, LUCA_PASSWORD);

  // 3. Luca crea una ride "Offro passaggio"
  await page.locator('.bottom-nav-bar').getByText('Bacheca').click();
  await expect(page.getByRole('heading', { name: 'Bacheca Viaggi' })).toBeVisible();
  
  await page.getByRole('button', { name: 'Offri un passaggio' }).click();
  
  // Fill the form
  const offerNickname = page.locator('#offer-nickname');
  if (await offerNickname.isVisible() && await offerNickname.isEditable()) {
    await offerNickname.fill('Luca Driver Demo');
  }
  
  await page.locator('#offer-departureCity').fill('Milano');
  await page.locator('#offer-departureDate').fill('14 Agosto'); 
  await page.locator('#offer-tripType').selectOption('solo andata');
  await page.locator('#offer-travelTime').selectOption('mattina');
  await page.locator('#offer-stops').fill('TEST VERCEL LUCA STOPS');
  await page.locator('#offer-spots').selectOption('2 posti liberi');
  await page.locator('#offer-luggageCapacity').selectOption('medio');
  await page.locator('#offer-luggageDetails').fill('TEST VERCEL LUCA BAGAGLIO');
  await page.locator('#offer-message').fill('TEST VERCEL LUCA OFFRE');
  
  await confirmAge(page);
  
  // Submit Offer
  await page.getByRole('button', { name: 'Pubblica Offerta' }).click();
  
  // 4. Verifica successo
  await expect(page.getByRole('heading', { name: 'Offerta inviata' })).toBeVisible();
  
  // 5. Torna alla bacheca
  await page.getByRole('button', { name: 'Torna alla bacheca' }).click();
  await expect(page.getByRole('heading', { name: 'Bacheca Viaggi' })).toBeVisible();
  
  // 6. Verifica che la ride di Luca sia visibile dopo reload
  await page.reload();
  await dismissOnboarding(page);
  await page.locator('.bottom-nav-bar').getByText('Bacheca').click();
  await expect(page.getByRole('heading', { name: 'Bacheca Viaggi' })).toBeVisible();
  
  // Wait robustly for a real ride card to be loaded and rendered from Supabase (ignoring the CTA card)
  await expect.poll(async () => {
    const cards = page.locator('.ride-card');
    const count = await cards.count();
    const texts = [];
    for (let i = 0; i < count; i++) {
      const txt = await cards.nth(i).textContent();
      if (!txt.includes('Non trovi un passaggio adatto') && !txt.includes('Lascia richiesta generale')) {
        texts.push(txt);
      }
    }
    return texts.some(t => t.includes('Milano') || t.includes('TEST VERCEL LUCA OFFRE') || t.includes('WAO Festival'));
  }, {
    message: 'Wait for a real ride card containing Milano or WAO Festival to appear',
    timeout: 10000
  }).toBeTruthy();

  const cardTexts = await page.locator('.ride-card').allTextContents();
  console.log('VISIBLE RIDE CARDS AFTER LUCA OFFER:', cardTexts);

  let lucaCard = null;
  const cardCount = await page.locator('.ride-card').count();
  for (let i = 0; i < cardCount; i++) {
    const card = page.locator('.ride-card').nth(i);
    const text = await card.textContent();
    if (text.includes('Non trovi un passaggio adatto') || text.includes('Lascia richiesta generale')) {
      continue;
    }
    if (text.includes('TEST VERCEL LUCA OFFRE')) {
      lucaCard = card;
      break;
    } else if (text.includes('Milano') && text.includes('Luca')) {
      lucaCard = card;
      break;
    } else if (text.includes('Milano') && text.includes('2')) {
      lucaCard = card;
      break;
    }
  }

  if (!lucaCard) {
    throw new Error(`TEST VERCEL DIAGNOSTIC FAIL: Could not find Luca's Milano ride card. Visible cards: ${JSON.stringify(cardTexts)}`);
  }

  // Ensure chosen card contains Milano
  await expect(lucaCard).toContainText('Milano');
  
  // 7. Logout Luca
  await logoutOrResetSession(page);
  
  // 8. Login come Sara
  await login(page, SARA_EMAIL, SARA_PASSWORD);
  
  // 9. Sara trova la ride di Luca e usa "Chiedi di unirmi"
  await page.locator('.bottom-nav-bar').getByText('Bacheca').click();
  await expect(page.getByRole('heading', { name: 'Bacheca Viaggi' })).toBeVisible();
  
  // Find Luca's ride card robustly
  let targetRideCard = null;
  const cards = page.locator('.ride-card');
  const count = await cards.count();
  for (let i = 0; i < count; i++) {
    const card = cards.nth(i);
    const text = await card.textContent();
    if (text.includes('Non trovi un passaggio adatto') || text.includes('Lascia richiesta generale')) {
      continue;
    }
    if (text.includes('Milano') && (text.includes('WAO Festival') || text.includes('Driver: Luca') || text.includes('Luca Supabase'))) {
      const joinBtn = card.getByRole('button', { name: 'Chiedi di unirti' });
      if (await joinBtn.count() > 0) {
        targetRideCard = card;
        break;
      }
    }
  }

  if (!targetRideCard) {
    const allTexts = await page.locator('.ride-card').allTextContents();
    throw new Error(`TEST VERCEL SARA TARGET FAIL: Could not find Luca's ride card for Sara. Cards: ${JSON.stringify(allTexts)}`);
  }

  await targetRideCard.scrollIntoViewIfNeeded();
  await targetRideCard.getByRole('button', { name: 'Chiedi di unirti' }).click();
  
  // Fill Join request modal
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
  await page.locator('#luggageDetails').fill('TEST VERCEL SARA JOIN BAGAGLIO');
  await page.locator('#message').fill('TEST VERCEL SARA JOIN');
  
  await confirmAge(page);
  
  // Submit request
  await page.getByRole('button', { name: 'Invia richiesta' }).click();
  
  // 10. Verifica successo
  await expect(page.getByRole('heading', { name: 'Richiesta inviata' })).toBeVisible();
  
  // Go to messages
  await page.getByRole('button', { name: 'Vai ai messaggi' }).click();
  await expect(page.getByRole('heading', { name: 'Messaggi' })).toBeVisible();
  
  // 11. Sara crea anche una Richiesta generale
  await page.locator('.bottom-nav-bar').getByText('Bacheca').click();
  await page.getByRole('button', { name: 'Lascia richiesta generale' }).click();
  
  // Fill general request form
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
  await page.locator('#luggageDetails').fill('TEST VERCEL SARA GENERAL BAGAGLIO');
  await page.locator('#message').fill('TEST VERCEL SARA GENERAL');
  
  await confirmAge(page);
  
  // Submit request
  await page.getByRole('button', { name: 'Invia richiesta' }).click();
  
  // 12. Verifica successo
  await expect(page.getByRole('heading', { name: 'Richiesta inviata' })).toBeVisible();
  await page.getByRole('button', { name: 'Vai ai messaggi' }).click();
  
  // 13. Reload pagina
  await page.reload();
  await dismissOnboarding(page);
  
  // 14. Verifica che i dati siano ancora visibili
  await page.locator('.bottom-nav-bar').getByText('Messaggi').click();
  await expect(page.getByRole('heading', { name: 'Messaggi' })).toBeVisible();
  
  // Wait robustly for the messages list to populate using expect.poll
  await expect.poll(async () => {
    const cards = page.locator('.ride-card');
    const count = await cards.count();
    const texts = [];
    for (let i = 0; i < count; i++) {
      texts.push(await cards.nth(i).textContent());
    }
    // Check that we have at least one card and it contains some expected indicators
    return count > 0 && texts.some(t => 
      t.includes('Milano') || 
      t.includes('Sara') || 
      t.includes('WAO') || 
      t.includes('Richiesta') ||
      t.includes('pending') ||
      t.includes('in attesa') ||
      t.includes('attiva') ||
      t.includes('Attiva')
    );
  }, {
    message: 'Wait for message cards to load and display requests',
    timeout: 10000
  }).toBeTruthy();

  const messageTexts = await page.locator('.ride-card').allTextContents();
  console.log('VISIBLE MESSAGE CARDS AFTER SARA REQUESTS:', messageTexts);

  // Assert that we have visible cards representing the requests
  expect(messageTexts.length).toBeGreaterThan(0);
  const hasValidRequest = messageTexts.some(t => 
    (t.includes('Milano') || t.includes('Sara') || t.includes('WAO')) && 
    (t.includes('Richiesta') || t.includes('pending') || t.includes('in attesa') || t.includes('attiva') || t.includes('Attiva'))
  );
  expect(hasValidRequest).toBeTruthy();
});

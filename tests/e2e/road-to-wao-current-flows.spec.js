import { test, expect } from '@playwright/test';

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

// Helper to log in as test user
async function loginAsTestUser(page, nickname = 'PW_TEST_Driver', isAdmin = true) {
  // Go to Profilo tab
  await page.locator('.bottom-nav-bar').getByText('Profilo').click();
  
  // Fill auth credentials
  await page.locator('#auth-email').fill('pw_test_driver@roadtowao.local');
  await page.locator('#auth-password').fill('password123');
  
  // Submit Accedi
  await page.getByRole('button', { name: 'Accedi' }).click();
  
  // Verify successful login by checking the profile display
  await expect(page.getByRole('heading', { name: nickname, exact: true })).toBeVisible();
}

test.describe('Road to WAO - Mocked Diagnostic UI Suite', () => {
  // Shared mock database state
  let db = {
    rides: [
      {
        id: "7038e21a-e55b-433a-bc12-f046fdf4e4a1",
        driver_id: "e2c3a50f-155b-433a-bc12-f046fdf4e4e4",
        departure_city: "Roma",
        departure_area: "Tiburtina",
        to_event: "WAO Festival",
        departure_date: "2026-08-13",
        return_date: null,
        seats_total: 3,
        seats_available: 3,
        departure_time_label: "sera",
        vibe: "music-first",
        notes: "Offro passaggio da Roma",
        status: "open",
        visibility: "public",
        created_at: "2026-06-12T16:30:00Z"
      }
    ],
    joinRequests: [],
    generalRequests: [],
    deleteCallsCount: 0,
    patchCalls: []
  };

  test.beforeEach(async ({ page }) => {
    // Reset DB state for each test
    db.rides = [
      {
        id: "7038e21a-e55b-433a-bc12-f046fdf4e4a1",
        driver_id: "e2c3a50f-155b-433a-bc12-f046fdf4e4e4",
        departure_city: "Roma",
        departure_area: "Tiburtina",
        to_event: "WAO Festival",
        departure_date: "2026-08-13",
        return_date: null,
        seats_total: 3,
        seats_available: 3,
        departure_time_label: "sera",
        vibe: "music-first",
        notes: "Offro passaggio da Roma",
        status: "open",
        visibility: "public",
        created_at: "2026-06-12T16:30:00Z"
      }
    ];
    db.joinRequests = [];
    db.generalRequests = [];
    db.deleteCallsCount = 0;
    db.patchCalls = [];

    // Intercept Supabase auth user request
    await page.route('**/auth/v1/user', async (route) => {
      const authHeader = route.request().headers()['authorization'];
      if (authHeader && authHeader.includes('Bearer mock-access-token')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: "e2c3a50f-155b-433a-bc12-f046fdf4e4e4",
            email: "pw_test_driver@roadtowao.local",
            role: "authenticated",
            aud: "authenticated"
          })
        });
      } else {
        await route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'unauthorized' })
        });
      }
    });

    // Intercept Supabase auth sign-in request
    await page.route('**/auth/v1/token?grant_type=password', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          access_token: "mock-access-token",
          token_type: "bearer",
          expires_in: 3600,
          refresh_token: "mock-refresh-token",
          user: {
            id: "e2c3a50f-155b-433a-bc12-f046fdf4e4e4",
            email: "pw_test_driver@roadtowao.local"
          },
          session: {
            access_token: "mock-access-token",
            user: {
              id: "e2c3a50f-155b-433a-bc12-f046fdf4e4e4",
              email: "pw_test_driver@roadtowao.local"
            }
          }
        })
      });
    });

    // Intercept Supabase profile fetching & upserting
    await page.route('**/rest/v1/profiles**', async (route) => {
      const method = route.request().method();
      if (method === 'GET') {
        const url = route.request().url();
        if (url.includes('select=id%2Cnickname')) {
          // Profile Map response
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify([
              { id: "e2c3a50f-155b-433a-bc12-f046fdf4e4e4", nickname: "PW_TEST_Driver" },
              { id: "77777777-7777-7777-7777-777777777777", nickname: "PW_TEST_Passenger" }
            ])
          });
        } else {
          // Logged in user profile
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify([
              {
                id: "e2c3a50f-155b-433a-bc12-f046fdf4e4e4",
                nickname: "PW_TEST_Driver",
                departure_city: "Milano",
                role: "driver",
                is_of_age: true,
                is_admin: true,
                created_at: "2026-06-12T16:30:00Z",
                updated_at: "2026-06-12T16:30:00Z"
              }
            ])
          });
        }
      } else if (method === 'POST' || method === 'PUT') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: "e2c3a50f-155b-433a-bc12-f046fdf4e4e4",
            nickname: "PW_TEST_Driver",
            departure_city: "Milano",
            role: "driver",
            is_of_age: true,
            is_admin: true
          })
        });
      }
    });

    // Intercept profile secrets
    await page.route('**/rest/v1/profile_secrets**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: "e2c3a50f-155b-433a-bc12-f046fdf4e4e4",
            telegram_username: "@pw_test_driver",
            instagram_username: "pw_test_driver"
          }
        ])
      });
    });

    // Intercept GET and POST rides
    await page.route(/\/rest\/v1\/rides/, async (route) => {
      const method = route.request().method();
      if (method === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(db.rides)
        });
      } else if (method === 'POST') {
        const requestData = route.request().postDataJSON();
        const payload = Array.isArray(requestData) ? requestData[0] : requestData;
        const newRide = {
          id: "11111111-2222-3333-4444-555555555555",
          driver_id: "e2c3a50f-155b-433a-bc12-f046fdf4e4e4",
          departure_city: payload.departure_city,
          departure_area: payload.departure_area,
          to_event: payload.to_event || 'WAO Festival',
          departure_date: payload.departure_date,
          return_date: payload.return_date,
          seats_total: payload.seats_total,
          seats_available: payload.seats_available,
          departure_time_label: payload.departure_time_label,
          vibe: payload.vibe,
          notes: payload.notes,
          status: payload.status || 'open',
          visibility: payload.visibility || 'public',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        db.rides.unshift(newRide);
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify(newRide)
        });
      } else if (method === 'DELETE') {
        db.deleteCallsCount++;
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: '{}'
        });
      }
    });

    // Intercept GET, POST and PATCH join_requests
    await page.route(/\/rest\/v1\/join_requests/, async (route) => {
      const method = route.request().method();
      if (method === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(db.joinRequests)
        });
      } else if (method === 'POST') {
        const requestData = route.request().postDataJSON();
        const payload = Array.isArray(requestData) ? requestData[0] : requestData;
        const newJoin = {
          id: "33333333-3333-3333-3333-333333333333",
          ride_id: payload.ride_id,
          requester_id: payload.requester_id || "e2c3a50f-155b-433a-bc12-f046fdf4e4e4",
          seats_requested: payload.seats_requested,
          message: payload.message,
          status: payload.status || 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        db.joinRequests.unshift(newJoin);
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify(newJoin)
        });
      } else if (method === 'PATCH') {
        const payload = route.request().postDataJSON();
        db.patchCalls.push({ table: 'join_requests', payload, url: route.request().url() });
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ status: 'cancelled' })
        });
      } else if (method === 'DELETE') {
        db.deleteCallsCount++;
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: '{}'
        });
      }
    });

    // Intercept GET, POST and PATCH general_requests
    await page.route(/\/rest\/v1\/general_requests/, async (route) => {
      const method = route.request().method();
      if (method === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(db.generalRequests)
        });
      } else if (method === 'POST') {
        const requestData = route.request().postDataJSON();
        const payload = Array.isArray(requestData) ? requestData[0] : requestData;
        const newGen = {
          id: "55555555-5555-5555-5555-555555555555",
          requester_id: payload.requester_id || "e2c3a50f-155b-433a-bc12-f046fdf4e4e4",
          from_city: payload.from_city,
          from_area: payload.from_area,
          departure_date: payload.departure_date,
          return_date: payload.return_date,
          departure_time_label: payload.departure_time_label,
          people_count: payload.people_count,
          message: payload.message,
          status: payload.status || 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        db.generalRequests.unshift(newGen);
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify(newGen)
        });
      } else if (method === 'PATCH') {
        const payload = route.request().postDataJSON();
        db.patchCalls.push({ table: 'general_requests', payload, url: route.request().url() });
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ status: 'archived' })
        });
      } else if (method === 'DELETE') {
        db.deleteCallsCount++;
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: '{}'
        });
      }
    });
  });

  test('1. Offro passaggio flow: compilazione, invio e card visibile (Success)', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await dismissOnboarding(page);
    await loginAsTestUser(page);

    // Navigate to Bacheca
    await page.locator('.bottom-nav-bar').getByText('Bacheca').click();
    await expect(page.getByRole('heading', { name: 'Bacheca Viaggi' })).toBeVisible();

    // Click "Offri un passaggio"
    await page.getByRole('button', { name: 'Offri un passaggio' }).click();

    // Fill the form
    await page.locator('#offer-departureCity').fill('Milano');
    await page.locator('#offer-departureDate').fill('14 agosto');
    await page.locator('#offer-travelTime').selectOption('mattina');
    await page.locator('#offer-spots').selectOption('2 posti liberi');
    await page.locator('#offer-message').fill('PW_TEST_RIDE: Viaggio da Milano');
    await confirmAge(page);

    // Submit
    await page.getByRole('button', { name: 'Pubblica Offerta' }).click();

    // Success Modal
    await expect(page.getByRole('heading', { name: 'Offerta inviata' })).toBeVisible();
    await page.getByRole('button', { name: 'Torna alla bacheca' }).click();

    // Verify bacheca is visible first
    await expect(page.getByRole('heading', { name: 'Bacheca Viaggi' })).toBeVisible();

    // Verify card is visible in Bacheca using robust poll check
    await expect.poll(async () => {
      return await page.locator('.ride-card', { hasText: 'Milano' }).count();
    }).toBeGreaterThan(0);

    const rideCard = page.locator('.ride-card', { hasText: 'Milano' });
    await expect(rideCard).toBeVisible();
  });

  test('1b. Offro passaggio flow: no fake success on Supabase error', async ({ page }) => {
    let interceptedRidePostError = false;
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await dismissOnboarding(page);
    await loginAsTestUser(page);

    // Override rides insertion to return error
    await page.route(/\/rest\/v1\/rides/, async (route) => {
      if (route.request().method() === 'POST') {
        interceptedRidePostError = true;
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Database save failed.' })
        });
      } else {
        await route.fallback();
      }
    });

    // Navigate to Bacheca
    await page.locator('.bottom-nav-bar').getByText('Bacheca').click();
    
    // Attempt Offer
    await page.getByRole('button', { name: 'Offri un passaggio' }).click();
    await page.locator('#offer-departureCity').fill('Bari');
    await page.locator('#offer-departureDate').fill('14 agosto');
    await page.locator('#offer-travelTime').selectOption('mattina');
    await page.locator('#offer-spots').selectOption('2 posti liberi');
    await page.locator('#offer-message').fill('PW_TEST_FAIL: should not show');
    await confirmAge(page);

    await page.getByRole('button', { name: 'Pubblica Offerta' }).click();

    await expect.poll(() => interceptedRidePostError).toBeTruthy();

    // Verify success modal is NOT shown, instead error banner is visible
    await expect(page.getByRole('heading', { name: 'Offerta inviata' })).not.toBeVisible();
    await expect(page.locator('.auth-banner')).toBeVisible();
    await expect(page.locator('.auth-banner')).toContainText('Errore');
    await expect(page.locator('.auth-banner')).toContainText('Database save failed');

    // Close Modal and check that no card for Bari is in the Bacheca list
    await page.getByRole('button', { name: 'Annulla' }).click();
    await expect(page.locator('.ride-card', { hasText: 'Bari' })).not.toBeVisible();
  });

  test('2. Reload persistence flow: dopo refresh la ride deve restare visibile', async ({ page }) => {
    // Add Milano ride to list permanently so GET fetches it
    db.rides.push({
      id: "7038e21a-e55b-433a-bc12-f046fdf4e4a2",
      driver_id: "e2c3a50f-155b-433a-bc12-f046fdf4e4e4",
      departure_city: "Torino",
      departure_area: "Porta Nuova",
      to_event: "WAO Festival",
      departure_date: "2026-08-14",
      return_date: null,
      seats_total: 2,
      seats_available: 2,
      departure_time_label: "mattina",
      vibe: "music-first",
      notes: "PW_TEST_PERSISTENT: Torino",
      status: "open",
      visibility: "public",
      created_at: "2026-06-12T17:00:00Z"
    });

    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await dismissOnboarding(page);

    // Go to Bacheca
    await page.locator('.bottom-nav-bar').getByText('Bacheca').click();
    await expect(page.locator('.ride-card', { hasText: 'Torino' })).toBeVisible();

    // Refresh page
    await page.reload();
    await dismissOnboarding(page);

    // Verify it is still there
    await page.locator('.bottom-nav-bar').getByText('Bacheca').click();
    await expect(page.locator('.ride-card', { hasText: 'Torino' })).toBeVisible();
  });

  test('3. Chiedo di unirmi flow: invio richiesta su una ride esistente (Success)', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await dismissOnboarding(page);
    await loginAsTestUser(page);

    // Go to Bacheca
    await page.locator('.bottom-nav-bar').getByText('Bacheca').click();

    // Click "Chiedi di unirti" on Roma ride card
    const targetCard = page.locator('.ride-card', { hasText: 'Roma' });
    await targetCard.getByRole('button', { name: 'Chiedi di unirti' }).click();

    // Fill form
    await page.locator('#passengers').selectOption('1');
    await page.locator('#luggageNeed').selectOption('leggero');
    await page.locator('#message').fill('PW_TEST_JOIN: Vorrei unirmi!');
    await confirmAge(page);

    // Submit
    await page.getByRole('button', { name: 'Invia richiesta' }).click();

    // Success Modal
    await expect(page.getByRole('heading', { name: 'Richiesta inviata' })).toBeVisible();
    await page.getByRole('button', { name: 'Vai ai messaggi' }).click();

    // Check Messages panel
    await expect(page.getByRole('heading', { name: 'Messaggi' })).toBeVisible();
    const requestCard = page.locator('.ride-card', { hasText: 'Richiesta per Roma → WAO' });
    await expect(requestCard).toBeVisible();
    await expect(requestCard.getByText('Richiesta in approvazione')).toBeVisible();
  });

  test('3b. Chiedo di unirmi flow: no fake success on error', async ({ page }) => {
    let interceptedJoinRequestPostError = false;
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await dismissOnboarding(page);
    await loginAsTestUser(page);

    // Intercept join request to return error
    await page.route(/\/rest\/v1\/join_requests/, async (route) => {
      if (route.request().method() === 'POST') {
        interceptedJoinRequestPostError = true;
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Save join request failed.' })
        });
      } else {
        await route.fallback();
      }
    });

    // Go to Bacheca
    await page.locator('.bottom-nav-bar').getByText('Bacheca').click();

    // Click "Chiedi di unirti"
    const targetCard = page.locator('.ride-card', { hasText: 'Roma' });
    await targetCard.getByRole('button', { name: 'Chiedi di unirti' }).click();

    // Fill form and submit
    await page.locator('#passengers').selectOption('1');
    await page.locator('#message').fill('PW_TEST_JOIN_FAIL: fail message');
    await confirmAge(page);
    await page.getByRole('button', { name: 'Invia richiesta' }).click();

    await expect.poll(() => interceptedJoinRequestPostError).toBeTruthy();

    // Verify error banner is visible and success modal is not shown
    await expect(page.getByRole('heading', { name: 'Richiesta inviata' })).not.toBeVisible();
    await expect(page.locator('.auth-banner')).toBeVisible();
    await expect(page.locator('.auth-banner')).toContainText('Errore');
    await expect(page.locator('.auth-banner')).toContainText('Save join request failed');

    // Close modal and check no card in messages
    await page.getByRole('button', { name: 'Annulla' }).click();
    await page.locator('.bottom-nav-bar').getByText('Messaggi').click();
    await expect(page.locator('.ride-card', { hasText: 'Richiesta per Roma → WAO' })).not.toBeVisible();
  });

  test('4. Richiesta generale flow: compilazione, invio, card/stato visibile (Success)', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await dismissOnboarding(page);
    await loginAsTestUser(page);

    // Go to Bacheca
    await page.locator('.bottom-nav-bar').getByText('Bacheca').click();

    // Click "Lascia richiesta generale"
    await page.getByRole('button', { name: 'Lascia richiesta generale' }).click();

    // Fill form
    await page.locator('#departureCity').fill('Bologna');
    await page.locator('#travelTime').selectOption('mattina');
    await page.locator('#passengers').selectOption('1');
    await page.locator('#message').fill('PW_TEST_GENERAL: Cerco passaggio');
    await confirmAge(page);

    // Submit
    await page.getByRole('button', { name: 'Invia richiesta' }).click();

    // Success Modal
    await expect(page.getByRole('heading', { name: 'Richiesta inviata' })).toBeVisible();
    await page.getByRole('button', { name: 'Vai ai messaggi' }).click();

    // Check Messages
    const generalCard = page.locator('.ride-card', { hasText: 'Richiesta generale per Bologna' });
    await expect(generalCard).toBeVisible();
    await expect(generalCard.locator('.ride-badge', { hasText: 'Attiva' })).toBeVisible();
  });

  test('4b. Richiesta generale flow: no fake success on error', async ({ page }) => {
    let interceptedGeneralRequestPostError = false;
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await dismissOnboarding(page);
    await loginAsTestUser(page);

    // Intercept general request POST to fail
    await page.route(/\/rest\/v1\/general_requests/, async (route) => {
      if (route.request().method() === 'POST') {
        interceptedGeneralRequestPostError = true;
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'General request database save failed.' })
        });
      } else {
        await route.fallback();
      }
    });

    // Go to Bacheca
    await page.locator('.bottom-nav-bar').getByText('Bacheca').click();

    // Click "Lascia richiesta generale"
    await page.getByRole('button', { name: 'Lascia richiesta generale' }).click();

    // Fill form and submit
    await page.locator('#departureCity').fill('Bologna');
    await page.locator('#message').fill('PW_TEST_GENERAL_FAIL');
    await confirmAge(page);
    await page.getByRole('button', { name: 'Invia richiesta' }).click();

    await expect.poll(() => interceptedGeneralRequestPostError).toBeTruthy();

    // Verify error banner is visible and success modal is not shown
    await expect(page.getByRole('heading', { name: 'Richiesta inviata' })).not.toBeVisible();
    await expect(page.locator('.auth-banner')).toBeVisible();
    await expect(page.locator('.auth-banner')).toContainText('Errore');
    await expect(page.locator('.auth-banner')).toContainText('General request database save failed');

    // Close modal and check no card in messages
    await page.getByRole('button', { name: 'Annulla' }).click();
    await page.locator('.bottom-nav-bar').getByText('Messaggi').click();
    await expect(page.locator('.ride-card', { hasText: 'Richiesta generale per Bologna' })).not.toBeVisible();
  });

  test('5. Cleanup demo flow: verificare che non faccia hard delete e non rompa rides reali', async ({ page }) => {
    // Populate some general and join requests in db so cleanup has data to archive
    db.joinRequests.push({
      id: "33333333-3333-3333-3333-333333333333",
      ride_id: "7038e21a-e55b-433a-bc12-f046fdf4e4a1",
      requester_id: "77777777-7777-7777-7777-777777777777",
      seats_requested: 1,
      message: "PW_TEST_CLEANUP: join",
      status: "pending",
      created_at: new Date().toISOString()
    });

    db.generalRequests.push({
      id: "55555555-5555-5555-5555-555555555555",
      requester_id: "77777777-7777-7777-7777-777777777777",
      from_city: "Bologna",
      people_count: 1,
      message: "PW_TEST_CLEANUP: general",
      status: "pending",
      created_at: new Date().toISOString()
    });

    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await dismissOnboarding(page);
    await loginAsTestUser(page);

    // Navigate to Messaggi (Control Room demo button is inside)
    await page.locator('.bottom-nav-bar').getByText('Messaggi').click();

    // Verify Control Room demo button is visible (since user is admin)
    await expect(page.getByRole('button', { name: '⚙️ Control Room demo' })).toBeVisible();
    await page.getByRole('button', { name: '⚙️ Control Room demo' }).click();

    // Expect Control Room page header
    await expect(page.getByRole('heading', { name: 'Control Room' })).toBeVisible();

    // Verify active ride "Roma" is visible in Control Room
    await expect(page.locator('.cr-ride-header', { hasText: 'Roma' })).toBeVisible();

    // Verify that "Pulisci bacheca demo" button is visible
    const cleanButton = page.getByRole('button', { name: '🧹 Pulisci bacheca demo' });
    await expect(cleanButton).toBeVisible();

    // Setup dialog listener to accept confirm dialog
    page.on('dialog', async (dialog) => {
      expect(dialog.message()).toContain('Vuoi archiviare richieste test/non confermate?');
      await dialog.accept();
    });

    // Click "Pulisci bacheca demo"
    await cleanButton.click();

    // Give state transitions a moment
    await page.waitForTimeout(500);

    // Verify that:
    // A. No DELETE requests were made
    expect(db.deleteCallsCount).toBe(0);

    // B. PATCH requests were made for soft cleanup (cancel / archive)
    const generalPatch = db.patchCalls.find(p => p.table === 'general_requests');
    const joinPatch = db.patchCalls.find(p => p.table === 'join_requests');
    expect(generalPatch).toBeDefined();
    expect(joinPatch).toBeDefined();
    expect(generalPatch.payload.status).toBe('archived');
    expect(joinPatch.payload.status).toBe('cancelled');

    // C. Verify active/open ride "Roma" is not removed from the public board
    await page.getByRole('button', { name: '← Indietro' }).click();
    await page.locator('.bottom-nav-bar').getByText('Bacheca').click();
    await expect(page.locator('.ride-card', { hasText: 'Roma' })).toBeVisible();
  });
});

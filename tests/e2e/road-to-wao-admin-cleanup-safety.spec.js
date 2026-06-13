import { test, expect } from '@playwright/test';

// Helper to dismiss onboarding modal if it appears
async function dismissOnboarding(page) {
  const dismissButton = page.getByRole('button', { name: 'Ho capito' });
  if (await dismissButton.isVisible()) {
    await dismissButton.click();
  }
}

// Helper to reset the frontend session between mock users
async function resetSession(page) {
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await dismissOnboarding(page);
}

// Helper to log in as a mock user
async function loginAsAdmin(page) {
  await page.locator('.bottom-nav-bar').getByText('Profilo').click();

  // Fill credentials
  await page.locator('#auth-email').fill('admin@roadtowao.local');
  await page.locator('#auth-password').fill('password123');

  // Submit Accedi
  await page.getByRole('button', { name: 'Accedi' }).click();

  // Verify successful login
  const nicknameHeading = page.locator('.profile-panel-content').locator('h2', { hasText: 'Admin' });
  await expect(nicknameHeading).toBeVisible();
}

test.describe('Road to WAO - Admin Cleanup Safety E2E Test', () => {
  // In-memory mock database state containing both test and non-test records
  let db = {
    rides: [
      {
        id: "test-vercel-ride-id",
        driver_id: "luca-id-12345",
        departure_city: "Milano",
        departure_area: "Stazione Centrale",
        to_event: "WAO Festival",
        departure_date: "2026-08-14",
        return_date: null,
        seats_total: 3,
        seats_available: 3,
        departure_time_label: "mattina",
        vibe: "music-first",
        notes: "TEST VERCEL Luca Ride Notes",
        status: "open",
        visibility: "public",
        created_at: "2026-06-12T16:30:00Z"
      },
      {
        id: "normal-ride-id",
        driver_id: "other-driver-id",
        departure_city: "Roma",
        departure_area: "Termini",
        to_event: "WAO Festival",
        departure_date: "2026-08-15",
        return_date: null,
        seats_total: 4,
        seats_available: 4,
        departure_time_label: "pomeriggio",
        vibe: "chill",
        notes: "A normal ride offering notes without test tags",
        status: "open",
        visibility: "public",
        created_at: "2026-06-12T16:40:00Z"
      }
    ],
    joinRequests: [
      {
        id: "test-vercel-join-id",
        ride_id: "test-vercel-ride-id",
        requester_id: "sara-id-12345",
        seats_requested: 1,
        message: "TEST VERCEL Sara Join Request",
        status: "pending",
        created_at: "2026-06-12T17:00:00Z"
      },
      {
        id: "normal-join-id",
        ride_id: "normal-ride-id",
        requester_id: "normal-requester-id",
        seats_requested: 2,
        message: "Can I join your ride please?",
        status: "pending",
        created_at: "2026-06-12T17:10:00Z"
      }
    ],
    generalRequests: [
      {
        id: "test-vercel-general-id",
        requester_id: "sara-id-12345",
        from_city: "Torino",
        from_area: null,
        departure_date: "2026-08-14",
        return_date: null,
        departure_time_label: "sera",
        people_count: 1,
        message: "TEST VERCEL Sara General Request",
        status: "pending",
        created_at: "2026-06-12T17:15:00Z"
      },
      {
        id: "normal-general-id",
        requester_id: "normal-requester-id",
        from_city: "Bologna",
        from_area: null,
        departure_date: "2026-08-14",
        return_date: null,
        departure_time_label: "mattina",
        people_count: 1,
        message: "Looking for a ride from Bologna",
        status: "pending",
        created_at: "2026-06-12T17:20:00Z"
      }
    ]
  };

  // Track modified IDs
  let patchedRideIds = [];
  let patchedJoinRequestIds = [];
  let patchedGeneralRequestIds = [];

  // Helper to extract targeted resource IDs from update REST URLs
  function extractIdsFromUrl(url) {
    const decoded = decodeURIComponent(url);
    const inMatch = decoded.match(/id=in\.\(([^)]+)\)/);
    if (inMatch) {
      return inMatch[1].split(',');
    }
    const eqMatch = decoded.match(/id=eq\.([^&]+)/);
    if (eqMatch) {
      return [eqMatch[1]];
    }
    return [];
  }

  test.beforeEach(async ({ page }) => {
    patchedRideIds = [];
    patchedJoinRequestIds = [];
    patchedGeneralRequestIds = [];

    // Intercept Supabase auth user token requests
    await page.route('**/auth/v1/token?grant_type=password', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          access_token: "admin-token",
          token_type: "bearer",
          expires_in: 3600,
          refresh_token: "refresh-admin-token",
          user: { id: "admin-id-12345", email: "admin@roadtowao.local" },
          session: { access_token: "admin-token", user: { id: "admin-id-12345", email: "admin@roadtowao.local" } }
        })
      });
    });

    // Intercept Supabase auth user validation requests
    await page.route('**/auth/v1/user', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: "admin-id-12345",
          email: "admin@roadtowao.local",
          role: "authenticated",
          aud: "authenticated"
        })
      });
    });

    // Intercept Supabase Profile endpoint
    await page.route('**/rest/v1/profiles**', async (route) => {
      const method = route.request().method();
      const url = route.request().url();
      if (method === 'GET') {
        if (url.includes('select=id%2Cnickname')) {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify([
              { id: "luca-id-12345", nickname: "Luca" },
              { id: "sara-id-12345", nickname: "Sara" },
              { id: "admin-id-12345", nickname: "Admin" },
              { id: "other-driver-id", nickname: "Other Driver" },
              { id: "normal-requester-id", nickname: "Normal Requester" }
            ])
          });
        } else {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify([{
              id: "admin-id-12345",
              nickname: "Admin",
              departure_city: "Milano",
              role: "admin",
              is_of_age: true,
              is_admin: true,
              created_at: "2026-06-12T16:30:00Z",
              updated_at: "2026-06-12T16:30:00Z"
            }])
          });
        }
      } else {
        await route.fallback();
      }
    });

    // Intercept Supabase profile secrets endpoint
    await page.route('**/rest/v1/profile_secrets**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([{
          id: "admin-id-12345",
          telegram_username: "@admin",
          instagram_username: "admin_ig"
        }])
      });
    });

    // Intercept GET and PATCH rides
    await page.route(/\/rest\/v1\/rides/, async (route) => {
      const method = route.request().method();
      if (method === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(db.rides)
        });
      } else if (method === 'PATCH') {
        const url = route.request().url();
        const payload = route.request().postDataJSON();
        const ids = extractIdsFromUrl(url);
        patchedRideIds.push(...ids);

        db.rides = db.rides.map(r => {
          if (ids.includes(r.id)) {
            return { ...r, ...payload };
          }
          return r;
        });

        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(db.rides.filter(r => ids.includes(r.id)))
        });
      } else {
        await route.fallback();
      }
    });

    // Intercept GET and PATCH join_requests
    await page.route(/\/rest\/v1\/join_requests/, async (route) => {
      const method = route.request().method();
      if (method === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(db.joinRequests)
        });
      } else if (method === 'PATCH') {
        const url = route.request().url();
        const payload = route.request().postDataJSON();
        const ids = extractIdsFromUrl(url);
        patchedJoinRequestIds.push(...ids);

        db.joinRequests = db.joinRequests.map(j => {
          if (ids.includes(j.id)) {
            return { ...j, ...payload };
          }
          return j;
        });

        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(db.joinRequests.filter(j => ids.includes(j.id)))
        });
      } else {
        await route.fallback();
      }
    });

    // Intercept GET and PATCH general_requests
    await page.route(/\/rest\/v1\/general_requests/, async (route) => {
      const method = route.request().method();
      if (method === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(db.generalRequests)
        });
      } else if (method === 'PATCH') {
        const url = route.request().url();
        const payload = route.request().postDataJSON();
        const ids = extractIdsFromUrl(url);
        patchedGeneralRequestIds.push(...ids);

        db.generalRequests = db.generalRequests.map(g => {
          if (ids.includes(g.id)) {
            return { ...g, ...payload };
          }
          return g;
        });

        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(db.generalRequests.filter(g => ids.includes(g.id)))
        });
      } else {
        await route.fallback();
      }
    });
  });

  test('Cleanup affects only TEST VERCEL records, leaving normal ones untouched', async ({ page }) => {
    // 1. Go to homepage & dismiss onboarding
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await dismissOnboarding(page);

    // 2. Login as Admin
    await loginAsAdmin(page);

    // 3. Go to Messaggi & Open Control Room
    await page.locator('.bottom-nav-bar').getByText('Messaggi').click();
    await expect(page.getByRole('button', { name: '⚙️ Control Room demo' })).toBeVisible();
    await page.getByRole('button', { name: '⚙️ Control Room demo' }).click();

    // Verify Control Room is visible
    await expect(page.getByRole('heading', { name: 'Control Room' })).toBeVisible();

    // 4. Enable "Mostra dati di test" check
    const showTestToggle = page.locator('input[type="checkbox"]');
    if (!(await showTestToggle.isChecked())) {
      await page.getByText('Mostra dati di test').click();
    }

    // Assert that the preview counts and items render correctly (test and normal mixed)
    await expect(page.locator('.cr-ride-header', { hasText: 'Milano' })).toBeVisible(); // Test ride
    await expect(page.locator('.cr-ride-header', { hasText: 'Roma' })).toBeVisible();   // Normal ride

    // 5. Trigger Cleanup & dismiss confirmation
    const cleanButton = page.getByRole('button', { name: '🧹 Pulisci bacheca demo' });
    await expect(cleanButton).toBeVisible();

    // Set up dialog listener to accept confirm/alert dialogs
    page.on('dialog', async (dialog) => {
      await dialog.accept();
    });

    await cleanButton.click();

    // Click "Conferma pulizia TEST" in the preview modal
    await page.getByRole('button', { name: 'Conferma pulizia TEST' }).click();

    // Wait for async request execution
    await page.waitForTimeout(500);

    // 6. Assertions on PATCH calls
    // Ensure only TEST VERCEL/demo ids were updated
    expect(patchedRideIds).toContain('test-vercel-ride-id');
    expect(patchedRideIds).not.toContain('normal-ride-id');

    expect(patchedJoinRequestIds).toContain('test-vercel-join-id');
    expect(patchedJoinRequestIds).not.toContain('normal-join-id');

    expect(patchedGeneralRequestIds).toContain('test-vercel-general-id');
    expect(patchedGeneralRequestIds).not.toContain('normal-general-id');

    // 7. Assertions on DB status state
    const testRide = db.rides.find(r => r.id === 'test-vercel-ride-id');
    const normalRide = db.rides.find(r => r.id === 'normal-ride-id');
    expect(testRide?.status).toBe('archived');
    expect(normalRide?.status).toBe('open');

    const testJoin = db.joinRequests.find(j => j.id === 'test-vercel-join-id');
    const normalJoin = db.joinRequests.find(j => j.id === 'normal-join-id');
    expect(testJoin?.status).toBe('cancelled');
    expect(normalJoin?.status).toBe('pending');

    const testGen = db.generalRequests.find(g => g.id === 'test-vercel-general-id');
    const normalGen = db.generalRequests.find(g => g.id === 'normal-general-id');
    expect(testGen?.status).toBe('archived');
    expect(normalGen?.status).toBe('pending');
  });
});

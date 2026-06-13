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

// Helper to reset the frontend session between mock users
async function resetSession(page) {
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await dismissOnboarding(page);
}

// Helper to log in as a specific user and verify
async function loginAs(page, email, nickname) {
  // Go to Profilo tab
  await page.locator('.bottom-nav-bar').getByText('Profilo').click();

  // If already logged in as someone else, log out first
  const logoutBtn = page.getByRole('button', { name: 'Disconnetti' });
  if (await logoutBtn.isVisible()) {
    await logoutBtn.click();
    await page.waitForTimeout(300);
  }

  // Fill credentials
  await page.locator('#auth-email').fill(email);
  await page.locator('#auth-password').fill('password123');

  // Submit Accedi
  await page.getByRole('button', { name: 'Accedi' }).click();

  // Verify successful login
  const nicknameHeading = page.locator('.profile-panel-content').locator('h2', { hasText: nickname });
  await expect(nicknameHeading).toBeVisible();
}

test.describe('Road to WAO - Request Isolation and Cleanup Consistency', () => {
  // In-memory mock database state
  let db = {
    rides: [
      {
        id: "luca-ride-uuid",
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
        notes: "TEST MOCK Luca Ride Notes TEST VERCEL",
        status: "open",
        visibility: "public",
        created_at: "2026-06-12T16:30:00Z"
      }
    ],
    joinRequests: [
      {
        id: "sara-join-uuid",
        ride_id: "luca-ride-uuid",
        requester_id: "sara-id-12345",
        seats_requested: 1,
        message: "TEST MOCK Sara Join Request TEST VERCEL",
        status: "pending",
        created_at: "2026-06-12T17:00:00Z"
      },
      {
        id: "luca-old-join-uuid",
        ride_id: "some-other-ride-uuid",
        requester_id: "luca-id-12345",
        seats_requested: 1,
        message: "TEST MOCK Luca Old Archived Request TEST VERCEL",
        status: "cancelled",
        created_at: "2026-06-12T15:00:00Z"
      },
      {
        id: "unrelated-join-uuid",
        ride_id: "luca-ride-uuid",
        requester_id: "other-id-12345",
        seats_requested: 1,
        message: "Unrelated join request",
        status: "pending",
        created_at: "2026-06-12T18:00:00Z"
      }
    ],
    generalRequests: [
      {
        id: "sara-general-uuid",
        requester_id: "sara-id-12345",
        from_city: "Roma",
        from_area: null,
        departure_date: "2026-08-14",
        return_date: null,
        departure_time_label: "sera",
        people_count: 1,
        message: "TEST MOCK Sara General Request TEST VERCEL",
        status: "pending",
        created_at: "2026-06-12T17:15:00Z"
      }
    ]
  };

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
    // Intercept Supabase auth user token requests
    await page.route('**/auth/v1/token?grant_type=password', async (route) => {
      const body = route.request().postDataJSON();
      const email = body?.email;

      let userId = "luca-id-12345";
      let token = "luca-token";
      if (email === "sara@roadtowao.local") {
        userId = "sara-id-12345";
        token = "sara-token";
      } else if (email === "admin@roadtowao.local") {
        userId = "admin-id-12345";
        token = "admin-token";
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          access_token: token,
          token_type: "bearer",
          expires_in: 3600,
          refresh_token: `refresh-${token}`,
          user: { id: userId, email },
          session: { access_token: token, user: { id: userId, email } }
        })
      });
    });

    // Intercept Supabase auth user validation requests
    await page.route('**/auth/v1/user', async (route) => {
      const authHeader = route.request().headers()['authorization'] || '';
      let userId = null;
      let email = null;

      if (authHeader.includes('Bearer luca-token')) {
        userId = "luca-id-12345";
        email = "luca@roadtowao.local";
      } else if (authHeader.includes('Bearer sara-token')) {
        userId = "sara-id-12345";
        email = "sara@roadtowao.local";
      } else if (authHeader.includes('Bearer admin-token')) {
        userId = "admin-id-12345";
        email = "admin@roadtowao.local";
      }

      if (userId) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: userId,
            email,
            role: "authenticated",
            aud: "authenticated"
          })
        });
      } else {
        await route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({ error: "unauthorized" })
        });
      }
    });

    // Intercept Supabase Profile endpoint
    await page.route('**/rest/v1/profiles**', async (route) => {
      const method = route.request().method();
      if (method === 'GET') {
        const url = route.request().url();
        if (url.includes('select=id%2Cnickname')) {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify([
              { id: "luca-id-12345", nickname: "Luca" },
              { id: "sara-id-12345", nickname: "Sara" },
              { id: "admin-id-12345", nickname: "Admin" },
              { id: "other-id-12345", nickname: "Other User" }
            ])
          });
        } else {
          let targetId = "luca-id-12345";
          let nickname = "Luca";
          let isAdmin = false;

          if (url.includes("sara-id-12345")) {
            targetId = "sara-id-12345";
            nickname = "Sara";
          } else if (url.includes("admin-id-12345")) {
            targetId = "admin-id-12345";
            nickname = "Admin";
            isAdmin = true;
          }

          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify([{
              id: targetId,
              nickname,
              departure_city: nickname === "Sara" ? "Roma" : "Milano",
              role: isAdmin ? "admin" : (nickname === "Sara" ? "passenger" : "driver"),
              is_of_age: true,
              is_admin: isAdmin,
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
      const url = route.request().url();
      let userId = "luca-id-12345";
      if (url.includes("sara-id-12345")) userId = "sara-id-12345";
      else if (url.includes("admin-id-12345")) userId = "admin-id-12345";

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([{
          id: userId,
          telegram_username: `@${userId}`,
          instagram_username: `${userId}_ig`
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

  test('Luca sees only Luca-related requests, Sara sees only Sara-related, Admin cleans up and reload shows consistent archived states', async ({ page }) => {
    // -------------------------------------------------------------
    // PART 1: Luca Login & Verification
    // -------------------------------------------------------------
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await dismissOnboarding(page);
    await loginAs(page, 'luca@roadtowao.local', 'Luca');

    // Go to Messaggi
    await page.locator('.bottom-nav-bar').getByText('Messaggi').click();
    await expect(page.getByRole('heading', { name: 'Messaggi' })).toBeVisible();

    // Luca should see:
    // A. "Il tuo viaggio aperto" Milano
    await expect(page.locator('.ride-card', { hasText: 'Il tuo viaggio aperto' })).toBeVisible();
    await expect(page.locator('.ride-card', { hasText: 'Milano → WAO' })).toBeVisible();

    // B. Sara's join request for Luca's ride (in approvazione / pending)
    await expect(page.locator('.ride-card', { hasText: 'Richiesta per Milano → WAO' }).first()).toBeVisible();

    // Luca should NOT see:
    // A. Sara's general request (Roma)
    await expect(page.locator('.ride-card', { hasText: 'Richiesta generale per Roma' })).not.toBeVisible();
    // B. Unrelated request from other user
    await expect(page.locator('.ride-card', { hasText: 'Unrelated join request' })).not.toBeVisible();

    // Luca's Archive should show only Luca's cancelled old request
    const showArchivedBtn = page.getByRole('button', { name: /Mostra archiviate/ });
    if (await showArchivedBtn.isVisible()) {
      await showArchivedBtn.click();
      await expect(page.locator('.archived-section .ride-card').first()).toBeVisible();
      // Should NOT show any Sara-related archived or unrelated items
      await expect(page.locator('.archived-section').locator('.ride-card', { hasText: 'Sara' })).not.toBeVisible();
    }

    // -------------------------------------------------------------
    // PART 2: Sara Login & Verification
    // -------------------------------------------------------------
    await resetSession(page);
    await loginAs(page, 'sara@roadtowao.local', 'Sara');

    // Go to Messaggi
    await page.locator('.bottom-nav-bar').getByText('Messaggi').click();
    await expect(page.getByRole('heading', { name: 'Messaggi' })).toBeVisible();

    // Sara should see:
    // A. Sara's pending join request for Luca's Milano ride
    await expect(page.locator('.ride-card', { hasText: 'Richiesta per Milano → WAO' }).first()).toBeVisible();
    // B. Sara's general request for Roma
    await expect(page.locator('.ride-card', { hasText: 'Richiesta generale per Roma' })).toBeVisible();

    // Sara should NOT see:
    // A. Luca's own ride card as "Il tuo viaggio aperto"
    await expect(page.locator('.ride-card', { hasText: 'Il tuo viaggio aperto' })).not.toBeVisible();
    // B. Luca's old cancelled request
    await expect(page.locator('.ride-card', { hasText: 'Luca Old Archived Request' })).not.toBeVisible();
    // C. Unrelated request from other user
    await expect(page.locator('.ride-card', { hasText: 'Unrelated join request' })).not.toBeVisible();

    // -------------------------------------------------------------
    // PART 3: Admin Login & Control Room Cleanup
    // -------------------------------------------------------------
    await resetSession(page);
    await loginAs(page, 'admin@roadtowao.local', 'Admin');

    // Go to Messaggi (where Admin Control Room button is situated)
    await page.locator('.bottom-nav-bar').getByText('Messaggi').click();
    await expect(page.getByRole('button', { name: '⚙️ Control Room demo' })).toBeVisible();
    await page.getByRole('button', { name: '⚙️ Control Room demo' }).click();

    // Assert Control Room is visible
    await expect(page.getByRole('heading', { name: 'Control Room' })).toBeVisible();

    // Enable "Mostra dati di test" check to verify test records are seen
    const showTestToggle = page.locator('input[type="checkbox"]');
    if (!(await showTestToggle.isChecked())) {
      await page.getByText('Mostra dati di test').click();
    }

    // Assert contains full state
    await expect(page.locator('.cr-ride-header', { hasText: 'Milano' })).toBeVisible(); // Luca's ride
    await expect(page.locator('.cr-gen-card', { hasText: 'Sara' })).toBeVisible();      // Sara's general request

    // Verify unrelated request is also visible to Admin if we search the page
    const adminRidesListText = await page.textContent('.cr-root');
    expect(adminRidesListText).toContain('Other User');

    // Trigger Cleanup
    const cleanButton = page.getByRole('button', { name: '🧹 Pulisci bacheca demo' });
    await expect(cleanButton).toBeVisible();

    // Setup dialog listener to accept confirm dialog
    page.on('dialog', async (dialog) => {
      await dialog.accept();
    });

    await cleanButton.click();

    // Click "Conferma pulizia TEST" in the preview modal
    await page.getByRole('button', { name: 'Conferma pulizia TEST' }).click();

    // Wait for requests to complete and update mock DB
    await page.waitForTimeout(500);

    // -------------------------------------------------------------
    // PART 4: Reload & Consistency Verification (Sara)
    // -------------------------------------------------------------
    await resetSession(page);
    await loginAs(page, 'sara@roadtowao.local', 'Sara');

    // Navigate to Messaggi
    await page.locator('.bottom-nav-bar').getByText('Messaggi').click();

    // Sara should NOT see any active requests (they are cancelled/archived)
    await expect(page.locator('.messages-list').locator('.ride-card', { hasText: 'Richiesta per Milano → WAO' }).first()).not.toBeVisible();
    await expect(page.locator('.messages-list').locator('.ride-card', { hasText: 'Richiesta generale per Roma' })).not.toBeVisible();

    // Archive should show Sara's cancelled join request and archived general request
    const saraShowArchived = page.getByRole('button', { name: /Mostra archiviate/ });
    await expect(saraShowArchived).toBeVisible();
    await saraShowArchived.click();

    const archiveSection = page.locator('.archived-section');
    await expect(archiveSection.locator('.ride-card', { hasText: 'Milano' })).toBeVisible();
    await expect(archiveSection.locator('.ride-card', { hasText: 'Roma' })).toBeVisible();

    // Sara should NOT see Luca's old cancelled request in her archive
    await expect(archiveSection.locator('.ride-card', { hasText: 'Luca Old Archived Request' })).not.toBeVisible();

    // -------------------------------------------------------------
    // PART 5: Reload & Consistency Verification (Luca)
    // -------------------------------------------------------------
    await resetSession(page);
    await loginAs(page, 'luca@roadtowao.local', 'Luca');

    // Navigate to Messaggi
    await page.locator('.bottom-nav-bar').getByText('Messaggi').click();

    // Luca's Milano ride should be archived (no longer active on public board, but status updated)
    // Luca should NOT see Sara's pending request in active requests
    await expect(page.locator('.messages-list').locator('.ride-card', { hasText: 'Richiesta per Milano → WAO' }).first()).not.toBeVisible();

    // Archive should show Luca's own cancelled old request
    const lucaShowArchived = page.getByRole('button', { name: /Mostra archiviate/ });
    await expect(lucaShowArchived).toBeVisible();
    await lucaShowArchived.click();

    const lucaArchive = page.locator('.archived-section');
    await expect(lucaArchive.locator('.ride-card', { hasText: 'Milano' }).first()).toBeVisible();

    // Luca should NOT see Sara's requests in Luca's archive
    await expect(lucaArchive.locator('.ride-card', { hasText: 'Sara' })).not.toBeVisible();
  });
});

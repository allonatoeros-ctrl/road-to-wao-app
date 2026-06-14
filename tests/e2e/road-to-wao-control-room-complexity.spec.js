import { test, expect } from '@playwright/test';

const ADMIN_USER_ID = 'aaa00000-0000-0000-0000-000000000001';
const SARA_USER_ID  = 'bbb00000-0000-0000-0000-000000000002';
const USER_IDS = {
  alice:    'ccc00000-0000-0000-0000-000000000011',
  bob:      'ccc00000-0000-0000-0000-000000000012',
  carlo:    'ccc00000-0000-0000-0000-000000000013',
  diana:    'ccc00000-0000-0000-0000-000000000014',
  eva:      'ccc00000-0000-0000-0000-000000000015',
  fabrizio: 'ccc00000-0000-0000-0000-000000000016',
};

const RIDES = [
  {
    id: 'ride-roma-001',
    driver_id: ADMIN_USER_ID,
    departure_city: 'Roma',
    departure_area: 'Termini',
    to_event: 'WAO Festival',
    departure_date: '2026-08-10',
    return_date: null,
    seats_total: 2,
    seats_available: 2,
    departure_time_label: 'mattina',
    vibe: 'music-first',
    notes: 'Passaggio da Roma',
    status: 'open',
    visibility: 'public',
    created_at: '2026-06-01T10:00:00Z',
  },
  {
    id: 'ride-milano-002',
    driver_id: ADMIN_USER_ID,
    departure_city: 'Milano',
    departure_area: 'Centrale',
    to_event: 'WAO Festival',
    departure_date: '2026-08-15',
    return_date: null,
    seats_total: 3,
    seats_available: 3,
    departure_time_label: 'sera',
    vibe: 'chill',
    notes: 'Passaggio da Milano',
    status: 'open',
    visibility: 'public',
    created_at: '2026-06-01T11:00:00Z',
  },
];

const JOIN_REQUESTS = [
  {
    id: 'join-001',
    ride_id: 'ride-roma-001',
    requester_id: SARA_USER_ID,
    seats_requested: 1,
    message: 'Vorrei unirmi al viaggio',
    status: 'pending',
    created_at: '2026-06-10T09:00:00Z',
  },
];

// 6 general requests, all from Roma so they match the Roma ride.
// Returned in this order by the mock; only departureDate changes for sort.
const GENERAL_REQUESTS = [
  {
    id: 'gr-001',
    requester_id: USER_IDS.alice,
    from_city: 'Roma',
    from_area: null,
    departure_date: '2026-08-07',   // earlier than ride → date mismatch
    return_date: null,
    departure_time_label: 'mattina',
    people_count: 1,
    message: 'Cerco passaggio presto',
    status: 'pending',
    created_at: '2026-06-02T08:00:00Z',
  },
  {
    id: 'gr-002',
    requester_id: USER_IDS.bob,
    from_city: 'Roma',
    from_area: null,
    departure_date: '2026-08-10',   // same as ride → no warning
    return_date: null,
    departure_time_label: 'mattina',
    people_count: 1,
    message: 'Disponibile il 10',
    status: 'pending',
    created_at: '2026-06-02T09:00:00Z',
  },
  {
    id: 'gr-003',
    requester_id: USER_IDS.carlo,
    from_city: 'Roma',
    from_area: null,
    departure_date: '2026-08-12',   // date mismatch + 4 people > 2 seats
    return_date: null,
    departure_time_label: 'mattina',
    people_count: 4,
    message: 'Siamo in 4',
    status: 'pending',
    created_at: '2026-06-02T10:00:00Z',
  },
  {
    id: 'gr-004',
    requester_id: USER_IDS.diana,
    from_city: 'Roma',
    from_area: null,
    departure_date: '2026-08-14',
    return_date: null,
    departure_time_label: 'pomeriggio',
    people_count: 1,
    message: 'Partenza il 14',
    status: 'pending',
    created_at: '2026-06-02T11:00:00Z',
  },
  {
    id: 'gr-005',
    requester_id: USER_IDS.eva,
    from_city: 'Roma',
    from_area: null,
    departure_date: '2026-08-20',
    return_date: null,
    departure_time_label: 'sera',
    people_count: 2,
    message: 'Flessibile sulla data',
    status: 'pending',
    created_at: '2026-06-02T12:00:00Z',
  },
  {
    id: 'gr-006',
    requester_id: USER_IDS.fabrizio,
    from_city: 'Roma',
    from_area: null,
    departure_date: null,           // no date → must appear last
    return_date: null,
    departure_time_label: null,
    people_count: 2,
    message: 'Data ancora da definire',
    status: 'pending',
    created_at: '2026-06-02T13:00:00Z',
  },
];

const ALL_PROFILES = [
  { id: ADMIN_USER_ID,       nickname: 'AdminDriver' },
  { id: SARA_USER_ID,        nickname: 'Sara_Raver' },
  { id: USER_IDS.alice,      nickname: 'Alice' },
  { id: USER_IDS.bob,        nickname: 'Bob' },
  { id: USER_IDS.carlo,      nickname: 'Carlo' },
  { id: USER_IDS.diana,      nickname: 'Diana' },
  { id: USER_IDS.eva,        nickname: 'Eva' },
  { id: USER_IDS.fabrizio,   nickname: 'Fabrizio' },
];

async function dismissOnboarding(page) {
  const btn = page.getByRole('button', { name: 'Ho capito' });
  if (await btn.isVisible()) await btn.click();
}

test.describe('Control Room — complex data scenario', () => {
  test.beforeEach(async ({ page }) => {
    // ── Auth ──────────────────────────────────────────────────────
    await page.route('**/auth/v1/user', async (route) => {
      const auth = route.request().headers()['authorization'] || '';
      if (auth.includes('mock-admin-token')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: ADMIN_USER_ID,
            email: 'admin@roadtowao.local',
            role: 'authenticated',
            aud: 'authenticated',
          }),
        });
      } else {
        await route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'unauthorized' }),
        });
      }
    });

    await page.route('**/auth/v1/token?grant_type=password', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          access_token: 'mock-admin-token',
          token_type: 'bearer',
          expires_in: 3600,
          refresh_token: 'mock-refresh-token',
          user: { id: ADMIN_USER_ID, email: 'admin@roadtowao.local' },
          session: {
            access_token: 'mock-admin-token',
            user: { id: ADMIN_USER_ID, email: 'admin@roadtowao.local' },
          },
        }),
      });
    });

    // ── Profiles ─────────────────────────────────────────────────
    await page.route('**/rest/v1/profiles**', async (route) => {
      const method = route.request().method();
      if (method === 'GET') {
        const url = route.request().url();
        if (url.includes('select=id%2Cnickname')) {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(ALL_PROFILES),
          });
        } else {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify([
              {
                id: ADMIN_USER_ID,
                nickname: 'AdminDriver',
                departure_city: 'Roma',
                role: 'driver',
                is_of_age: true,
                is_admin: true,
                created_at: '2026-06-01T00:00:00Z',
                updated_at: '2026-06-01T00:00:00Z',
              },
            ]),
          });
        }
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ id: ADMIN_USER_ID, nickname: 'AdminDriver' }),
        });
      }
    });

    await page.route('**/rest/v1/profile_secrets**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { id: ADMIN_USER_ID, telegram_username: '@admin', instagram_username: 'admin' },
        ]),
      });
    });

    // ── Rides ─────────────────────────────────────────────────────
    await page.route(/\/rest\/v1\/rides/, async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(RIDES),
        });
      } else {
        await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
      }
    });

    // ── Ride secrets ──────────────────────────────────────────────
    await page.route('**/rest/v1/ride_secrets**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });

    // ── Join requests ─────────────────────────────────────────────
    await page.route(/\/rest\/v1\/join_requests/, async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(JOIN_REQUESTS),
        });
      } else {
        await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
      }
    });

    // ── General requests ──────────────────────────────────────────
    await page.route(/\/rest\/v1\/general_requests/, async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(GENERAL_REQUESTS),
        });
      } else {
        await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
      }
    });
  });

  test('Control Room con dati complessi: ordine general requests e warning crew candidates', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await dismissOnboarding(page);

    // Login as admin
    await page.locator('.bottom-nav-bar').getByText('Profilo').click();
    await page.locator('#auth-email').fill('admin@roadtowao.local');
    await page.locator('#auth-password').fill('password123');
    await page.getByRole('button', { name: 'Accedi' }).click();
    await expect(page.getByRole('heading', { name: 'AdminDriver', exact: true })).toBeVisible();

    // Open Control Room
    await page.locator('.bottom-nav-bar').getByText('Messaggi').click();
    await page.getByRole('button', { name: '⚙️ Control Room demo' }).click();

    // ── 1. Control Room opens ─────────────────────────────────────
    await expect(page.getByRole('heading', { name: 'Control Room' })).toBeVisible();

    // ── 2. General requests attive visibili (6) ───────────────────
    const genCards = page.locator('.cr-gen-card');
    await expect(genCards).toHaveCount(6);

    // ── 3. Ordine crescente per data, senza-data in fondo ─────────
    // nth(0) → Alice (2026-08-07, prima per data)
    await expect(genCards.nth(0)).toContainText('Alice');
    // nth(1) → Bob (2026-08-10)
    await expect(genCards.nth(1)).toContainText('Bob');
    // nth(2) → Carlo (2026-08-12)
    await expect(genCards.nth(2)).toContainText('Carlo');
    // nth(3) → Diana (2026-08-14)
    await expect(genCards.nth(3)).toContainText('Diana');
    // nth(4) → Eva (2026-08-20)
    await expect(genCards.nth(4)).toContainText('Eva');
    // nth(5) → Fabrizio (nessuna data → ultimo)
    await expect(genCards.nth(5)).toContainText('Fabrizio');

    // ── 4. Crew candidates: warning date diverse ──────────────────
    // Alice (08-07) e Carlo (08-12) hanno data diversa dalla ride Roma (08-10)
    const candidateCard = page.locator('.cr-candidate-card');
    await expect(candidateCard).toContainText('Date diverse');

    // ── 5. Crew candidates: warning posti insufficienti ───────────
    // Carlo ha 4 persone, ride Roma ha 2 posti
    await expect(candidateCard).toContainText('persone richieste');
  });
});

import { test, expect } from '@playwright/test';

// Mirrors the real "Padova" Control Room scenario: a ride whose driver has no
// Telegram on file, with two approved join requests that DO have Telegram.
const ADMIN_USER_ID = '335786e8-09aa-474c-8c2e-bd7730ad3109';
const PARTICIPANT_1_ID = 'ccc00000-0000-0000-0000-000000000021';
const PARTICIPANT_2_ID = 'ccc00000-0000-0000-0000-000000000022';
const RIDE_ID = '75236fb6-9ff5-4fe8-b620-8f8955f0d5fb';

const RIDES = [
  {
    id: RIDE_ID,
    driver_id: ADMIN_USER_ID,
    departure_city: 'Padova',
    departure_area: 'Stazione',
    to_event: 'WAO Festival',
    departure_date: '2026-08-10',
    return_date: null,
    seats_total: 2,
    seats_available: 0,
    departure_time_label: 'mattina',
    vibe: 'music-first',
    notes: 'Passaggio da Padova',
    status: 'full',
    visibility: 'public',
    created_at: '2026-06-01T10:00:00Z',
  },
];

const JOIN_REQUESTS = [
  {
    id: 'join-p1',
    ride_id: RIDE_ID,
    requester_id: PARTICIPANT_1_ID,
    seats_requested: 1,
    message: 'Vorrei unirmi',
    status: 'approved',
    approved_at: '2026-06-05T09:00:00Z',
    created_at: '2026-06-02T09:00:00Z',
  },
  {
    id: 'join-p2',
    ride_id: RIDE_ID,
    requester_id: PARTICIPANT_2_ID,
    seats_requested: 1,
    message: 'Ci sono anche io',
    status: 'approved',
    approved_at: '2026-06-06T09:00:00Z',
    created_at: '2026-06-03T09:00:00Z',
  },
];

const ALL_PROFILES = [
  { id: ADMIN_USER_ID, nickname: 'Auro' },
  { id: PARTICIPANT_1_ID, nickname: 'Nome1' },
  { id: PARTICIPANT_2_ID, nickname: 'Nome2' },
];

const PROFILE_SECRETS = [
  // Driver has NO Telegram on file — expected readiness: "MANCA IL TELEGRAM DEL DRIVER"
  { id: PARTICIPANT_1_ID, telegram_username: 'username1', instagram_username: null },
  { id: PARTICIPANT_2_ID, telegram_username: 'username2', instagram_username: null },
];

async function dismissOnboarding(page) {
  const btn = page.getByRole('button', { name: 'Ho capito' });
  if (await btn.isVisible()) await btn.click();
}

test.describe('Control Room — Padova crew readiness card', () => {
  test.beforeEach(async ({ page }) => {
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
        await route.fulfill({ status: 400, contentType: 'application/json', body: JSON.stringify({ error: 'unauthorized' }) });
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
          session: { access_token: 'mock-admin-token', user: { id: ADMIN_USER_ID, email: 'admin@roadtowao.local' } },
        }),
      });
    });

    await page.route('**/rest/v1/profiles**', async (route) => {
      const method = route.request().method();
      if (method !== 'GET') {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id: ADMIN_USER_ID, nickname: 'Auro' }) });
        return;
      }
      const url = route.request().url();
      if (url.includes('select=id%2Cnickname%2Cdeparture_city') || url.includes('select=id,nickname,departure_city')) {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(ALL_PROFILES.map(p => ({ ...p, departure_city: p.id === ADMIN_USER_ID ? 'Padova' : null }))) });
      } else if (url.includes('select=id%2Cnickname') || url.includes('select=id,nickname')) {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(ALL_PROFILES) });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([{
            id: ADMIN_USER_ID,
            nickname: 'Auro',
            departure_city: 'Padova',
            role: 'driver',
            is_of_age: true,
            is_admin: true,
            created_at: '2026-06-01T00:00:00Z',
            updated_at: '2026-06-01T00:00:00Z',
          }]),
        });
      }
    });

    await page.route('**/rest/v1/profile_secrets**', async (route) => {
      // Driver id intentionally absent from PROFILE_SECRETS → no Telegram on file.
      const url = route.request().url();
      const idMatch = url.match(/id=eq\.([^&]+)/);
      if (idMatch) {
        // Single-id lookups (e.g. login's getCurrentProfile) must respect the filter,
        // mirroring real PostgREST behavior — otherwise .maybeSingle() sees >1 rows
        // and errors out, even for ids (like the admin's) with zero secrets on file.
        const id = decodeURIComponent(idMatch[1]);
        const filtered = PROFILE_SECRETS.filter(s => s.id === id);
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(filtered) });
        return;
      }
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(PROFILE_SECRETS) });
    });

    await page.route(/\/rest\/v1\/rides/, async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(RIDES) });
      } else {
        await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
      }
    });

    await page.route('**/rest/v1/ride_secrets**', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
    });

    await page.route(/\/rest\/v1\/join_requests/, async (route) => {
      if (route.request().method() !== 'GET') {
        await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
        return;
      }
      const url = route.request().url();
      if (url.includes('status=eq.approved')) {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(JOIN_REQUESTS) });
      } else {
        // Non-admin-detail queries (e.g. App.jsx's generic fetchJoinRequests) see everything.
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(JOIN_REQUESTS) });
      }
    });

    await page.route(/\/rest\/v1\/general_requests/, async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
      } else {
        await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
      }
    });
  });

  test('shows driver + approved crew, missing-contact badge, and readiness state for Padova', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await dismissOnboarding(page);

    await page.locator('.bottom-nav-bar').getByText('Profilo').click();
    await page.locator('#auth-email').fill('admin@roadtowao.local');
    await page.locator('#auth-password').fill('password123');
    await page.getByRole('button', { name: 'Accedi' }).click();
    await expect(page.getByRole('heading', { name: 'Auro', exact: true })).toBeVisible();

    await page.locator('.bottom-nav-bar').getByText('Messaggi').click();
    await page.getByRole('button', { name: '⚙️ Control Room demo' }).click();
    await expect(page.getByRole('heading', { name: 'Control Room' })).toBeVisible();

    // Expand the Padova ride card.
    const rideCard = page.locator('.cr-ride-card', { hasText: 'Padova' }).first();
    await rideCard.locator('.cr-ride-header').click();

    // Driver section.
    await expect(rideCard.getByText('DRIVER', { exact: true })).toBeVisible();
    await expect(rideCard.getByText('Auro', { exact: true })).toBeVisible();

    // Approved participants section.
    await expect(rideCard.getByText('Nome1')).toBeVisible();
    await expect(rideCard.getByText('Nome2')).toBeVisible();
    await expect(rideCard.getByText('username1')).toBeVisible();
    await expect(rideCard.getByText('username2')).toBeVisible();

    // Missing-contact badge on the driver (only one CONTATTO MANCANTE badge expected — the driver's).
    await expect(rideCard.getByText('CONTATTO MANCANTE')).toHaveCount(1);

    // Readiness state.
    await expect(rideCard.getByText('MANCA IL TELEGRAM DEL DRIVER')).toBeVisible();

    // Copy contacts action is present.
    await expect(rideCard.getByRole('button', { name: 'Copia contatti Telegram' })).toBeVisible();
  });
});

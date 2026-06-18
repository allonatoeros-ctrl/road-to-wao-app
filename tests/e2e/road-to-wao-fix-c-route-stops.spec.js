import { test, expect } from '@playwright/test';

const ADMIN_USER_ID = 'aaa00000-0000-0000-0000-000000000001';

const RIDES = [
  {
    id: 'ride-padova-001',
    driver_id: ADMIN_USER_ID,
    departure_city: 'Padova',
    departure_area: 'Ravenna, Cesena, Città di Castello, Perugia',
    to_event: 'WAO Festival',
    departure_date: '2026-08-11',
    return_date: null,
    seats_total: 2,
    seats_available: 2,
    departure_time_label: 'mattina',
    vibe: 'chill',
    notes: 'possible departure 1/2 days earlier | Fiat 500 / limited luggage | space luggage: medio | tents, suitcases, food | contact: @auro',
    status: 'open',
    visibility: 'public',
    created_at: '2026-06-01T10:00:00Z',
  }
];

const ALL_PROFILES = [
  { id: ADMIN_USER_ID, nickname: 'Auro' }
];

async function dismissOnboarding(page) {
  const btn = page.getByRole('button', { name: 'Ho capito' });
  if (await btn.isVisible()) await btn.click();
}

test.describe('Fix C — Route stops and travel details visibility', () => {
  test.beforeEach(async ({ page }) => {
    // Auth route interception
    await page.route('**/auth/v1/user', async (route) => {
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

    // Profiles route interception
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
                nickname: 'Auro',
                departure_city: 'Padova',
                role: 'driver',
                is_of_age: true,
                is_admin: true,
                created_at: '2026-06-01T00:00:00Z',
                updated_at: '2026-06-01T00:00:00Z',
              },
            ]),
          });
        }
      }
    });

    await page.route('**/rest/v1/profile_secrets**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { id: ADMIN_USER_ID, telegram_username: '@auro', instagram_username: '-' },
        ]),
      });
    });

    // Rides route interception
    await page.route(/\/rest\/v1\/rides/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(RIDES),
      });
    });

    await page.route('**/rest/v1/ride_secrets**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });

    await page.route(/\/rest\/v1\/join_requests/, async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
    });

    await page.route(/\/rest\/v1\/general_requests/, async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
    });
  });

  test('Public ride card and Admin expanded card check', async ({ page }) => {
    // Go to homepage
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await dismissOnboarding(page);

    // 1. Check Public card on Bacheca
    await page.locator('.bottom-nav-bar').getByText('Bacheca').click();
    await expect(page.getByRole('heading', { name: 'Bacheca Viaggi' })).toBeVisible();

    const publicCard = page.locator('.ride-card', { hasText: 'Padova' });
    await expect(publicCard).toBeVisible();

    // Verify "Passa da: ..." matches Ravenna · Cesena · Città di Castello · Perugia
    await expect(publicCard.locator('.stops-info')).toContainText('Passa da: Ravenna · Cesena · Città di Castello · Perugia');

    // Verify compact notes preview without private contact (@auro should be removed or cleaned)
    const notesText = await publicCard.locator('.notes-preview').textContent();
    expect(notesText).not.toContain('@auro');
    expect(notesText).toContain('possible departure 1/2 days earlier');

    // 2. Login as admin and check Control Room expanded details
    await page.locator('.bottom-nav-bar').getByText('Profilo').click();
    await page.locator('#auth-email').fill('admin@roadtowao.local');
    await page.locator('#auth-password').fill('password123');
    await page.getByRole('button', { name: 'Accedi' }).click();
    await expect(page.getByRole('heading', { name: 'Auro', exact: true })).toBeVisible();

    await page.locator('.bottom-nav-bar').getByText('Messaggi').click();
    await page.getByRole('button', { name: '⚙️ Control Room demo' }).click();

    // Expand the Padova card
    const adminRideRow = page.locator('.cr-ride-header', { hasText: 'Padova' });
    await expect(adminRideRow).toBeVisible();
    await adminRideRow.click();

    // Verify structured info in Admin details block
    const detailsBlock = page.locator('.cr-admin-details');
    await expect(detailsBlock).toBeVisible();

    // Percorso
    await expect(detailsBlock).toContainText('Padova → Ravenna → Cesena → Città di Castello → Perugia → WAO Festival');

    // Tappe possibili
    await expect(detailsBlock).toContainText('Ravenna · Cesena · Città di Castello · Perugia');

    // Dettagli viaggio list
    await expect(detailsBlock).toContainText('Partenza: 11 agosto 2026 · mattina');
    await expect(detailsBlock).toContainText('Ritorno: Non indicato');
    await expect(detailsBlock).toContainText('Posti: 2 disponibili su 2');
    
    // Bagagli parsed from notes
    await expect(detailsBlock).toContainText('Bagagli: Fiat 500 / limited luggage · medio');

    // Flexibility parsed from notes
    await expect(detailsBlock).toContainText('Flessibilità: Possibile partenza 1/2 giorni prima');

    // original notes in box
    await expect(detailsBlock).toContainText('possible departure 1/2 days earlier | Fiat 500 / limited luggage');
  });
});

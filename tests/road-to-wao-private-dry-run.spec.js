import { test, expect } from '@playwright/test';

async function confirmAge(page) {
  const checkbox = page.locator('input[name="isOfAge"]');
  await checkbox.scrollIntoViewIfNeeded();
  const label = page.locator('label.checkbox-container', { has: checkbox });
  await label.click();
}

test('Road to WAO - Private Dry-Run Simulation (3 Users and Admin)', async ({ page }) => {
  // -------------------------------------------------------------
  // Role 1: Luca driver
  // -------------------------------------------------------------
  await test.step('Luca: Open app and publish a ride', async () => {
    // Open home page
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: 'Road to WAO', exact: true })).toBeVisible();

    // Go to Bacheca
    const bottomNav = page.locator('.bottom-nav-bar');
    await bottomNav.getByText('Bacheca').click();
    await expect(page.getByRole('heading', { name: 'Bacheca Viaggi' })).toBeVisible();

    // Click "Offri un passaggio"
    await page.getByRole('button', { name: 'Offri un passaggio' }).click();

    // Fill out the OfferRideModal
    await page.locator('#offer-nickname').fill('Luca');
    await page.locator('#offer-departureCity').fill('Milano');
    await page.locator('#offer-departureDate').fill('14 agosto');
    await page.locator('#offer-travelTime').selectOption('mattina');
    await page.locator('#offer-spots').selectOption('2 posti liberi');
    await page.locator('#offer-luggageCapacity').selectOption('poco');
    await page.locator('#offer-luggageDetails').fill('leggero');
    await page.locator('#offer-message').fill('Offro passaggio da Milano, auto spaziosa e tranquilla.');
    
    // Check the age confirmation checkbox
    await confirmAge(page);

    // Submit Offer
    await page.getByRole('button', { name: 'Pubblica Offerta' }).click();

    // Verify successful submission
    await expect(page.getByRole('heading', { name: 'Offerta inviata' })).toBeVisible();

    // Click "Torna alla bacheca" to close the modal
    await page.getByRole('button', { name: 'Torna alla bacheca' }).click();
  });

  await test.step('Luca: Verify ride in Bacheca and check Messages panel', async () => {
    // Verify ride appears in RoadBoard (Bacheca)
    const rideCard = page.locator('.ride-card', { hasText: 'Milano' }).filter({ hasText: 'Driver: Luca' });
    await expect(rideCard).toBeVisible();
    await expect(rideCard.getByText('2 posti liberi')).toBeVisible();

    // Go to Messaggi
    const bottomNav = page.locator('.bottom-nav-bar');
    await bottomNav.getByText('Messaggi').click();

    // Verify "Il tuo viaggio aperto" section / text
    await expect(page.getByRole('heading', { name: 'Il tuo viaggio aperto' })).toBeVisible();

    // Verify APERTO badge
    const driverRideCard = page.locator('.ride-card', { hasText: 'Il tuo viaggio aperto' });
    await expect(driverRideCard.locator('.ride-badge', { hasText: 'APERTO' })).toBeVisible();

    // Verify no Telegram button for driver ride
    await expect(driverRideCard.getByText('Apri Telegram Crew')).not.toBeVisible();
  });

  // -------------------------------------------------------------
  // Role 2: Sara passenger
  // -------------------------------------------------------------
  await test.step('Sara: Request to join Luca\'s ride', async () => {
    // Go back to Bacheca
    const bottomNav = page.locator('.bottom-nav-bar');
    await bottomNav.getByText('Bacheca').click();

    // Find Luca's ride card and click "Chiedi di unirti"
    const targetRideCard = page.locator('.ride-card', { hasText: 'Milano' }).filter({ hasText: 'Driver: Luca' });
    await targetRideCard.getByRole('button', { name: 'Chiedi di unirti' }).click();

    // Submit join request
    await page.locator('#nickname').fill('Sara');
    await page.locator('#passengers').selectOption('1');
    await page.locator('#luggageNeed').selectOption('leggero');
    await page.locator('#luggageDetails').fill('zaino');
    await page.locator('#message').fill('Cerco passaggio, sono flessibile');
    
    // Check the age confirmation checkbox
    await confirmAge(page);

    // Submit Request
    await page.getByRole('button', { name: 'Invia richiesta' }).click();

    // Verify success modal and go to messages
    await expect(page.getByRole('heading', { name: 'Richiesta inviata' })).toBeVisible();
    await page.getByRole('button', { name: 'Vai ai messaggi' }).click();
  });

  await test.step('Sara: Verify request is pending and no Telegram button is shown', async () => {
    // Verify specific request is pending/in approval
    const requestCard = page.locator('.ride-card', { hasText: 'Richiesta per Milano → WAO' });
    await expect(requestCard).toBeVisible();
    await expect(requestCard.getByText('Richiesta in approvazione')).toBeVisible();

    // Verify no Telegram button is shown yet
    await expect(requestCard.getByText('Apri Telegram Crew')).not.toBeVisible();
  });

  // -------------------------------------------------------------
  // Admin: Approve request
  // -------------------------------------------------------------
  await test.step('Admin: Open Control Room and approve Sara\'s request', async () => {
    // Open Control Room demo
    await page.getByRole('button', { name: '⚙️ Control Room demo' }).click();
    await expect(page.getByRole('heading', { name: 'Control Room' })).toBeVisible();

    // Find Luca/Milano ride and expand it
    const adminRideRow = page.locator('.cr-ride-header', { hasText: 'Milano' }).filter({ hasText: 'Luca' });
    await expect(adminRideRow).toBeVisible();
    await adminRideRow.click();

    // Find Sara's request row and click "Approva"
    const saraRequestRow = page.locator('.cr-join-row', { hasText: 'Sara' });
    await expect(saraRequestRow).toBeVisible();
    await saraRequestRow.getByRole('button', { name: 'Approva' }).click();

    // Verify seats decrease from 2 to 1
    await expect(adminRideRow.getByText('1/2 posti')).toBeVisible();

    // Close Control Room demo
    await page.getByRole('button', { name: '← Indietro' }).click();
  });

  // -------------------------------------------------------------
  // Passenger approved: Verify unlocked details
  // -------------------------------------------------------------
  await test.step('Sara: Verify approved request unlocks Telegram and updates profile state', async () => {
    // Go to Messaggi (we are redirected here after closing Control Room)
    await expect(page.getByRole('heading', { name: 'Messaggi' })).toBeVisible();

    // Verify "Crew sbloccata" status text
    const approvedCard = page.locator('.ride-card', { hasText: 'Richiesta per Milano → WAO' });
    await expect(approvedCard.getByText('Crew sbloccata')).toBeVisible();

    // Verify Telegram button appears
    await expect(approvedCard.getByText('Apri Telegram Crew')).toBeVisible();

    // Go to Profilo
    const bottomNav = page.locator('.bottom-nav-bar');
    await bottomNav.getByText('Profilo').click();

    // Verify "Crew attiva" state
    await expect(page.getByText('Crew attiva')).toBeVisible();
  });

  // -------------------------------------------------------------
  // Role 3: Marco general request
  // -------------------------------------------------------------
  await test.step('Marco: Create general request', async () => {
    // Go to Bacheca
    const bottomNav = page.locator('.bottom-nav-bar');
    await bottomNav.getByText('Bacheca').click();

    // Click "Lascia richiesta generale"
    await page.getByRole('button', { name: 'Lascia richiesta generale' }).click();

    // Submit general request form
    await page.locator('#nickname').fill('Marco');
    await page.locator('#departureCity').fill('Bologna');
    await page.locator('#passengers').selectOption('1');
    await page.locator('#luggageNeed').selectOption('camping');
    await page.locator('#luggageDetails').fill('tenda');
    await page.locator('#message').fill('Cerco passaggio o crew compatibile');

    // Check age confirmation
    await confirmAge(page);

    // Submit general request
    await page.getByRole('button', { name: 'Invia richiesta' }).click();

    // Verify success and navigate to messages
    await expect(page.getByRole('heading', { name: 'Richiesta inviata' })).toBeVisible();
    await page.getByRole('button', { name: 'Vai ai messaggi' }).click();
  });

  await test.step('Marco: Verify general request status and no Telegram link', async () => {
    // Verify "Richiesta generale per Bologna" is visible
    const generalCard = page.locator('.ride-card', { hasText: 'Richiesta generale per Bologna' });
    await expect(generalCard).toBeVisible();

    // Verify status is active (Attiva / Stiamo cercando...)
    await expect(generalCard.locator('.ride-badge', { hasText: 'Attiva' })).toBeVisible();
    await expect(generalCard.getByText('Stiamo cercando una crew compatibile.')).toBeVisible();

    // Verify no Telegram button for general request
    await expect(generalCard.getByText('Apri Telegram Crew')).not.toBeVisible();
  });

  await test.step('Admin: Open Control Room and archive Marco\'s general request', async () => {
    // Open Control Room demo
    await page.getByRole('button', { name: '⚙️ Control Room demo' }).click();
    await expect(page.getByRole('heading', { name: 'Control Room' })).toBeVisible();

    // Verify Marco appears under "Richieste generali"
    const marcoGenCard = page.locator('.cr-gen-card', { hasText: 'Marco' });
    await expect(marcoGenCard).toBeVisible();

    // Verify only Archive action is available (No Approve/Reject buttons)
    await expect(marcoGenCard.getByRole('button', { name: 'Archivia' })).toBeVisible();
    await expect(marcoGenCard.getByRole('button', { name: 'Approva' })).not.toBeVisible();
    await expect(marcoGenCard.getByRole('button', { name: 'Rifiuta' })).not.toBeVisible();

    // Click Archive
    await marcoGenCard.getByRole('button', { name: 'Archivia' }).click();

    // Verify Marco disappears from active general requests
    await expect(marcoGenCard).not.toBeVisible();
  });
});

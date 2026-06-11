# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: road-to-wao-private-dry-run.spec.js >> Road to WAO - Private Dry-Run Simulation (3 Users and Admin)
- Location: tests/road-to-wao-private-dry-run.spec.js:10:1

# Error details

```
Error: locator.fill: Target page, context or browser has been closed
Call log:
  - waiting for locator('#offer-nickname')

```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | async function confirmAge(page) {
  4   |   const checkbox = page.locator('input[name="isOfAge"]');
  5   |   await checkbox.scrollIntoViewIfNeeded();
  6   |   const label = page.locator('label.checkbox-container', { has: checkbox });
  7   |   await label.click();
  8   | }
  9   | 
  10  | test('Road to WAO - Private Dry-Run Simulation (3 Users and Admin)', async ({ page }) => {
  11  |   // -------------------------------------------------------------
  12  |   // Role 1: Luca driver
  13  |   // -------------------------------------------------------------
  14  |   await test.step('Luca: Open app and publish a ride', async () => {
  15  |     // Open home page
  16  |     await page.goto('/', { waitUntil: 'domcontentloaded' });
  17  |     await expect(page.getByRole('heading', { name: 'Road to WAO', exact: true })).toBeVisible();
  18  | 
  19  |     // Go to Bacheca
  20  |     const bottomNav = page.locator('.bottom-nav-bar');
  21  |     await bottomNav.getByText('Bacheca').click();
  22  |     await expect(page.getByRole('heading', { name: 'Bacheca Viaggi' })).toBeVisible();
  23  | 
  24  |     // Click "Offri un passaggio"
  25  |     await page.getByRole('button', { name: 'Offri un passaggio' }).click();
  26  | 
  27  |     // Fill out the OfferRideModal
> 28  |     await page.locator('#offer-nickname').fill('Luca');
      |                                           ^ Error: locator.fill: Target page, context or browser has been closed
  29  |     await page.locator('#offer-departureCity').fill('Milano');
  30  |     await page.locator('#offer-departureDate').fill('14 agosto');
  31  |     await page.locator('#offer-travelTime').selectOption('mattina');
  32  |     await page.locator('#offer-spots').selectOption('2 posti liberi');
  33  |     await page.locator('#offer-luggageCapacity').selectOption('poco');
  34  |     await page.locator('#offer-luggageDetails').fill('leggero');
  35  |     await page.locator('#offer-message').fill('Offro passaggio da Milano, auto spaziosa e tranquilla.');
  36  |     
  37  |     // Check the age confirmation checkbox
  38  |     await confirmAge(page);
  39  | 
  40  |     // Submit Offer
  41  |     await page.getByRole('button', { name: 'Pubblica Offerta' }).click();
  42  | 
  43  |     // Verify successful submission
  44  |     await expect(page.getByRole('heading', { name: 'Offerta inviata' })).toBeVisible();
  45  | 
  46  |     // Click "Torna alla bacheca" to close the modal
  47  |     await page.getByRole('button', { name: 'Torna alla bacheca' }).click();
  48  |   });
  49  | 
  50  |   await test.step('Luca: Verify ride in Bacheca and check Messages panel', async () => {
  51  |     // Verify ride appears in RoadBoard (Bacheca)
  52  |     const rideCard = page.locator('.ride-card', { hasText: 'Milano' }).filter({ hasText: 'Driver: Luca' }).filter({ hasText: '2 posti liberi' });
  53  |     await expect(rideCard).toBeVisible();
  54  |     await expect(rideCard.getByText('2 posti liberi')).toBeVisible();
  55  | 
  56  |     // Go to Messaggi
  57  |     const bottomNav = page.locator('.bottom-nav-bar');
  58  |     await bottomNav.getByText('Messaggi').click();
  59  | 
  60  |     // Verify "Il tuo viaggio aperto" section / text
  61  |     await expect(page.getByRole('heading', { name: 'Il tuo viaggio aperto' })).toBeVisible();
  62  | 
  63  |     // Verify APERTO badge
  64  |     const driverRideCard = page.locator('.ride-card', { hasText: 'Il tuo viaggio aperto' });
  65  |     await expect(driverRideCard.locator('.ride-badge', { hasText: 'APERTO' })).toBeVisible();
  66  | 
  67  |     // Verify no Telegram button for driver ride
  68  |     await expect(driverRideCard.getByText('Apri Telegram Crew')).not.toBeVisible();
  69  |   });
  70  | 
  71  |   // -------------------------------------------------------------
  72  |   // Role 2: Sara passenger
  73  |   // -------------------------------------------------------------
  74  |   await test.step('Sara: Request to join Luca\'s ride', async () => {
  75  |     // Go back to Bacheca
  76  |     const bottomNav = page.locator('.bottom-nav-bar');
  77  |     await bottomNav.getByText('Bacheca').click();
  78  | 
  79  |     // Find Luca's ride card and click "Chiedi di unirti"
  80  |     const targetRideCard = page.locator('.ride-card', { hasText: 'Milano' }).filter({ hasText: 'Driver: Luca' }).filter({ hasText: '2 posti liberi' });
  81  |     await targetRideCard.getByRole('button', { name: 'Chiedi di unirti' }).click();
  82  | 
  83  |     // Submit join request
  84  |     await page.locator('#nickname').fill('Sara');
  85  |     await page.locator('#passengers').selectOption('1');
  86  |     await page.locator('#luggageNeed').selectOption('leggero');
  87  |     await page.locator('#luggageDetails').fill('zaino');
  88  |     await page.locator('#message').fill('Cerco passaggio, sono flessibile');
  89  |     
  90  |     // Check the age confirmation checkbox
  91  |     await confirmAge(page);
  92  | 
  93  |     // Submit Request
  94  |     await page.getByRole('button', { name: 'Invia richiesta' }).click();
  95  | 
  96  |     // Verify success modal and go to messages
  97  |     await expect(page.getByRole('heading', { name: 'Richiesta inviata' })).toBeVisible();
  98  |     await page.getByRole('button', { name: 'Vai ai messaggi' }).click();
  99  |   });
  100 | 
  101 |   await test.step('Sara: Verify request is pending and no Telegram button is shown', async () => {
  102 |     // Verify specific request is pending/in approval
  103 |     const requestCard = page.locator('.ride-card', { hasText: 'Richiesta per Milano → WAO' });
  104 |     await expect(requestCard).toBeVisible();
  105 |     await expect(requestCard.getByText('Richiesta in approvazione')).toBeVisible();
  106 | 
  107 |     // Verify no Telegram button is shown yet
  108 |     await expect(requestCard.getByText('Apri Telegram Crew')).not.toBeVisible();
  109 |   });
  110 | 
  111 |   // -------------------------------------------------------------
  112 |   // Admin: Approve request
  113 |   // -------------------------------------------------------------
  114 |   await test.step('Admin: Open Control Room and approve Sara\'s request', async () => {
  115 |     // Open Control Room demo
  116 |     await page.getByRole('button', { name: '⚙️ Control Room demo' }).click();
  117 |     await expect(page.getByRole('heading', { name: 'Control Room' })).toBeVisible();
  118 | 
  119 |     // Find Luca/Milano ride and expand it
  120 |     const adminRideRow = page.locator('.cr-ride-header', { hasText: 'Milano' }).filter({ hasText: 'Luca' }).filter({ hasText: '14 agosto' });
  121 |     await expect(adminRideRow).toBeVisible();
  122 |     await adminRideRow.click();
  123 | 
  124 |     // Find Sara's request row and click "Approva"
  125 |     const saraRequestRow = page.locator('.cr-join-row', { hasText: 'Sara' });
  126 |     await expect(saraRequestRow).toBeVisible();
  127 |     await saraRequestRow.getByRole('button', { name: 'Approva' }).click();
  128 | 
```
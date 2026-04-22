import { expect, test } from '@playwright/test';

test.setTimeout(60_000);

test('keyboard-only booking flow from signup to appointment', async ({ page }) => {
  const email = `pw-${Date.now()}@example.com`;
  const password = 'Password123!';

  await page.goto('/signup');
  await expect(page).toHaveTitle('PetPortal');

  await page.locator('#firstName').fill('Play');
  await page.locator('#lastName').fill('Wright');
  await page.locator('#email').fill(email);
  await page.locator('#password').fill(password);
  await page.locator('#confirmPassword').fill(password);
  await page.locator('#phone').fill('555-0100');
  await page.locator('#address').fill('1 Playwright Way');

  await page.getByRole('button', { name: 'Create account' }).focus();
  await page.keyboard.press('Enter');

  await page.waitForURL('**/pets');
  await expect(page.getByRole('heading', { name: 'My pets' })).toBeVisible();

  await page.getByRole('button', { name: 'Add pet' }).focus();
  await page.keyboard.press('Enter');

  await expect(page.getByRole('dialog')).toBeVisible();
  await page.locator('#name').fill('Rex');
  await page.getByRole('button', { name: 'Save' }).focus();
  await page.keyboard.press('Enter');

  await expect(page.getByText('Rex', { exact: true })).toBeVisible();

  await page.goto('/book');
  await expect(page.getByRole('heading', { name: 'Book an appointment' })).toBeVisible();

  await page.getByRole('radio').first().focus();
  await page.keyboard.press('Space');
  await page.getByRole('button', { name: 'Next' }).focus();
  await page.keyboard.press('Enter');

  await expect(page.getByRole('heading', { name: 'Pick a vet' })).toBeVisible();
  await page.getByRole('radio').first().focus();
  await page.keyboard.press('Space');
  await page.getByRole('button', { name: 'Next' }).focus();
  await page.keyboard.press('Enter');

  await expect(page.getByRole('heading', { name: 'Pick a date' })).toBeVisible();
  const target = new Date();
  target.setUTCDate(target.getUTCDate() + 7);
  while (target.getUTCDay() === 0 || target.getUTCDay() === 6) {
    target.setUTCDate(target.getUTCDate() + 1);
  }
  const mm = String(target.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(target.getUTCDate()).padStart(2, '0');
  const yyyy = target.getUTCFullYear();
  const datePicker = page.getByRole('group', { name: 'Appointment date' });
  const sections = datePicker.getByRole('spinbutton');
  await sections.first().focus();
  await page.keyboard.type(`${mm}${dd}${yyyy}`, { delay: 50 });
  await page.waitForTimeout(300);
  await page.keyboard.press('Tab');
  await page.getByRole('button', { name: 'Next' }).focus();
  await expect(page.getByRole('button', { name: 'Next' })).toBeEnabled();
  await page.keyboard.press('Enter');

  await expect(page.getByRole('heading', { name: 'Pick a time' })).toBeVisible();
  const firstSlot = page.getByRole('group', { name: 'Available time slots' }).getByRole('button').first();
  await firstSlot.focus();
  await page.keyboard.press('Enter');
  await page.getByRole('button', { name: 'Next' }).focus();
  await page.keyboard.press('Enter');

  await expect(page.getByRole('heading', { name: 'Pick a pet' })).toBeVisible();
  await page.getByRole('radio').first().focus();
  await page.keyboard.press('Space');
  await page.getByRole('button', { name: 'Next' }).focus();
  await page.keyboard.press('Enter');

  await expect(page.getByRole('heading', { name: 'Confirm your appointment' })).toBeVisible();
  const confirmButton = page.getByRole('button', { name: /Confirm booking/ });
  await expect(confirmButton).toBeEnabled();
  await confirmButton.focus();
  await page.keyboard.press('Enter');

  await page.waitForURL('**/appointments');
  await expect(page.getByRole('heading', { name: 'My appointments' })).toBeVisible();
  await expect(page.getByText(/INV-\d+/).first()).toBeVisible();
});

import { test, expect } from "@playwright/test";

test("can create new account using e-mail and password", async ({ page }) => {
  // Visit the home page
  await page.goto("/");

  // Click on the "My account" button
  const myProfileLink = await page.waitForSelector(`text=Contul meu`);
  await myProfileLink.click();

  // Wait for the page to load
  await page.waitForSelector(`text=Intră în cont`);

  // Go to the e-mail login page
  await page.click(`text=Autentificare prin e-mail`);

  await page.waitForSelector(`input[type=submit]:text("Autentifică-te")`);

  // Choose the option to create a new account
  await page.click(`text=Nu ai încă cont?`);

  await page.waitForSelector(`input[type=text][name=name]`);

  // Generate some fake user data
  const nonce = Math.floor(Math.random() * 65536);
  const email = `example${nonce}@example.com`;
  const name = "Example User";
  const password = "a12345678";

  // Fill in the registration form
  await page.fill(`[name=email]`, email);
  await page.fill(`[name=name]`, name);
  await page.fill(`[name=password]`, password);
  await page.fill(`[name=passwordConfirmation]`, password);
  await page.check(`[name=consent]`);

  const registerButton = await page.waitForSelector(
    `input[type=submit]:is(:text("Înregistrează-te"))`
  );
  await registerButton.click();

  // Wait for the registration to finish
  await page.waitForLoadState("networkidle");

  // Check that a success message is displayed
  const successMessage = "Înregistrarea s-a efectuat cu succes!";
  await page.waitForSelector(`h2:text("${successMessage}")`);
});

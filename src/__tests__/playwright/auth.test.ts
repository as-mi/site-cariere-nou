import { test, expect } from "@playwright/test";

test("can create new account using e-mail and password", async ({ page }) => {
  await page.goto("/");

  const myProfileLink = await page.waitForSelector(`text=Contul meu`);

  await myProfileLink.click();

  await page.waitForSelector(`text=Intră în cont`);

  await page.click(`text=Autentificare prin e-mail`);

  await page.waitForSelector(`input[type=submit]:is(:text("Autentifică-te"))`);

  await page.click(`text=Nu ai încă cont?`);

  const registerButton = await page.waitForSelector(
    `input[type=submit]:is(:text("Înregistrează-te"))`
  );

  const nonce = Math.floor(Math.random() * 65536);
  const email = `example${nonce}@example.com`;
  const name = "Example User";
  const password = "12345678";

  await page.fill(`[name=email]`, email);
  await page.fill(`[name=name]`, name);
  await page.fill(`[name=password]`, password);
  await page.fill(`[name=passwordConfirmation]`, password);
  await page.check(`[name=consent]`);

  await registerButton.click();

  await page.waitForLoadState("networkidle");

  const mainElement = await page.waitForSelector("main");

  expect(await mainElement.textContent()).toContain(
    "Înregistrarea s-a efectuat cu succes!"
  );
});

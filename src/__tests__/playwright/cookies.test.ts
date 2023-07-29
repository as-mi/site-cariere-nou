import { test, expect } from "@playwright/test";

test("shows cookie consent banner on first visit", async ({
  page,
  context,
}) => {
  let cookies = await context.cookies();
  expect(cookies.map((cookie) => cookie.name)).not.toContain("cookies-consent");

  // Visit the home page
  await page.goto("/");

  await page.waitForSelector(`text=Acest site utilizează cookie-uri`);

  const acceptCookiesButton = await page.waitForSelector(`button:text("OK")`);
  await acceptCookiesButton.click();

  // Reload cookies
  cookies = await context.cookies();
  expect(cookies.map((cookie) => cookie.name)).toContain("cookies-consent");

  // Visit the home page again
  await page.goto("/");

  // Make sure the cookie banner isn't shown
  const cookieBannerText = page.locator(
    `text=Acest site utilizează cookie-uri`,
  );
  expect(await cookieBannerText.count()).toBe(0);
});

import { test } from "@playwright/test";

test("can upload resumes with special characters in file name", async ({
  page,
}) => {
  // Try to visit the profile page
  await page.goto("/profile");

  // Go to the e-mail login page
  await page.click(`text=Autentificare prin e-mail`);

  await page.waitForSelector(`input[type=submit]:text("Autentifică-te")`);

  const email = "participant@test";
  const password = "password";

  // Fill in the login form
  await page.fill(`[name=email]`, email);
  await page.fill(`[name=password]`, password);

  await page.click(`text=Autentifică-te`);

  // Wait for the login process to finish
  await page.waitForLoadState("networkidle");

  // Make sure that we're logged in successfully
  await page.waitForSelector(`text=Profilul meu`);

  const addResumeButton = await page.waitForSelector(`text="Adaugă un CV"`);
  await addResumeButton.click();

  const resumeFileName = "CV ăâîsț é 人.pdf";
  await page.setInputFiles("input[type='file']", {
    name: resumeFileName,
    mimeType: "application/pdf",
    buffer: Buffer.alloc(1),
  });

  await page.click(`text=Încarcă`);

  // Check that the file was saved correctly
  await page.waitForSelector(`text=CV-ul numărul 1`);
  await page.waitForSelector(`text=${resumeFileName}`);
});

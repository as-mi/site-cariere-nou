/**
 * @type {import('next-i18next').UserConfig}
 */
module.exports = {
  localePath: "./src/locales",
  i18n: {
    localeDetection: false,
    defaultLocale: "ro",
    locales: ["ro", "en"],
  },
  keySeparator: ".",
  reloadOnPrerender: process.env.NODE_ENV === "development",
};

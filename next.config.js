const { i18n } = require("./next-i18next.config");

/** @type {import('next').NextConfig} */
const nextConfig = {
  i18n,
  reactStrictMode: true,
  swcMinify: true,
  async redirects() {
    return [
      {
        source: "/auth",
        destination: "/auth/login",
        permanent: true,
      },
      {
        source: "/cookie-policy",
        destination: "/legal/Politica de cookie-uri.pdf",
        permanent: false,
      },
      {
        source: "/privacy-policy",
        destination: "/legal/Politica de confidențialitate.pdf",
        permanent: false,
      },
      {
        source: "/terms-of-service",
        destination: "/legal/Termeni și condiții.pdf",
        permanent: false,
      },
    ];
  },
  experimental: {
    scrollRestoration: true,
  },
};

module.exports = nextConfig;

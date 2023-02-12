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
    ];
  },
  images: {
    remotePatterns: [
      // Allow loading images dynamically from the back end
      {
        protocol: "http",
        hostname: "localhost",
        port: `${process.env.PORT ?? 3000}`,
        pathname: "/api/images/*",
      },
    ],
  },
};

module.exports = nextConfig;

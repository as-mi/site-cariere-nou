export const getBaseUrl = (): string => {
  if (typeof window !== "undefined") {
    // Code running on the client should use relative path
    return "";
  }

  // In production, we'll rely on the same environment variable that NextAuth.js uses
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL;
  }

  // Otherwise, assume the development server is accessible on localhost
  return `http://localhost:${process.env.PORT ?? 3000}`;
};

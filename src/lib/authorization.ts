export const redirectToLoginPage = (returnUrl: string) => ({
  redirect: {
    destination: `/auth/login?authenticationRequired&callbackUrl=${encodeURIComponent(
      returnUrl
    )}`,
    permanent: false,
  },
});

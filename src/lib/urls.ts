export const getLoginPageUrl = (
  authenticationRequired: boolean = false,
  returnUrl?: string
) =>
  `/auth/login?${authenticationRequired ? `&authenticationRequired` : ""}${
    returnUrl ? `&callbackUrl=${encodeURIComponent(returnUrl)}` : ""
  }`;

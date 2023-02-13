/** Minimum length new passwords must have. */
export const MIN_PASSWORD_LENGTH = 6;

/** Maximum length new passwords can have. */
export const MAX_PASSWORD_LENGTH = 30;

/** Checks that the given password contains at least one digit. */
export const mustHaveDigit = (password: string): boolean => /\d/.test(password);

/** Checks that the given password contains at least one alphabetic character. */
export const mustHaveAlpha = (password: string): boolean =>
  /[a-zA-Z]/.test(password);

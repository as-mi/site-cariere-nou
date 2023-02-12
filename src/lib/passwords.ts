
export const MIN_PASSWORD_LENGTH = 6;

export const MAX_PASSWORD_LENGTH = 30;

export const mustHaveDigit = (password: string): boolean => /[0-9]/.test(password);

export const mustHaveAlpha = (password: string): boolean => /[a-zA-Z]/.test(password);
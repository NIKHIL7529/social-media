export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 30;
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 40;
export const PASSWORD_REQUIREMENTS = `Use ${PASSWORD_MIN_LENGTH} to ${PASSWORD_MAX_LENGTH} characters, with a capital letter, a lowercase letter, a number, and a symbol (such as ! or @).`;

export function usernameError(value: string): string | null {
  const length = Array.from(value).length;
  if (length < USERNAME_MIN_LENGTH || length > USERNAME_MAX_LENGTH) {
    return `Choose a username with ${USERNAME_MIN_LENGTH} to ${USERNAME_MAX_LENGTH} characters.`;
  }
  return /^[\p{L}\p{N}._]+$/u.test(value) && /[\p{L}\p{N}]/u.test(value)
    ? null
    : "Use letters, numbers, dots, or underscores, including at least one letter or number. Please remove any spaces.";
}

export function passwordError(value: string): string | null {
  const length = Array.from(value).length;
  if (length < PASSWORD_MIN_LENGTH || length > PASSWORD_MAX_LENGTH) {
    return `Choose a password with ${PASSWORD_MIN_LENGTH} to ${PASSWORD_MAX_LENGTH} characters.`;
  }
  if (
    !/[A-Z]/.test(value) || !/[a-z]/.test(value)
    || !/[0-9]/.test(value) || !/[^\p{L}\p{N}\s]/u.test(value)
  ) return PASSWORD_REQUIREMENTS;
  return new TextEncoder().encode(value).length > 72
    ? "This password contains too many special characters. Try fewer emojis or accented letters."
    : null;
}

export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 30;
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 40;
export const PASSWORD_REQUIREMENTS = `Use ${PASSWORD_MIN_LENGTH} to ${PASSWORD_MAX_LENGTH} characters, with a capital letter, a lowercase letter, a number, and a symbol (such as ! or @).`;

export function usernameError(value: string): string | null {
  if (!value) return "Enter a username.";
  if (value.includes("@"))
    return "Username cannot be an email address or contain @.";
  const length = Array.from(value).length;
  if (length < USERNAME_MIN_LENGTH || length > USERNAME_MAX_LENGTH) {
    return `Choose a username with ${USERNAME_MIN_LENGTH} to ${USERNAME_MAX_LENGTH} characters.`;
  }
  if (/\s/u.test(value)) {
    return "Username cannot contain spaces or other whitespace.";
  }
  return /^[\p{L}\p{N}._]+$/u.test(value) && /[\p{L}\p{N}]/u.test(value)
    ? null
    : "Username: use letters, numbers, dots, or underscores, including at least one letter or number.";
}

export function passwordError(value: string): string | null {
  if (!value) return "Enter a password.";
  const length = Array.from(value).length;
  if (length < PASSWORD_MIN_LENGTH || length > PASSWORD_MAX_LENGTH) {
    return `Choose a password with ${PASSWORD_MIN_LENGTH} to ${PASSWORD_MAX_LENGTH} characters.`;
  }
  const missing = [
    !/[A-Z]/.test(value) && "a capital letter",
    !/[a-z]/.test(value) && "a lowercase letter",
    !/[0-9]/.test(value) && "a number",
    !/[^\p{L}\p{N}\s]/u.test(value) && "a symbol (such as ! or @)",
  ].filter(Boolean);
  if (missing.length) return `Password must include ${missing.join(", ")}.`;
  return new TextEncoder().encode(value).length > 72
    ? "This password contains too many special characters. Try fewer emojis or accented letters."
    : null;
}

export function emailError(value: string): string | null {
  if (!value) return "Enter your email address.";
  if (/\s/u.test(value))
    return "Email cannot contain spaces or other whitespace.";
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/u.test(value)
    ? null
    : "Enter a valid email address, such as name@example.com.";
}

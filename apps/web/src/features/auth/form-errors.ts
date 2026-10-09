import { ApiError } from "@/lib/api";
import { emailError, passwordError, usernameError } from "./auth-validation";

export type FieldErrors = Partial<Record<string, string>>;
export const genderOptions = ["Female", "Male", "Non-binary", "Prefer not to say"];

export function signupErrors(form: { username: string; email: string; password: string; dob: string; gender: string }, step: number): FieldErrors {
  const errors: FieldErrors = {};
  const checks = { username: usernameError(form.username), email: emailError(form.email), password: passwordError(form.password) };
  for (const [field, message] of Object.entries(checks)) if (message) errors[field] = message;
  if (step > 0) {
    const date = new Date(`${form.dob}T00:00:00Z`);
    if (!form.dob) errors.dob = "Enter your date of birth.";
    else if (!/^\d{4}-\d{2}-\d{2}$/.test(form.dob) || !Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== form.dob) errors.dob = "Enter a valid date of birth.";
    if (!genderOptions.includes(form.gender)) errors.gender = "Select a gender option.";
  }
  return errors;
}

export function loginErrors(name: string, password: string): FieldErrors {
  const errors: FieldErrors = {};
  if (!name) errors.name = "Enter your username or email address.";
  else if (/\s/u.test(name)) errors.name = "Username or email cannot contain spaces or other whitespace.";
  else if (name.includes("@")) {
    const message = emailError(name);
    if (message) errors.name = message;
  }
  if (!password) errors.password = "Enter your password.";
  return errors;
}

export function serverFieldErrors(error: unknown, allowed: string[]): FieldErrors {
  if (!(error instanceof ApiError)) return {};
  const detail = (error.data as { detail?: unknown } | null)?.detail;
  if (!Array.isArray(detail)) return {};
  const errors: FieldErrors = {};
  for (const issue of detail) {
    const field = Array.isArray(issue?.loc) ? issue.loc[1] : undefined;
    if (typeof field === "string" && allowed.includes(field) && typeof issue.msg === "string") {
      errors[field] = issue.msg.replace(/^Value error, /, "");
    }
  }
  return errors;
}

export function submissionError(error: unknown, fallback: string): string {
  if (error instanceof ApiError && error.status === 0) return "Unable to connect. Please try again.";
  if (error instanceof ApiError && error.status >= 500) return "Something went wrong. Please try again.";
  return error instanceof Error ? error.message : fallback;
}

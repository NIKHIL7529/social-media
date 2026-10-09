"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowRight, LockKeyhole, UserRound } from "lucide-react";

import { authService } from "@/features/auth/auth-service";
import { resetAuthForLogin } from "@/features/auth/auth-cache";
import { AuthLayout } from "@/features/auth/auth-layout";
import { loginErrors, serverFieldErrors, submissionError, type FieldErrors } from "@/features/auth/form-errors";
import { TextField } from "@/components/form-controls";

export default function LoginPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const pending = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (pending.current) return;
    const validationErrors = loginErrors(name, password);
    setErrors(validationErrors);
    setFormError("");
    if (Object.keys(validationErrors).length) {
      requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
      return;
    }
    pending.current = true;
    setSubmitting(true);
    try {
      const data = await toast.promise(authService.login({ name, password }), {
        loading: "Signing in...",
        success: "Welcome back",
        error: (error) => Object.keys(serverFieldErrors(error, ["name", "password"])).length
          ? "Please correct the highlighted fields."
          : /incorrect credentials/i.test(error.message)
            ? "Username/email or password is incorrect."
            : submissionError(error, "Could not log in"),
      });
      resetAuthForLogin(queryClient, data.user);
      router.push("/posts");
    } catch (error) {
      const fieldErrors = serverFieldErrors(error, ["name", "password"]);
      setErrors(fieldErrors);
      if (Object.keys(fieldErrors).length) requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
      else setFormError(error instanceof Error && /incorrect credentials/i.test(error.message) ? "Username/email or password is incorrect." : submissionError(error, "Could not log in. Please try again."));
    } finally {
      pending.current = false;
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout>
          <form ref={formRef} noValidate onSubmit={submit} className="auth-card">
            <h2 className="text-center text-3xl font-extrabold tracking-tight text-[#09121c] sm:text-4xl">Welcome back</h2>
            <p className="mt-3 text-center text-sm text-ink-muted sm:text-base">Log in to continue to your sphere.</p>
            <div className="auth-login-fields mt-7 grid gap-4">
              <TextField label="Username or email" error={errors.name} disabled={submitting} leadingIcon={<UserRound size={21} />} autoComplete="username" autoCapitalize="none" spellCheck={false} placeholder="Enter your username or email" value={name} onChange={(value) => { setName(value); setErrors((current) => ({ ...current, name: undefined })); setFormError(""); }} required />
              <TextField label="Password" error={errors.password} disabled={submitting} leadingIcon={<LockKeyhole size={21} />} autoComplete="current-password" placeholder="Enter your password" type="password" value={password} onChange={(value) => { setPassword(value); setErrors((current) => ({ ...current, password: undefined })); setFormError(""); }} required />
            </div>
            {formError && <div role="alert" className="mt-4 text-sm font-medium text-red-700">{formError}</div>}
            <button disabled={submitting} className="auth-submit mt-8">{submitting ? "Signing in..." : "Login"} <ArrowRight size={23} aria-hidden="true" /></button>
            <p className="mt-7 text-center text-sm leading-relaxed text-ink-muted">
              New here? <Link className="font-bold text-accent-deep underline-offset-4 hover:underline" href="/signup">Create an account</Link>
            </p>
          </form>
    </AuthLayout>
  );
}

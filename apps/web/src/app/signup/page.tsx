"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useRef, useState } from "react";
import toast from "react-hot-toast";

import { SelectField, TextAreaField, TextField } from "@/components/form-controls";
import { ImageUploadField } from "@/components/image-upload-field";
import { jsonPost } from "@/lib/api";
import { ArrowLeft, ArrowRight, LockKeyhole, Mail, UserRound } from "lucide-react";
import { AuthLayout } from "@/features/auth/auth-layout";
import { USERNAME_MIN_LENGTH, USERNAME_MAX_LENGTH, PASSWORD_MIN_LENGTH, PASSWORD_MAX_LENGTH, PASSWORD_REQUIREMENTS } from "@/features/auth/auth-validation";

import { genderOptions, signupErrors, serverFieldErrors, submissionError, type FieldErrors } from "@/features/auth/form-errors";

const SIGNUP_TITLES = ["Create your account", "Tell us about you", "Make your sphere yours"] as const;

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const [submitting, setSubmitting] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const pending = useRef(false);

  function goToStep(next: number) {
    setStep(next);
    heading.current?.focus();
  }
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    dob: "",
    gender: "",
    city: "",
    country: "",
    description: "",
    photo: "",
  });

  function updateField(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setFormError("");
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (pending.current) return;
    const validationErrors = signupErrors(form, step);
    setErrors(validationErrors);
    setFormError("");
    if (Object.keys(validationErrors).length) {
      goToStep(validationErrors.username || validationErrors.email || validationErrors.password ? 0 : 1);
      requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
      return;
    }
    if (step < SIGNUP_TITLES.length - 1) {
      goToStep(step + 1);
      return;
    }
    pending.current = true;
    setSubmitting(true);
    try {
      await toast.promise(jsonPost("/api/user/signup", form), {
        loading: "Creating account...",
        success: "Account created",
        error: (error) => Object.keys(serverFieldErrors(error, Object.keys(form))).length
          ? "Please correct the highlighted fields."
          : submissionError(error, "Could not sign up"),
      });
      router.push("/login");
    } catch (error) {
      const fieldErrors = serverFieldErrors(error, Object.keys(form));
      setErrors(fieldErrors);
      if (Object.keys(fieldErrors).length) {
        goToStep(fieldErrors.username || fieldErrors.email || fieldErrors.password ? 0 : fieldErrors.dob || fieldErrors.gender || fieldErrors.city || fieldErrors.country ? 1 : 2);
        requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
      } else setFormError(submissionError(error, "Could not create your account. Please try again."));
    } finally {
      pending.current = false;
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout signup
      mobileTitle={step === 0 ? <>Create <span>your account</span></> : step === 1 ? <>Tell us <span>about you</span></> : <>Make your <span>sphere yours</span></>}
      mobileSubtitle={step === 0 ? "Be part of a community that feels like home." : step === 1 ? "A little about the person behind the profile." : "Add your own touch with a photo and a few words."}
    >
      <form ref={formRef} noValidate onSubmit={submit} className="auth-card">
        <h1 ref={heading} tabIndex={-1} className="text-2xl font-extrabold tracking-tight text-[#09121c] outline-none sm:text-3xl">{SIGNUP_TITLES[step]}</h1>
        <fieldset disabled={submitting} className="mt-7 min-w-0">
          <legend className="sr-only">{step === 0 ? "Your account details" : SIGNUP_TITLES[step]}</legend>
          <div className="signup-fields grid min-w-0 gap-4">
            {step === 0 && <>
              <TextField label="Username" error={errors.username} leadingIcon={<UserRound size={21} />} placeholder="Enter your username" value={form.username} onChange={(username) => updateField("username", username.toLowerCase())} minLength={USERNAME_MIN_LENGTH} maxLength={USERNAME_MAX_LENGTH} autoComplete="username" autoCapitalize="none" spellCheck={false} required />
              <TextField label="Email" error={errors.email} leadingIcon={<Mail size={21} />} placeholder="Enter your email" type="email" value={form.email} onChange={(email) => updateField("email", email)} autoComplete="email" required />
              <TextField label="Password" error={errors.password} leadingIcon={<LockKeyhole size={21} />} placeholder="Create a password" type="password" value={form.password} onChange={(password) => updateField("password", password)} minLength={PASSWORD_MIN_LENGTH} maxLength={PASSWORD_MAX_LENGTH} autoComplete="new-password" required />
              <p className="text-xs leading-relaxed text-ink-muted">{PASSWORD_REQUIREMENTS}</p>
            </>}
            {step === 1 && <>
              <TextField label="Date of birth" error={errors.dob} type="date" value={form.dob} onChange={(dob) => updateField("dob", dob)} autoComplete="bday" required />
              <SelectField label="Gender" error={errors.gender} value={form.gender} onChange={(gender) => updateField("gender", gender)} required>
                <option value="" disabled>Select gender</option>
                {genderOptions.map((option) => <option key={option}>{option}</option>)}
              </SelectField>
              <TextField label="City" error={errors.city} value={form.city} onChange={(city) => updateField("city", city)} autoComplete="address-level2" />
              <TextField label="Country" error={errors.country} value={form.country} onChange={(country) => updateField("country", country)} autoComplete="country-name" />
            </>}
            {step === 2 && <>
              <div className="signup-photo mx-auto w-full max-w-[200px]">
                <ImageUploadField label="Profile photo preview" error={errors.photo} emptyText="Choose profile photo" aspectClass="aspect-square" preview={form.photo} onChange={(photo) => updateField("photo", photo)} />
              </div>
              <TextAreaField label="Description" error={errors.description} value={form.description} onChange={(description) => updateField("description", description)} />
            </>}
          </div>
        </fieldset>
        {formError && <div role="alert" className="mt-4 text-sm font-medium text-red-700">{formError}</div>}
        <div className="mt-7 flex items-center gap-3">
          {step > 0 && <button type="button" disabled={submitting} onClick={() => goToStep(step - 1)} className="flex min-h-12 items-center gap-2 rounded-xl px-3 text-sm font-bold text-accent-deep focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent disabled:opacity-50"><ArrowLeft size={18} aria-hidden="true" /> Back</button>}
          <button type="submit" disabled={submitting} className="auth-submit flex-1">
            {submitting ? "Creating account..." : step === 2 ? "Create account" : "Continue"}<ArrowRight size={20} aria-hidden="true" />
          </button>
        </div>
        <p className="mt-6 text-center text-sm text-ink-muted">Already have an account? <Link className="font-bold text-accent-deep underline-offset-4 hover:underline" href="/login">Log in</Link></p>
      </form>
    </AuthLayout>
  );
}

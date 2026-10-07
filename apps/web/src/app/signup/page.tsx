"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import toast from "react-hot-toast";

import { SelectField, TextAreaField, TextField } from "@/components/form-controls";
import { ImageUploadField } from "@/components/image-upload-field";
import { jsonPost } from "@/lib/api";
import { Brand } from "@/components/brand";
import { USERNAME_MIN_LENGTH, USERNAME_MAX_LENGTH, PASSWORD_MIN_LENGTH, PASSWORD_MAX_LENGTH, PASSWORD_REQUIREMENTS, passwordError, usernameError } from "@/features/auth/auth-validation";

const genderOptions = ["Female", "Male", "Non-binary", "Prefer not to say"];

export default function SignupPage() {
  const router = useRouter();
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

  async function submit(event: FormEvent) {
    event.preventDefault();
    const validationError = usernameError(form.username)
      || (/\s/u.test(form.email) ? "Email cannot contain spaces or other whitespace." : null)
      || passwordError(form.password);
    if (validationError) {
      toast.error(validationError);
      return;
    }
    try {
      await toast.promise(jsonPost("/api/user/signup", form), {
        loading: "Creating account...",
        success: "Account created",
        error: (error) => error.message || "Could not sign up",
      });
      router.push("/login");
    } catch {
      // toast.promise already renders the actionable error.
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-page px-4 py-8">
      <form onSubmit={submit} className="w-full max-w-xl rounded-lg border border-line bg-white p-6 shadow-card">
        <Brand href="/posts" priority showTagline />
        <h1 className="mt-8 text-2xl font-extrabold text-ink">Create your account</h1>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <TextField label="Username" value={form.username} onChange={(username) => setForm({ ...form, username: username.toLowerCase() })} minLength={USERNAME_MIN_LENGTH} maxLength={USERNAME_MAX_LENGTH} autoComplete="username" required />
          <TextField label="Email" type="email" value={form.email} onChange={(email) => setForm({ ...form, email })} required />
          <TextField label="Password" type="password" value={form.password} onChange={(password) => setForm({ ...form, password })} minLength={PASSWORD_MIN_LENGTH} maxLength={PASSWORD_MAX_LENGTH} autoComplete="new-password" required />
          <TextField label="Date of birth" type="date" value={form.dob} onChange={(dob) => setForm({ ...form, dob })} required />
          <SelectField label="Gender" value={form.gender} onChange={(gender) => setForm({ ...form, gender })} required>
            <option value="" disabled>Select gender</option>
            {genderOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </SelectField>
          <TextField label="City" value={form.city} onChange={(city) => setForm({ ...form, city })} />
          <TextField label="Country" value={form.country} onChange={(country) => setForm({ ...form, country })} />
        </div>
        <p className="mt-3 text-sm text-ink-muted">{PASSWORD_REQUIREMENTS}</p>
        <div className="mt-4">
          <TextAreaField label="Description" value={form.description} onChange={(description) => setForm({ ...form, description })} />
        </div>
        <div className="mt-4">
          <ImageUploadField
            label="Profile preview"
            emptyText="Choose profile photo"
            aspectClass="aspect-[16/9]"
            preview={form.photo}
            onChange={(photo) => setForm({ ...form, photo })}
          />
        </div>
        <button className="mt-6 min-h-11 w-full rounded-md bg-accent font-bold text-white">Signup</button>
        <p className="mt-4 text-center text-sm text-ink-muted">
          Already have an account? <Link className="font-bold text-accent-deep" href="/login">Login</Link>
        </p>
      </form>
    </main>
  );
}

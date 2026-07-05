"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import toast from "react-hot-toast";

import { jsonPost } from "@/lib/api";
import { fileToDataUrl } from "@/lib/file-to-data-url";

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
        <h1 className="text-2xl font-extrabold text-ink">Create account</h1>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field label="Username" value={form.username} onChange={(username) => setForm({ ...form, username: username.toLowerCase() })} required />
          <Field label="Email" type="email" value={form.email} onChange={(email) => setForm({ ...form, email })} required />
          <Field label="Password" type="password" value={form.password} onChange={(password) => setForm({ ...form, password })} required />
          <Field label="Date of birth" type="date" value={form.dob} onChange={(dob) => setForm({ ...form, dob })} required />
          <Field label="Gender" value={form.gender} onChange={(gender) => setForm({ ...form, gender })} required />
          <Field label="City" value={form.city} onChange={(city) => setForm({ ...form, city })} />
          <Field label="Country" value={form.country} onChange={(country) => setForm({ ...form, country })} />
        </div>
        <label className="mt-4 block text-sm font-bold text-ink">
          Description
          <textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className="mt-2 min-h-24 w-full rounded-md border border-line px-3 py-2 outline-none focus:border-accent focus:ring-4 focus:ring-accent-soft" />
        </label>
        <label className="mt-4 block text-sm font-bold text-ink">
          Profile photo
          <input type="file" accept="image/*" onChange={async (event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            try {
              setForm({ ...form, photo: await fileToDataUrl(file) });
            } catch (error) {
              event.currentTarget.value = "";
              toast.error(error instanceof Error ? error.message : "Could not read image");
            }
          }} className="mt-2 block w-full text-sm" />
        </label>
        <button className="mt-6 min-h-11 w-full rounded-md bg-accent font-bold text-white">Signup</button>
        <p className="mt-4 text-center text-sm text-ink-muted">
          Already have an account? <Link className="font-bold text-accent-deep" href="/login">Login</Link>
        </p>
      </form>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block text-sm font-bold text-ink">
      {label}
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} required={required} className="mt-2 min-h-11 w-full rounded-md border border-line px-3 outline-none focus:border-accent focus:ring-4 focus:ring-accent-soft" />
    </label>
  );
}

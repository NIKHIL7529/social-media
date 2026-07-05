"use client";

import Image from "next/image";
import { Camera } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";

import { AppShell, useCurrentUser } from "@/components/app-shell";
import { authService } from "@/features/auth/auth-service";
import { fileToDataUrl } from "@/lib/file-to-data-url";

const genderOptions = ["Female", "Male", "Non-binary", "Prefer not to say"];

export default function EditProfilePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: user, isLoading } = useCurrentUser();
  const [form, setForm] = useState({
    username: "",
    dob: "",
    gender: "",
    city: "",
    country: "",
    description: "",
    photo: "",
  });
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
  });

  useEffect(() => {
    if (!user) return;
    setForm({
      username: user.username || user.name || "",
      dob: user.dob || "",
      gender: user.gender || "",
      city: user.city || "",
      country: user.country || "",
      description: user.description || "",
      photo: "",
    });
  }, [user]);

  async function submitProfile(event: FormEvent) {
    event.preventDefault();
    try {
      const data = await toast.promise(authService.editProfile(form), {
        loading: "Saving profile...",
        success: "Profile updated",
        error: (error) => error.message || "Could not update profile",
      });
      queryClient.setQueryData(["auth", "profile"], data.user);
      router.push("/profile");
    } catch {
      // toast.promise already renders the actionable error.
    }
  }

  async function submitPassword(event: FormEvent) {
    event.preventDefault();
    try {
      await toast.promise(authService.changePassword(passwords), {
        loading: "Updating password...",
        success: "Password updated",
        error: (error) => error.message || "Could not update password",
      });
      setPasswords({ currentPassword: "", newPassword: "" });
    } catch {
      // toast.promise already renders the actionable error.
    }
  }

  const previewPhoto = form.photo || user?.photo || "";

  return (
    <AppShell>
      <section className="mx-auto w-full max-w-feed space-y-5">
        <form onSubmit={submitProfile} className="rounded-lg border border-line bg-white p-5 shadow-card">
          <h1 className="text-2xl font-extrabold text-ink">Edit profile</h1>
          {isLoading && <p className="mt-4 text-ink-muted">Loading profile...</p>}
          {!isLoading && !user && <p className="mt-4 text-ink-muted">Login to edit your profile.</p>}
          {user && (
            <>
              <label className="mt-5 block cursor-pointer overflow-hidden rounded-lg border border-dashed border-line bg-slate-50">
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (event) => {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    try {
                      setForm({ ...form, photo: await fileToDataUrl(file) });
                    } catch (error) {
                      event.currentTarget.value = "";
                      toast.error(error instanceof Error ? error.message : "Could not read image");
                    }
                  }}
                  className="sr-only"
                />
                <div className="relative grid aspect-[16/9] place-items-center">
                  {previewPhoto ? (
                    <Image src={previewPhoto} alt="Profile preview" fill className="object-cover" unoptimized />
                  ) : (
                    <div className="flex flex-col items-center gap-3 text-ink-muted">
                      <span className="grid size-14 place-items-center rounded-full bg-white text-accent-deep shadow-soft">
                        <Camera />
                      </span>
                      <span className="font-bold">Choose profile photo</span>
                    </div>
                  )}
                </div>
              </label>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <Field label="Username" value={form.username} onChange={(username) => setForm({ ...form, username: username.toLowerCase() })} required />
                <label className="block text-sm font-bold text-ink">
                  Gender
                  <select
                    value={form.gender}
                    onChange={(event) => setForm({ ...form, gender: event.target.value })}
                    required
                    className="mt-2 min-h-11 w-full rounded-md border border-line bg-white px-3 outline-none focus:border-accent focus:ring-4 focus:ring-accent-soft"
                  >
                    <option value="" disabled>Select gender</option>
                    {genderOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </label>
                <Field label="Date of birth" type="date" value={form.dob} onChange={(dob) => setForm({ ...form, dob })} required />
                <Field label="City" value={form.city} onChange={(city) => setForm({ ...form, city })} />
                <Field label="Country" value={form.country} onChange={(country) => setForm({ ...form, country })} />
              </div>
              <label className="mt-4 block text-sm font-bold text-ink">
                Description
                <textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className="mt-2 min-h-24 w-full rounded-md border border-line px-3 py-2 outline-none focus:border-accent focus:ring-4 focus:ring-accent-soft" />
              </label>
              <button className="mt-6 min-h-11 w-full rounded-md bg-accent font-bold text-white">Save profile</button>
            </>
          )}
        </form>

        {user && (
          <form onSubmit={submitPassword} className="rounded-lg border border-line bg-white p-5 shadow-card">
            <h2 className="text-xl font-extrabold text-ink">Change password</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Current password" type="password" value={passwords.currentPassword} onChange={(currentPassword) => setPasswords({ ...passwords, currentPassword })} required />
              <Field label="New password" type="password" value={passwords.newPassword} onChange={(newPassword) => setPasswords({ ...passwords, newPassword })} required />
            </div>
            <button className="mt-5 min-h-11 rounded-md border border-line px-4 font-bold text-accent-deep">Update password</button>
          </form>
        )}
      </section>
    </AppShell>
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

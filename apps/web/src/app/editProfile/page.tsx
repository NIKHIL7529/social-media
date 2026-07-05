"use client";

import { AppShell } from "@/components/app-shell";
import { SelectField, TextAreaField, TextField } from "@/components/form-controls";
import { ImageUploadField } from "@/components/image-upload-field";
import { useEditProfileForm } from "@/features/auth/use-edit-profile-form";

const genderOptions = ["Female", "Male", "Non-binary", "Prefer not to say"];

export default function EditProfilePage() {
  const profile = useEditProfileForm();

  return (
    <AppShell>
      <section className="mx-auto w-full max-w-feed space-y-5">
        <form onSubmit={profile.submitProfile} className="rounded-lg border border-line bg-white p-5 shadow-card">
          <h1 className="text-2xl font-extrabold text-ink">Edit profile</h1>
          {profile.isLoading && <p className="mt-4 text-ink-muted">Loading profile...</p>}
          {!profile.isLoading && !profile.user && <p className="mt-4 text-ink-muted">Login to edit your profile.</p>}
          {profile.user && (
            <>
              <div className="mt-5">
                <ImageUploadField
                  label="Profile preview"
                  emptyText="Choose profile photo"
                  aspectClass="aspect-[16/9]"
                  preview={profile.previewPhoto}
                  onChange={(photo) => profile.updateProfileField("photo", photo)}
                />
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <TextField label="Username" value={profile.form.username} onChange={(username) => profile.updateProfileField("username", username)} required />
                <SelectField label="Gender" value={profile.form.gender} onChange={(gender) => profile.updateProfileField("gender", gender)} required>
                  <option value="" disabled>Select gender</option>
                  {genderOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </SelectField>
                <TextField label="Date of birth" type="date" value={profile.form.dob} onChange={(dob) => profile.updateProfileField("dob", dob)} required />
                <TextField label="City" value={profile.form.city} onChange={(city) => profile.updateProfileField("city", city)} />
                <TextField label="Country" value={profile.form.country} onChange={(country) => profile.updateProfileField("country", country)} />
              </div>
              <div className="mt-4">
                <TextAreaField label="Description" value={profile.form.description} onChange={(description) => profile.updateProfileField("description", description)} />
              </div>
              <button className="mt-6 min-h-11 w-full rounded-md bg-accent font-bold text-white">Save profile</button>
            </>
          )}
        </form>

        {profile.user && (
          <form onSubmit={profile.submitPassword} className="rounded-lg border border-line bg-white p-5 shadow-card">
            <h2 className="text-xl font-extrabold text-ink">Change password</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <TextField label="Current password" type="password" value={profile.passwords.currentPassword} onChange={(currentPassword) => profile.updatePasswordField("currentPassword", currentPassword)} required />
              <TextField label="New password" type="password" value={profile.passwords.newPassword} onChange={(newPassword) => profile.updatePasswordField("newPassword", newPassword)} required />
            </div>
            <button className="mt-5 min-h-11 rounded-md border border-line px-4 font-bold text-accent-deep">Update password</button>
          </form>
        )}
      </section>
    </AppShell>
  );
}

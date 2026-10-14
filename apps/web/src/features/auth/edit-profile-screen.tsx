"use client";

import { SelectField, TextAreaField, TextField } from "@/components/form-controls";
import { ImageUploadField } from "@/components/image-upload-field";
import { EditProfileSkeleton } from "@/components/skeletons";
import { LoginRequired } from "@/components/login-required";
import { useEditProfileForm } from "@/features/auth/use-edit-profile-form";
import { USERNAME_MIN_LENGTH, USERNAME_MAX_LENGTH, PASSWORD_MIN_LENGTH, PASSWORD_MAX_LENGTH, PASSWORD_REQUIREMENTS } from "@/features/auth/auth-validation";

import { genderOptions } from "@/features/auth/form-errors";

export default function EditProfileScreen({ maxBirthDate }: { maxBirthDate: string }) {
  const profile = useEditProfileForm();
  if (!profile.isLoading && !profile.error && !profile.user) return <LoginRequired message="to edit your profile." />;

  return (
      <section className="mx-auto w-full max-w-feed space-y-5">
        <form onSubmit={profile.submitProfile} className="surface-card p-5 sm:p-6">
          <h1 className="text-2xl font-extrabold text-ink">Edit profile</h1>
          {profile.isLoading && <div className="mt-4"><EditProfileSkeleton /></div>}
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
                <TextField label="Name" value={profile.form.name} onChange={(name) => profile.updateProfileField("name", name)} minLength={3} maxLength={20} autoComplete="name" required />
                <TextField label="Username" value={profile.form.username} onChange={(username) => profile.updateProfileField("username", username)} minLength={USERNAME_MIN_LENGTH} maxLength={USERNAME_MAX_LENGTH} autoComplete="username" required />
                <SelectField label="Gender" value={profile.form.gender} onChange={(gender) => profile.updateProfileField("gender", gender)} required>
                  <option value="" disabled>Select gender</option>
                  {genderOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </SelectField>
                <TextField label="Date of birth" type="date" max={maxBirthDate} value={profile.form.dob} onChange={(dob) => profile.updateProfileField("dob", dob)} required />
                <TextField label="City" value={profile.form.city} onChange={(city) => profile.updateProfileField("city", city)} />
                <TextField label="Country" value={profile.form.country} onChange={(country) => profile.updateProfileField("country", country)} />
              </div>
              <div className="mt-4">
                <TextAreaField label="Description" value={profile.form.description} onChange={(description) => profile.updateProfileField("description", description)} />
              </div>
              {profile.profileError && <p role="alert" className="mt-4 break-words text-sm text-danger">{profile.profileError}</p>}
              <button disabled={profile.profilePending} className="mt-6 min-h-11 w-full rounded bg-accent font-bold text-accent-contrast disabled:cursor-wait disabled:opacity-60">{profile.profilePending ? "Saving…" : "Save profile"}</button>
            </>
          )}
        </form>

        {profile.user && (
          <form onSubmit={profile.submitPassword} className="surface-card p-5 sm:p-6">
            <h2 className="text-xl font-extrabold text-ink">Change password</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <TextField label="Current password" type="password" value={profile.passwords.currentPassword} onChange={(currentPassword) => profile.updatePasswordField("currentPassword", currentPassword)} required />
              <TextField label="New password" type="password" value={profile.passwords.newPassword} onChange={(newPassword) => profile.updatePasswordField("newPassword", newPassword)} minLength={PASSWORD_MIN_LENGTH} maxLength={PASSWORD_MAX_LENGTH} autoComplete="new-password" required />
            </div>
            <p className="mt-3 text-sm text-ink-muted">{PASSWORD_REQUIREMENTS}</p>
            {profile.passwordErrorMessage && <p role="alert" className="mt-3 break-words text-sm text-danger">{profile.passwordErrorMessage}</p>}
            <button disabled={profile.passwordPending} className="mt-5 min-h-11 rounded border border-line px-4 font-bold text-accent-deep disabled:cursor-wait disabled:opacity-60">{profile.passwordPending ? "Updating…" : "Update password"}</button>
          </form>
        )}
      </section>
  );
}

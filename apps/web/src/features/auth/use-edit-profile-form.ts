"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { useCurrentUser } from "@/features/auth/use-current-user";
import { queryKeys } from "@/lib/query-keys";
import { authService, type ChangePasswordPayload, type EditProfilePayload } from "@/features/auth/auth-service";
import { displayNameError, passwordError, usernameError } from "@/features/auth/auth-validation";

const emptyPasswords: ChangePasswordPayload = {
  currentPassword: "",
  newPassword: "",
};

export function useEditProfileForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: user, isLoading, error } = useCurrentUser();
  const [draft, setDraft] = useState<Partial<EditProfilePayload>>({});
  const [passwords, setPasswords] = useState<ChangePasswordPayload>(emptyPasswords);
  const [profilePending, setProfilePending] = useState(false);
  const [passwordPending, setPasswordPending] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [passwordErrorMessage, setPasswordErrorMessage] = useState("");

  const form: EditProfilePayload = {
      name: user?.name || "Anonymous",
      username: user?.username || "",
      dob: user?.dob || "",
      gender: user?.gender || "",
      city: user?.city || "",
      country: user?.country || "",
      description: user?.description || "",
      photo: "",
      ...draft,
  };

  function updateProfileField<Key extends keyof EditProfilePayload>(key: Key, value: EditProfilePayload[Key]) {
    setDraft((current) => ({ ...current, [key]: key === "username" ? String(value).toLowerCase() : value }));
  }

  function updatePasswordField<Key extends keyof ChangePasswordPayload>(key: Key, value: ChangePasswordPayload[Key]) {
    setPasswords((current) => ({ ...current, [key]: value }));
  }

  async function submitProfile(event: FormEvent) {
    event.preventDefault();
    if (profilePending) return;
    const validationError = displayNameError(form.name) || usernameError(form.username);
    if (validationError) {
      setProfileError(validationError);
      return;
    }
    setProfileError("");
    setProfilePending(true);
    try {
      const data = await toast.promise(authService.editProfile(form), {
        loading: "Saving profile...",
        success: "Profile updated",
        error: (error) => error.message || "Could not update profile",
      });
      queryClient.setQueryData(queryKeys.authProfile, data.user);
      setDraft({});
      queryClient.invalidateQueries({ queryKey: queryKeys.feed });
      queryClient.invalidateQueries({ queryKey: queryKeys.profilePosts });
      queryClient.invalidateQueries({ queryKey: queryKeys.savedPosts });
      queryClient.invalidateQueries({ queryKey: queryKeys.chatList });
      queryClient.invalidateQueries({ queryKey: ["user"] });
      router.push("/profile");
    } catch (error) {
      setProfileError(error instanceof Error ? error.message : "Could not update profile.");
    } finally {
      setProfilePending(false);
    }
  }

  async function submitPassword(event: FormEvent) {
    event.preventDefault();
    if (passwordPending) return;
    const validationError = passwordError(passwords.newPassword);
    if (validationError) {
      setPasswordErrorMessage(validationError);
      return;
    }
    setPasswordErrorMessage("");
    setPasswordPending(true);
    try {
      await toast.promise(authService.changePassword(passwords), {
        loading: "Updating password...",
        success: "Password updated",
        error: (error) => error.message || "Could not update password",
      });
      setPasswords(emptyPasswords);
    } catch (error) {
      setPasswordErrorMessage(error instanceof Error ? error.message : "Could not update password.");
    } finally {
      setPasswordPending(false);
    }
  }

  return {
    form,
    isLoading,
    error,
    passwords,
    profilePending,
    passwordPending,
    profileError,
    passwordErrorMessage,
    previewPhoto: form.photo || user?.photo || "",
    submitPassword,
    submitProfile,
    updatePasswordField,
    updateProfileField,
    user,
  };
}

"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { useCurrentUser } from "@/components/app-shell";
import { queryKeys } from "@/lib/query-keys";
import { authService, type ChangePasswordPayload, type EditProfilePayload } from "@/features/auth/auth-service";

const emptyProfile: EditProfilePayload = {
  username: "",
  dob: "",
  gender: "",
  city: "",
  country: "",
  description: "",
  photo: "",
};

const emptyPasswords: ChangePasswordPayload = {
  currentPassword: "",
  newPassword: "",
};

export function useEditProfileForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: user, isLoading } = useCurrentUser();
  const [form, setForm] = useState<EditProfilePayload>(emptyProfile);
  const [passwords, setPasswords] = useState<ChangePasswordPayload>(emptyPasswords);

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

  function updateProfileField<Key extends keyof EditProfilePayload>(key: Key, value: EditProfilePayload[Key]) {
    setForm((current) => ({ ...current, [key]: key === "username" ? String(value).toLowerCase() : value }));
  }

  function updatePasswordField<Key extends keyof ChangePasswordPayload>(key: Key, value: ChangePasswordPayload[Key]) {
    setPasswords((current) => ({ ...current, [key]: value }));
  }

  async function submitProfile(event: FormEvent) {
    event.preventDefault();
    try {
      const data = await toast.promise(authService.editProfile(form), {
        loading: "Saving profile...",
        success: "Profile updated",
        error: (error) => error.message || "Could not update profile",
      });
      queryClient.setQueryData(queryKeys.authProfile, data.user);
      queryClient.invalidateQueries({ queryKey: queryKeys.feed });
      queryClient.invalidateQueries({ queryKey: queryKeys.profilePosts });
      queryClient.invalidateQueries({ queryKey: queryKeys.savedPosts });
      queryClient.invalidateQueries({ queryKey: queryKeys.chatList });
      queryClient.invalidateQueries({ queryKey: ["user"] });
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
      setPasswords(emptyPasswords);
    } catch {
      // toast.promise already renders the actionable error.
    }
  }

  return {
    form,
    isLoading,
    passwords,
    previewPhoto: form.photo || user?.photo || "",
    submitPassword,
    submitProfile,
    updatePasswordField,
    updateProfileField,
    user,
  };
}

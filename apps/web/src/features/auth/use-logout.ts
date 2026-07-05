"use client";

import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { queryKeys } from "@/lib/query-keys";
import type { User } from "@/types/social";
import { authService } from "@/features/auth/auth-service";

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return async function logout() {
    try {
      await toast.promise(authService.logout(), {
        loading: "Signing out...",
        success: "Signed out",
        error: "Signed out locally",
      });
    } catch {
      // Logout should still clear local state if the API is unavailable.
    } finally {
      queryClient.setQueryData<User | null>(queryKeys.authProfile, null);
      router.push("/login");
    }
  };
}

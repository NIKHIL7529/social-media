"use client";

import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { authService } from "@/features/auth/auth-service";
import { clearAuthCaches } from "@/features/auth/auth-cache";

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return async function logout() {
    try {
      await authService.logout();
      clearAuthCaches(queryClient);
      toast.success("Signed out");
      router.push("/login");
    } catch (error) {
      // The HTTP-only cookie can only be cleared by a successful server response.
      toast.error(error instanceof Error ? error.message : "Unable to sign out. Please try again.");
    }
  };
}

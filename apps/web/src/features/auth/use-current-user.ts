"use client";

import { useQuery } from "@tanstack/react-query";

import { authService } from "@/features/auth/auth-service";
import { ApiError } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";

export function useCurrentUser() {
  return useQuery({
    queryKey: queryKeys.authProfile,
    queryFn: async ({ signal }) => {
      try {
        const data = await authService.getProfile(signal);
        return data.user;
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) return null;
        throw error;
      }
    },
  });
}

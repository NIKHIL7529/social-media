import type { Metadata } from "next";

import { AuthLayout } from "@/features/auth/auth-layout";
import SignupForm from "@/features/auth/signup-form";
import { latestAdultBirthDate } from "@/features/auth/auth-validation";

export const metadata: Metadata = { title: "signup" };
export const dynamic = "force-dynamic";

export default function Page() {
  return <AuthLayout signup><SignupForm maxBirthDate={latestAdultBirthDate()} /></AuthLayout>;
}

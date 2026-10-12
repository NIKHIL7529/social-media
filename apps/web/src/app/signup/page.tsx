import type { Metadata } from "next";

import { AuthLayout } from "@/features/auth/auth-layout";
import SignupForm from "@/features/auth/signup-form";

export const metadata: Metadata = { title: "signup" };

export default function Page() {
  return <AuthLayout signup><SignupForm /></AuthLayout>;
}

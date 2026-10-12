import type { Metadata } from "next";

import { AuthLayout } from "@/features/auth/auth-layout";
import LoginForm from "@/features/auth/login-form";

export const metadata: Metadata = { title: "login" };

export default function Page() {
  return <AuthLayout><LoginForm /></AuthLayout>;
}

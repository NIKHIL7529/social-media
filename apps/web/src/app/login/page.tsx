"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff } from "lucide-react";

import { authService } from "@/features/auth/auth-service";
import { resetSessionForLogin } from "@/features/auth/session-cache";

export default function LoginPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    try {
      const data = await toast.promise(authService.login({ name, password }), {
        loading: "Signing in...",
        success: "Welcome back",
        error: (error) => error.message || "Incorrect credentials",
      });
      resetSessionForLogin(queryClient, data.user);
      router.push("/posts");
    } catch {
      // toast.promise already renders the actionable error.
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-page px-4">
      <form onSubmit={submit} className="w-full max-w-sm rounded-lg border border-line bg-white p-6 shadow-card">
        <h1 className="text-2xl font-extrabold text-ink">SocialSphere</h1>
        <p className="mt-1 text-sm text-ink-muted">Login to continue.</p>
        <label className="mt-6 block text-sm font-bold text-ink">
          Username or email
          <input value={name} onChange={(event) => setName(event.target.value)} className="mt-2 min-h-11 w-full rounded-md border border-line px-3 outline-none focus:border-accent focus:ring-4 focus:ring-accent-soft" required />
        </label>
        <label className="mt-4 block text-sm font-bold text-ink">
          Password
          <span className="mt-2 flex min-h-11 overflow-hidden rounded-md border border-line focus-within:border-accent focus-within:ring-4 focus-within:ring-accent-soft">
            <input type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} className="min-w-0 flex-1 px-3 outline-none" required />
            <button type="button" onClick={() => setShowPassword((value) => !value)} className="grid w-11 place-items-center text-ink-muted hover:bg-accent-soft" aria-label={showPassword ? "Hide password" : "Show password"}>
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </span>
        </label>
        <button className="mt-6 min-h-11 w-full rounded-md bg-accent font-bold text-white">Login</button>
        <p className="mt-4 text-center text-sm text-ink-muted">
          New here? <Link className="font-bold text-accent-deep" href="/signup">Create account</Link>
        </p>
      </form>
    </main>
  );
}

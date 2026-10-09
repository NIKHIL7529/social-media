import Link from "next/link";
import type { ReactNode } from "react";
import { ImageIcon, MessageCircle, Users } from "lucide-react";
import { Brand } from "@/components/brand";

export function AuthLayout({ children, signup = false, mobileTitle, mobileSubtitle }: {
  children: ReactNode;
  signup?: boolean;
  mobileTitle?: ReactNode;
  mobileSubtitle?: string;
}) {
  return (
    <main className="auth-background auth-viewport w-full px-4 py-5 sm:px-8 lg:px-12 lg:py-8">
      <div className="mx-auto flex h-full min-h-0 w-full max-w-7xl flex-col">
        <header className="flex min-w-0 shrink-0 items-center justify-between gap-4">
          <div className="hidden lg:block"><Brand href="/posts" priority showTagline /></div>
          <div className="ml-auto text-right">
            <span className="block text-xs text-ink-muted lg:hidden">{signup ? "Already have an account?" : "New here?"}</span>
            <Link href={signup ? "/login" : "/signup"} className="mt-1 inline-flex text-sm font-bold text-accent-deep lg:mt-0 lg:rounded-2xl lg:bg-white/95 lg:px-6 lg:py-3 lg:shadow-sm">{signup ? "Log in" : "Sign up"}</Link>
          </div>
        </header>
        <div className="auth-content grid min-h-0 min-w-0 flex-1 grid-rows-[minmax(0,1fr)] items-center gap-7 pt-7 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-12">
          <div className="auth-intro hidden min-w-0 lg:block">
          <section aria-label="Your people, in one orbit" className="mx-auto w-full max-w-xl lg:mx-0">
            <h1 className="text-[clamp(2.4rem,5vw,4.5rem)] font-extrabold leading-[1.08] tracking-[-0.055em] text-[#09121c]">
              A space for<br /><span className="text-accent-deep">your people.</span>
            </h1>
            <p className="mt-5 max-w-lg text-base font-medium leading-relaxed text-ink-muted sm:text-xl">
              Share <span className="font-bold text-accent-deep">your moments</span>, stay close to the people who matter, and <span className="font-bold text-accent-deep">explore</span> what's happening in their world.
            </p>
            <div className="mt-8 grid grid-cols-3 gap-3 sm:mt-10 sm:gap-6">
              {[
                { icon: Users, title: "Connect", text: "Find your people" },
                { icon: ImageIcon, title: "Share", text: "Post your moments" },
                { icon: MessageCircle, title: "Chat", text: "Stay close, wherever" },
              ].map(({ icon: Icon, title, text }) => (
                <div key={title}>
                  <span className="mb-3 grid size-12 place-items-center rounded-2xl bg-[#e0f1e9] text-accent-deep sm:size-16"><Icon className="size-6 sm:size-8" strokeWidth={1.8} /></span>
                  <p className="text-sm font-bold text-[#09121c] sm:text-base">{title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-ink-muted sm:text-sm">{text}</p>
                </div>
              ))}
            </div>
            <p className="mt-8 hidden text-lg italic text-accent-deep lg:block">Real people. Real moments. Your sphere.</p>
          </section>
          </div>
          <div className="auth-form-slot flex h-full min-h-0 min-w-0 flex-col justify-center gap-6 lg:gap-0">
            <div className="auth-mobile-heading lg:hidden">
              <h1>{mobileTitle || <>Welcome <span>back</span></>}</h1>
              <p>{mobileSubtitle || "Log in and reconnect with your people."}</p>
            </div>
            {children}
          </div>
        </div>
      </div>
    </main>
  );
}

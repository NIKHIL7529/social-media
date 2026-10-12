import Link from "next/link";

export function LoginRequired({ message }: { message: string }) {
  return <section className="flex min-h-[calc(100dvh-var(--nav-height)-var(--bottom-nav-height)-36px)] w-full flex-1 items-center justify-center px-6 text-center lg:min-h-[calc(100dvh-48px)]"><p className="text-base text-ink-muted"><Link href="/login" className="font-semibold text-accent-deep underline underline-offset-4">Log in</Link> {message}</p></section>;
}

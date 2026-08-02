import Image from "next/image";
import Link from "next/link";

import { BRAND } from "@/config/brand";

type BrandProps = {
  compact?: boolean;
  href?: string;
  priority?: boolean;
  showTagline?: boolean;
};

export function Brand({ compact = false, href, priority = false, showTagline = false }: BrandProps) {
  const identity = (
    <span className="inline-flex items-center gap-3">
      <Image src={BRAND.assets.mark} alt="" width={44} height={44} priority={priority} className="size-10 rounded-[13px] shadow-[0_6px_18px_rgba(15,118,110,0.22)] sm:size-11" />
      {!compact && (
        <span className="min-w-0 leading-none">
          <span className="block text-xl font-extrabold tracking-[-0.035em] text-ink">
            Social<span className="text-accent">Sphere</span>
          </span>
          {showTagline && <span className="mt-1.5 block text-xs font-semibold tracking-wide text-ink-muted">{BRAND.tagline}</span>}
        </span>
      )}
    </span>
  );

  return href ? <Link href={href} aria-label={`${BRAND.name} home`}>{identity}</Link> : identity;
}

import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { BRAND } from "@/config/brand";

export const metadata: Metadata = {
  title: { default: BRAND.name, template: `%s · ${BRAND.name}` },
  description: BRAND.description,
  applicationName: BRAND.name,
  icons: { icon: BRAND.assets.mark, apple: BRAND.assets.mark },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

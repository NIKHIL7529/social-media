import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Providers } from "./providers";
import { BRAND } from "@/config/brand";
import { themeInitializationScript } from "@/lib/theme";

const font = localFont({ src: "../assets/fonts/PlusJakartaSans.ttf", display: "swap", weight: "200 800", variable: "--font-sans" });

export const metadata: Metadata = {
  title: { default: BRAND.name, template: `%s · ${BRAND.name}` },
  description: BRAND.description,
  applicationName: BRAND.name,
  icons: { icon: BRAND.assets.mark, apple: BRAND.assets.mark },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: themeInitializationScript }} /></head>
      <body className={font.variable}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

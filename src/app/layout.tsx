import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import { themeBootScript } from "@/lib/themes";
import "./globals.css";

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FireZenk — term-folio",
  description: "Interactive terminal portfolio of Jorge Garrido (FireZenk).",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // The boot script sets data-theme before hydration, hence the warning opt-out.
    <html lang="en" className={`${mono.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

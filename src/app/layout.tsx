import type { Metadata } from "next";
import { Bebas_Neue, DM_Sans } from "next/font/google";
import { SafeModeProvider } from "@/components/SafeModeProvider";
import { SiteHeader } from "@/components/SiteHeader";
import { site } from "@/lib/content";
import "./globals.css";

const display = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
});

const body = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: {
    default: `${site.name} — Fantasy League Blog`,
    template: `%s · ${site.name}`,
  },
  description: site.subtitle,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <SafeModeProvider>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-line py-6 text-center text-sm text-muted">
            Commissioner editions · keep it honest · keep it messy
          </footer>
        </SafeModeProvider>
      </body>
    </html>
  );
}

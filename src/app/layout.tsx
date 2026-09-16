import type { Metadata } from "next";
import { Playfair_Display, Source_Serif_4 } from "next/font/google";
import { SafeModeProvider } from "@/components/SafeModeProvider";
import { PhotoCropsProvider } from "@/components/PhotoCropsProvider";
import { SiteHeader } from "@/components/SiteHeader";
import { site } from "@/lib/content";
import "./globals.css";

const display = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  style: ["normal", "italic"],
});

const body = Source_Serif_4({
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
          <PhotoCropsProvider>
            <SiteHeader />
            <main className="flex-1">{children}</main>
            <footer className="border-t border-line bg-mint/70 py-8 text-center text-sm text-muted">
              If you&apos;re reading this bottom text, you a bitch
            </footer>
          </PhotoCropsProvider>
        </SafeModeProvider>
      </body>
    </html>
  );
}

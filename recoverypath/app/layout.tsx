import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { CaseProvider } from "@/lib/store";

export const metadata: Metadata = {
  title: "RecoveryPath — Organize relationship-caused financial harm",
  description:
    "Identify relationship-related debts, lost money and abandoned financial obligations. See potential remedies in your state, the evidence you need and the next steps available to you.",
  robots: { index: true, follow: true },
  referrer: "no-referrer",
};

export const viewport: Viewport = { themeColor: "#FBF8F3", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen font-sans">
        <CaseProvider>
          <Header />
          <main className="mx-auto max-w-wrap px-4 py-8 sm:py-12">{children}</main>
          <Footer />
        </CaseProvider>
      </body>
    </html>
  );
}

import { SerwistProvider } from "@serwist/next/react";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  applicationName: "VendeurPro",
  title: "VendeurPro",
  description: "Commandes et acomptes pour vendeurs en Côte d’Ivoire.",
  appleWebApp: { capable: true, title: "VendeurPro", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: "#3a4be0",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr" className={inter.variable}>
      <body className="bg-bg font-sans text-md text-text antialiased">
        <SerwistProvider swUrl="/sw.js" disable={process.env.NODE_ENV === "development"}>
          {children}
        </SerwistProvider>
      </body>
    </html>
  );
}

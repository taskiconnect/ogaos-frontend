import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

// ── Optimized Google Fonts via next/font ────────────────────────────────
import { Almarai, Open_Sans, Roboto } from "next/font/google";

const almarai = Almarai({
  subsets: ["latin"],
  weight: ["300", "400", "700", "800"],
  variable: "--font-almarai",
  display: "swap",
});

const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
  variable: "--font-open-sans",
  display: "swap",
});

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "700", "900"],
  style: ["normal", "italic"],
  variable: "--font-roboto",
  display: "swap",
});

export const metadata: Metadata = {
  title: "OgaOS – Business Operating System for Nigerian SMEs",
  description:
    "Track money, manage debts, staff, payments, and more — simple, WhatsApp-integrated, built for traders and shop owners.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${almarai.variable} ${openSans.variable} ${roboto.variable}`}
    >
      <head>
        {/* Adobe Fonts / Typekit – haboro-soft */}
        {/* Replace YOUR_KIT_ID with your actual kit ID from fonts.adobe.com */}
        <link rel="stylesheet" href="https://use.typekit.net/YOUR_KIT_ID.css" />

        {/* Preconnect to Google APIs (only needed for icons now) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />

        {/* Material Icons Round & Symbols Outlined */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/icon?family=Material+Icons+Round"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
      </head>

      <body className="antialiased">
        {children}

        {/* Global toast container */}
        <Toaster
          position="bottom-right"
          richColors
          closeButton
          duration={5000}
          toastOptions={{
            classNames: {
              toast:
                "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
              description: "group-[.toast]:text-muted-foreground",
              actionButton:
                "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
              cancelButton:
                "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
            },
          }}
        />
      </body>
    </html>
  );
}
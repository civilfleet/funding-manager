import type { Metadata } from "next";
import "./globals.css";

import { Toaster } from "@/components/ui/toaster";
import { SessionProvider } from "next-auth/react";
import NextTopLoader from "nextjs-toploader";

export const metadata: Metadata = {
  title: "Funding Manager",
  description: "A funding manager application.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <NextTopLoader color="#2563eb" showSpinner={false} />
        <SessionProvider>
          <main>
            <div className="flex flex-1 flex-col gap-4 p-8 pt-0">
              {children}
            </div>
          </main>
          <Toaster />
        </SessionProvider>
      </body>
    </html>
  );
}

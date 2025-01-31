import type { Metadata } from "next";
import "./globals.css";

import { Toaster } from "@/components/ui/toaster";

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
        <main>
          <div className="flex flex-1 flex-col gap-4 p-8 pt-0">{children}</div>
        </main>
        <Toaster />
      </body>
    </html>
  );
}

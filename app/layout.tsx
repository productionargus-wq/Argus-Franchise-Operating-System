import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "ARGUSCNC - Franchise Operating System",
  description: "Centralized multi-franchise platform for sales, quotation control, order execution, installation, support, renewals and commissions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-[#F8F9FA] text-[#293033]">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}

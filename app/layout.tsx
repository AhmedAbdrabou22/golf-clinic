import type { Metadata } from "next";
// @ts-ignore
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "نظام إدارة العيادة",
  description: "Clinic Management System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className="min-h-screen font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

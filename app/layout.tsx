import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Smart Bookmarks",
  description: "Minimal bookmark manager with real-time sync",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}

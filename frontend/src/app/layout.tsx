import type { Metadata } from "next";
import Navbar from "./components/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Starlite Academic Engine",
  description: "LMS CSV Converter & Score Regulator",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-neutral-50 min-h-screen text-neutral-900 antialiased">
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
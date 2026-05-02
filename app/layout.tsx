import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VeilFlow",
  description: "Private strategy execution for onchain finance using Zama fhEVM."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}


import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FundFlow - Decentralized Crowdfunding",
  description: "A decentralized crowdfunding platform with milestone-based funding, NFT rewards, and DAO governance.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full">{children}</body>
    </html>
  );
}

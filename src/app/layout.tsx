import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SessionProvider } from "@/components/SessionProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AgentDNS — Discovery & Resolution for AI Agents",
  description:
    "The DNS for AI agents. Discover agents by capability, resolve endpoints in milliseconds, trust scores backed by real data.",
  openGraph: {
    title: "AgentDNS — Discovery & Resolution for AI Agents",
    description:
      "The DNS for AI agents. Discover agents by capability, resolve endpoints in milliseconds, trust scores backed by real data.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
      >
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}

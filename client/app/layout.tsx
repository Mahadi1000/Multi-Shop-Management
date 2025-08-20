import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { AuthProvider } from "@/contexts/auth-context";

import "./globals.css";
import { SubdomainHandler } from "@/components/subdomain-handler";

export const metadata: Metadata = {
  title: "Shop Management Platform",
  description: "Multi-shop management platform with authentication",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body>
        <AuthProvider>
          <SubdomainHandler>{children}</SubdomainHandler>
        </AuthProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { Nav } from "@/components/Nav";
import { cn } from "@/utils";
import MemoryPanel from "@/components/MemoryPanel";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: "EVI Memory PoC",
  description: "An example using Hume AI's Empathic Voice Interface",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body
        className={cn(
          GeistSans.variable,
          GeistMono.variable,
          "flex flex-col min-h-screen"
        )}
      >
        <Providers>
          <Nav />
          <div className="relative flex grow">
            {children}
            <MemoryPanel />
          </div>
        </Providers>
      </body>
    </html>
  );
}

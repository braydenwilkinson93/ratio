import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { Header } from "@/components/header";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-body" });
const display = Space_Grotesk({ subsets: ["latin"], variable: "--font-display" });

export const metadata: Metadata = {
  title: { default: "Ratio - Think twice. Decide better.", template: "%s | Ratio" },
  description: "A consensus engine for decisions informed by strong arguments from every side.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000")
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${display.variable}`}>
        <Header />
        <main>{children}</main>
        <footer><div className="shell footer-inner"><span>Ratio</span><span>Better decisions begin with a second look.</span></div></footer>
      </body>
    </html>
  );
}

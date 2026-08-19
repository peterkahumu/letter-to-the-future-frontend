import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnimatedBackground from "@/components/AnimatedBackground";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Letter to the Future",
    template: "%s | Letter to the Future",
  },
  description:
    "Write a letter to your future self. Choose a date, and we'll deliver it to your inbox when the time comes.",
  keywords: [
    "letter to future self",
    "time capsule",
    "future email",
    "self reflection",
  ],
  authors: [{ name: "Letter to the Future" }],
  openGraph: {
    title: "Letter to the Future",
    description:
      "Write a letter to your future self. Choose a date, and we'll deliver it to your inbox when the time comes.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0f1a" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <AnimatedBackground />
          <Navbar />
          <main className="flex-1 relative z-10 pt-16">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}

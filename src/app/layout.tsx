import type { Metadata, Viewport } from "next";
import { Prata, Rubik } from "next/font/google";
import "./globals.css";
import { ThemeProvider, themeInitScript } from "@/components/ThemeProvider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PaperBackground from "@/components/PaperBackground";

// Prata is the display face — headings and numerals only.
const prata = Prata({
  variable: "--font-prata",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

// Rubik carries body copy and UI text, weighted light by default.
const rubik = Rubik({
  variable: "--font-rubik",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
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
    { media: "(prefers-color-scheme: dark)", color: "#05100f" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${prata.variable} ${rubik.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full flex flex-col bg-paper text-ink">
        <ThemeProvider>
          <PaperBackground />
          <Navbar />
          <main className="relative z-10 flex-1">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}

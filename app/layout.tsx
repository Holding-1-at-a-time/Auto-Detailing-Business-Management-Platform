import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { ConvexProvider } from "@/lib/convex/convex-provider"
import ConvexClientProvider from "@/providers/ConvexClientProvider"
import ReactQueryProvider from "@/providers/ReactQueryProvider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "DetailSync - Auto-Detailing Business Management Platform",
  description:
    "Streamline your auto-detailing business with our all-in-one management platform. Manage bookings, clients, and operations efficiently.",
  keywords: "auto detailing, business management, booking system, client management, auto detailing software",
  authors: [{ name: "DetailSync Team" }],
  creator: "DetailSync",
  publisher: "DetailSync",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://detailsync.com",
    title: "DetailSync - Auto-Detailing Business Management Platform",
    description: "Streamline your auto-detailing business with our all-in-one management platform.",
    siteName: "DetailSync",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "DetailSync - Auto-Detailing Business Management Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DetailSync - Auto-Detailing Business Management Platform",
    description: "Streamline your auto-detailing business with our all-in-one management platform.",
    images: ["/twitter-image.png"],
    creator: "@detailsync",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-video-preview": -1,
      "max-snippet": -1,
    },
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="canonical" href="https://detailsync.com" />
        <meta name="theme-color" content="#00ae98" />
      </head>
      <body className={inter.className}>
        <ReactQueryProvider>
          <ConvexProvider>
            <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} forcedTheme="dark">
              <ConvexClientProvider>{children}</ConvexClientProvider>
            </ThemeProvider>
          </ConvexProvider>
        </ReactQueryProvider>
      </body>
    </html>
  )
}

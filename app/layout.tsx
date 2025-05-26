/**
    * @description      : 
    * @author           : rrome
    * @group            : 
    * @created          : 25/05/2025 - 18:27:31
    * 
    * MODIFICATION LOG
    * - Version         : 1.0.0
    * - Date            : 25/05/2025
    * - Author          : rrome
    * - Modification    : 
**/
import type React from "react"
import { ClerkProvider } from "@clerk/nextjs"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { ConvexProvider } from "@/lib/convex/convex-provider"
import ConvexClientProvider from "@/providers/ConvexClientProvider"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Auto-Detailing Business Management",
  description: "Streamline appointment scheduling and client management for auto-detailing businesses",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en"
    className= "dark"    
    >
      <body className={inter.className}>
        <ClerkProvider>
          <ConvexProvider>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
              <ConvexClientProvider>
                {children}
              </ConvexClientProvider>
            </ThemeProvider>
          </ConvexProvider>
        </ClerkProvider>
      </body>
    </html>
  )
}

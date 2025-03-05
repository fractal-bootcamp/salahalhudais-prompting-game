import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ClerkProvider } from "@clerk/nextjs"
import { Navigation } from "~/components/shared/Navigation";
import { ThemeProvider } from "~/components/shared/theme-provider"; // Correct path
import { TRPCReactProvider } from "~/trpc/react"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Artistic Expressions Gallery",
  description: "A vibrant online art gallery where creativity finds its home",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ClerkProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <TRPCReactProvider>
              <Navigation />
              <main>{children}</main>
            </TRPCReactProvider>
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  )
}


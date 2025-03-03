import { ClerkProvider } from "@clerk/nextjs";
import { Geist } from "next/font/google";
import "~/styles/globals.css";
import { TRPCReactProvider } from "~/trpc/react";
import { Navigation } from "./_components/Navigation";
import { ThemeProvider } from "~/components/theme-provider";
import { Toaster } from "sonner";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={`${geist.variable} font-sans antialiased`}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <TRPCReactProvider>
              <div className="relative flex min-h-screen flex-col">
                <Navigation />
                <main className="flex-1">
                  <div className="container py-6">
                    {children}
                  </div>
                </main>
                <footer className="border-t py-6">
                  <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
                    <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
                      © 2023 Generative Art. All rights reserved.
                    </p>
                  </div>
                </footer>
              </div>
              <Toaster richColors position="bottom-right" />
            </TRPCReactProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}

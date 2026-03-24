import type { Metadata } from "next"
import { SidebarNav } from "@/components/dashboard/sidebar-nav"
import { MobileNav } from "@/components/dashboard/mobile-nav"
import "./globals.css"

export const metadata: Metadata = {
  title: "Handled Board Metrics",
  description: "Real-time board reporting and financial metrics dashboard",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-zinc-50 dark:bg-zinc-950 font-sans">
        <SidebarNav />
        <MobileNav />
        <main className="md:pl-64">
          <div className="p-6 lg:p-8">{children}</div>
        </main>
      </body>
    </html>
  )
}

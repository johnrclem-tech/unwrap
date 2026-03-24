"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, Upload, LayoutDashboard, Settings } from "lucide-react"

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/metrics/revenue", label: "Revenue", icon: BarChart3 },
  { href: "/upload", label: "Upload Data", icon: Upload },
]

export function SidebarNav() {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-zinc-950 text-zinc-100">
      <div className="flex flex-col flex-1 overflow-y-auto">
        <div className="flex items-center h-16 px-6 border-b border-zinc-800">
          <BarChart3 className="h-6 w-6 text-emerald-400 mr-2" />
          <span className="text-lg font-semibold tracking-tight">
            Handled Board Metrics
          </span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-zinc-800 text-white"
                    : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-100"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div className="px-3 py-4 border-t border-zinc-800">
          <Link
            href="/settings"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-100 transition-colors"
          >
            <Settings className="h-4 w-4" />
            Settings
          </Link>
        </div>
      </div>
    </aside>
  )
}

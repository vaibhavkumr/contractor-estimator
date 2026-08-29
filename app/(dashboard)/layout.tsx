import Link from 'next/link'
import { Zap, LayoutDashboard, FileText, Users, Settings, LogOut } from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/estimates', label: 'Estimates', icon: FileText },
  { href: '/customers', label: 'Customers', icon: Users },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-60 bg-white border-r border-gray-100 flex flex-col fixed h-full">
        <div className="px-6 py-5 border-b border-gray-100">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900">QuoteKit</span>
          </Link>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-gray-100">
          <Link
            href="/api/auth/signout"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors w-full"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-60 flex-1 p-8">
        {children}
      </main>
    </div>
  )
}

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Plane,
  BookOpen,
  CalendarDays,
  Users,
  Wrench,
  Settings,
  LogOut,
  Newspaper,
} from 'lucide-react'
import { logout } from '@/app/actions/auth'

const nav = [
  { href: '/dashboard',               label: 'Dashboard',     icon: LayoutDashboard },
  { href: '/dashboard/vliegtuigen',   label: 'Vliegtuigen',   icon: Plane },
  { href: '/dashboard/vluchten',      label: 'Vluchten',      icon: BookOpen },
  { href: '/dashboard/reserveringen', label: 'Reserveringen', icon: CalendarDays },
  { href: '/dashboard/defecten',      label: 'Defecten',      icon: Wrench },
  { href: '/dashboard/blog',          label: 'Blog',          icon: Newspaper },
  { href: '/dashboard/leden',         label: 'Leden',         icon: Users },
  { href: '/dashboard/instellingen',  label: 'Instellingen',  icon: Settings },
]

interface SidebarProps {
  clubName: string
  userName: string
  userRole: string
}

export function Sidebar({ clubName, userName, userRole }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="flex h-full w-56 shrink-0 flex-col border-r border-zinc-200 bg-white">
      <div className="border-b border-zinc-100 px-4 py-5">
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">HangarOS</p>
        <p className="mt-0.5 truncate text-sm font-semibold text-zinc-900">{clubName}</p>
      </div>

      <nav className="flex-1 space-y-0.5 px-2 py-4">
        {nav.map(({ href, label, icon: Icon }) => {
          const active =
            href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                active
                  ? 'bg-zinc-100 font-medium text-zinc-900'
                  : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-zinc-100 px-4 py-4">
        <p className="truncate text-xs font-medium text-zinc-900">{userName}</p>
        <p className="text-xs capitalize text-zinc-400">{userRole}</p>
        <form action={logout} className="mt-3">
          <button
            type="submit"
            className="flex items-center gap-2 text-xs text-zinc-400 transition-colors hover:text-zinc-800"
          >
            <LogOut className="h-3.5 w-3.5" />
            Uitloggen
          </button>
        </form>
      </div>
    </aside>
  )
}

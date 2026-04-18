import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import SidebarNav from './SidebarNav'

type SidebarNavItem = {
  key: string
  label: string
  visible: boolean
}

export type DashboardNavItem = SidebarNavItem

type DashboardLayoutProps = {
  heading: string
  subheading: string
  roleLabel: string
  onLogout: () => void
  navItems: SidebarNavItem[]
}

export default function DashboardLayout({
  heading,
  subheading,
  roleLabel,
  onLogout,
  navItems,
}: DashboardLayoutProps) {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-blue-100 lg:flex">
      <SidebarNav
        title={heading}
        subtitle={subheading}
        items={navItems}
        activeView={location.pathname}
        onSelect={(key) => navigate(key)}
      />

      <div className="flex-1">
        <header className="border-b border-blue-100 bg-white/90 backdrop-blur">
          <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
            <div>
              {/* <h1 className="text-2xl font-bold text-blue-900">{heading}</h1>
              <p className="text-sm text-slate-500">{subheading}</p> */}
            </div>
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">{roleLabel}</span>
              <button
                type="button"
                onClick={onLogout}
                className="rounded-xl border border-blue-200 px-3 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

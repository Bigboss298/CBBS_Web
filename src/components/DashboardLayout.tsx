import { useEffect, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import SidebarNav from './SidebarNav'

type SidebarNavItem = {
  key: string
  label: string
  visible: boolean
  icon: 'dashboard' | 'activity' | 'upload' | 'users' | 'promotion' | 'faculties' | 'departments' | 'levels' | 'registrations'
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
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)

  useEffect(() => {
    setIsMobileNavOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!isMobileNavOpen) {
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMobileNavOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isMobileNavOpen])

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-blue-100 lg:flex">
      <SidebarNav
        title={heading}
        subtitle={subheading}
        roleLabel={roleLabel}
        items={navItems}
        activeView={location.pathname}
        isMobileOpen={isMobileNavOpen}
        onOpenMobile={() => setIsMobileNavOpen(true)}
        onCloseMobile={() => setIsMobileNavOpen(false)}
        onLogout={onLogout}
        onSelect={(key) => navigate(key)}
      />

      <div className="flex-1 pl-16 sm:pl-20 lg:pl-0">
        <main className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 sm:py-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

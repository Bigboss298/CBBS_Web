type SidebarNavItem = {
  key: string
  label: string
  visible: boolean
  icon: 'dashboard' | 'activity' | 'upload' | 'users' | 'promotion' | 'faculties' | 'departments' | 'levels' | 'registrations'
}

type SidebarNavProps = {
  title: string
  subtitle: string
  roleLabel: string
  items: SidebarNavItem[]
  activeView: string
  isMobileOpen: boolean
  onOpenMobile: () => void
  onCloseMobile: () => void
  onLogout: () => void
  onSelect: (key: string) => void
}

function DashboardIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <path d="M4 4h7v7H4z" />
      <path d="M13 4h7v4h-7z" />
      <path d="M13 10h7v10h-7z" />
      <path d="M4 13h7v7H4z" />
    </svg>
  )
}

function ActivityIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <path d="M3 12h4l2-6 4 12 2-6h6" />
    </svg>
  )
}

function UploadIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <path d="M12 16V4" />
      <path d="m7 9 5-5 5 5" />
      <path d="M4 20h16" />
    </svg>
  )
}

function UsersIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <path d="M17 21a5 5 0 0 0-10 0" />
      <circle cx="12" cy="8" r="4" />
      <path d="M22 21a4 4 0 0 0-3-3.9" />
      <path d="M16 4.5a4 4 0 0 1 0 7" />
    </svg>
  )
}

function PromotionIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <path d="m12 3 7 7-7 7-7-7 7-7Z" />
      <path d="M12 10v10" />
    </svg>
  )
}

function FacultyIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <path d="M4 10 12 4l8 6" />
      <path d="M6 10v8h12v-8" />
      <path d="M9 18v-5h6v5" />
    </svg>
  )
}

function DepartmentIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <path d="M4 5h16v14H4z" />
      <path d="M8 5v14" />
      <path d="M4 11h12" />
    </svg>
  )
}

function LevelsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <path d="M4 18h16" />
      <path d="M7 14h13" />
      <path d="M10 10h10" />
      <path d="M13 6h7" />
    </svg>
  )
}

function RegistrationsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M19 8v6" />
      <path d="M22 11h-6" />
    </svg>
  )
}

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <path d="M4 6h16" />
      <path d="M4 12h16" />
      <path d="M4 18h16" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  )
}

function LogoutIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="m16 17 5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  )
}

function getIcon(icon: SidebarNavItem['icon']) {
  switch (icon) {
    case 'activity':
      return <ActivityIcon />
    case 'upload':
      return <UploadIcon />
    case 'users':
      return <UsersIcon />
    case 'promotion':
      return <PromotionIcon />
    case 'registrations':
      return <RegistrationsIcon />
    case 'faculties':
      return <FacultyIcon />
    case 'departments':
      return <DepartmentIcon />
    case 'levels':
      return <LevelsIcon />
    case 'dashboard':
    default:
      return <DashboardIcon />
  }
}

export default function SidebarNav({ title, subtitle, roleLabel, items, activeView, isMobileOpen, onOpenMobile, onCloseMobile, onLogout, onSelect }: SidebarNavProps) {
  const visibleItems = items.filter((item) => item.visible)

  const handleSelect = (key: string) => {
    onSelect(key)
    onCloseMobile()
  }

  const logoutButton = (collapsed: boolean) => (
    <button
      type="button"
      onClick={onLogout}
      title={collapsed ? 'Logout' : undefined}
      aria-label="Logout"
      className={`flex min-h-11 w-full items-center rounded-2xl text-sm font-semibold text-red-600 transition hover:bg-red-50 ${
        collapsed ? 'justify-center px-3 py-3' : 'gap-3 px-4 py-3'
      }`}
    >
      <span className="text-red-500">
        <LogoutIcon />
      </span>
      {!collapsed ? <span>Logout</span> : null}
    </button>
  )

  const navContent = (collapsed: boolean) => (
    <nav className="space-y-2">
      {visibleItems.map((item) => {
        const isActive = activeView === item.key

        return (
          <button
            key={item.key}
            type="button"
            onClick={() => handleSelect(item.key)}
            title={collapsed ? item.label : undefined}
            aria-current={isActive ? 'page' : undefined}
            className={`flex min-h-11 w-full items-center rounded-2xl text-left text-sm font-semibold transition ${
              collapsed ? 'justify-center px-3 py-3' : 'justify-between gap-3 px-4 py-3'
            } ${
              isActive ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'bg-blue-50 text-blue-800 hover:bg-blue-100'
            }`}
          >
            <span className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'}`}>
              <span className={`${isActive ? 'text-white' : 'text-blue-600'}`}>{getIcon(item.icon)}</span>
              {!collapsed ? <span>{item.label}</span> : null}
            </span>
            {!collapsed && isActive ? <span className="text-[10px] uppercase tracking-[0.25em]">Active</span> : null}
          </button>
        )
      })}
    </nav>
  )

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 flex w-16 flex-col border-r border-blue-100 bg-white/95 backdrop-blur lg:hidden">
        <div className="flex h-full flex-col items-center gap-4 px-2 py-3">
          <button
            type="button"
            onClick={onOpenMobile}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-2xl border border-blue-200 bg-white text-blue-700 transition hover:bg-blue-50"
            aria-label="Open navigation menu"
          >
            <MenuIcon />
          </button>

          <div className="flex-1 overflow-y-auto pb-2 pt-1">{navContent(true)}</div>

          {logoutButton(true)}
        </div>
      </aside>

      {isMobileOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/50 backdrop-blur-[1px]"
            onClick={onCloseMobile}
            aria-label="Close navigation overlay"
          />
          <aside className="absolute inset-y-0 left-0 z-50 w-[min(18rem,85vw)] border-r border-blue-100 bg-white shadow-2xl shadow-slate-900/20 transition-transform duration-300 ease-out">
            <div className="flex h-full flex-col p-4">
              <div className="mb-5 flex items-start justify-between gap-3 border-b border-blue-50 pb-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-500">CBBS</p>
                  <h1 className="mt-2 text-2xl font-bold text-blue-900">{title}</h1>
                  <p className="mt-1 text-sm leading-6 text-slate-500">{subtitle}</p>
                </div>
                <button
                  type="button"
                  onClick={onCloseMobile}
                  className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-2xl border border-blue-200 bg-white text-blue-700 transition hover:bg-blue-50"
                  aria-label="Close navigation menu"
                >
                  <CloseIcon />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto pr-1">{navContent(false)}</div>

              <div className="mt-4 space-y-3 border-t border-blue-50 pt-4">
                <span className="inline-flex w-fit rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">{roleLabel}</span>
                {logoutButton(false)}
              </div>
            </div>
          </aside>
        </div>
      ) : null}

      <aside className="sticky top-0 hidden h-dvh w-72 shrink-0 border-r border-blue-100 bg-white/95 backdrop-blur lg:flex">
        <div className="flex h-full w-full flex-col px-5 py-5">
          <div className="mb-6 border-b border-blue-50 pb-4">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-blue-500">CBBS</p>
            <h1 className="mt-2 text-2xl font-bold text-blue-900">{title}</h1>
            <p className="mt-1 text-sm leading-6 text-slate-500">{subtitle}</p>
          </div>

          <div className="flex-1 overflow-y-auto pr-1">{navContent(false)}</div>

          <div className="mt-4 space-y-3 border-t border-blue-50 pt-4">
            <span className="inline-flex w-fit rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">{roleLabel}</span>
            {logoutButton(false)}
          </div>
        </div>
      </aside>
    </>
  )
}

type SidebarNavItem = {
  key: string
  label: string
  visible: boolean
}

type SidebarNavProps = {
  title: string
  subtitle: string
  items: SidebarNavItem[]
  activeView: string
  onSelect: (key: string) => void
}

export default function SidebarNav({ title, subtitle, items, activeView, onSelect }: SidebarNavProps) {
  return (
    <aside className="border-b border-blue-100 bg-white/95 lg:h-screen lg:w-72 lg:border-b-0 lg:border-r lg:sticky lg:top-0">
      <div className="flex h-full flex-col px-4 py-5 sm:px-6 lg:px-5">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-blue-500">CBBS</p>
          <h1 className="mt-2 text-2xl font-bold text-blue-900">{title}</h1>
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        </div>

        <nav className="space-y-2">
          {items
            .filter((item) => item.visible)
            .map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => onSelect(item.key)}
                className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${
                  activeView === item.key
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                    : 'bg-blue-50 text-blue-800 hover:bg-blue-100'
                }`}
              >
                <span>{item.label}</span>
                {activeView === item.key ? <span className="text-xs uppercase tracking-widest">Active</span> : null}
              </button>
            ))}
        </nav>
      </div>
    </aside>
  )
}

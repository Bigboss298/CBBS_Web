import type { ReactNode } from 'react'

type SectionGroupProps = {
  title: string
  subtitle?: string
  children: ReactNode
}

export default function SectionGroup({ title, subtitle, children }: SectionGroupProps) {
  return (
    <section className="overflow-hidden rounded-xl border border-blue-100 bg-white p-3 shadow-sm sm:rounded-2xl sm:p-5 lg:p-6">
      <header className="mb-3 space-y-1 border-b border-blue-50 pb-2 sm:mb-4 sm:pb-3">
        <h2 className="text-base font-bold text-blue-900 sm:text-lg">{title}</h2>
        {subtitle ? <p className="text-sm leading-6 text-slate-500">{subtitle}</p> : null}
      </header>
      {children}
    </section>
  )
}

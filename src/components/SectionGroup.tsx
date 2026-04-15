import type { ReactNode } from 'react'

type SectionGroupProps = {
  title: string
  subtitle?: string
  children: ReactNode
}

export default function SectionGroup({ title, subtitle, children }: SectionGroupProps) {
  return (
    <section className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
      <header className="mb-4 border-b border-blue-50 pb-3">
        <h2 className="text-lg font-bold text-blue-900">{title}</h2>
        {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
      </header>
      {children}
    </section>
  )
}

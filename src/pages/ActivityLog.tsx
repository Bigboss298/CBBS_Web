import { useEffect, useMemo, useState } from 'react'
import SectionGroup from '../components/SectionGroup'
import type { AuditLogDto } from '../store/auditLogStore'

export type ActivityLogPageProps = {
  currentRole: string | null
  myLogs: AuditLogDto[]
  allLogs: AuditLogDto[]
  myLogsHasMore: boolean
  allLogsHasMore: boolean
  isMyLogsFetching: boolean
  isAllLogsFetching: boolean
  errorMessage: string | null
  onLoadMyLogsFirstPage: () => Promise<void>
  onLoadMyLogsNextPage: () => Promise<void>
  onLoadAllLogsFirstPage: () => Promise<void>
  onLoadAllLogsNextPage: () => Promise<void>
}

type LogScope = 'mine' | 'all'
const LOGS_PER_PAGE = 20

function formatTimestamp(value: string): string {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(parsed)
}

function getActionTone(action: string): string {
  if (action.toLowerCase().includes('failed')) {
    return 'border-amber-200 bg-amber-50 text-amber-700'
  }

  if (action.toLowerCase().includes('download')) {
    return 'border-emerald-200 bg-emerald-50 text-emerald-700'
  }

  if (action.toLowerCase().includes('upload') || action.toLowerCase().includes('create')) {
    return 'border-blue-200 bg-blue-50 text-blue-700'
  }

  return 'border-slate-200 bg-slate-50 text-slate-700'
}

function ActivityRow({ log, isAdminView }: { log: AuditLogDto; isAdminView: boolean }) {
  return (
    <tr className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/60">
      <td className="whitespace-nowrap px-4 py-3 align-top text-sm text-slate-600">{formatTimestamp(log.createdAt)}</td>
      {isAdminView ? (
        <td className="px-4 py-3 align-top">
          <div className="space-y-0.5">
            <p className="text-sm font-semibold text-slate-900">{log.userFullName}</p>
            <p className="text-xs text-slate-500">{log.userMatricNumber}</p>
          </div>
        </td>
      ) : null}
      <td className="px-4 py-3 align-top">
        <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getActionTone(log.action)}`}>{log.action}</span>
      </td>
      <td className="px-4 py-3 align-top text-sm text-slate-700">{log.description ?? 'No additional description.'}</td>
    </tr>
  )
}

function EmptyState({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-blue-200 bg-blue-50/70 px-6 py-10 text-center">
      <p className="text-base font-semibold text-blue-900">{title}</p>
      <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
    </div>
  )
}

export default function ActivityLog({
  currentRole,
  myLogs,
  allLogs,
  myLogsHasMore,
  allLogsHasMore,
  isMyLogsFetching,
  isAllLogsFetching,
  errorMessage,
  onLoadMyLogsFirstPage,
  onLoadMyLogsNextPage,
  onLoadAllLogsFirstPage,
  onLoadAllLogsNextPage,
}: ActivityLogPageProps) {
  const [scope, setScope] = useState<LogScope>('mine')
  const [currentPage, setCurrentPage] = useState(1)
  const isAdmin = currentRole === 'Admin'

  // Reset page when switching scopes
  useEffect(() => {
    setCurrentPage(1)
  }, [scope])

  useEffect(() => {
    if (!isAdmin && scope === 'all') {
      setScope('mine')
    }
  }, [isAdmin, scope])

  const activeLogs = scope === 'all' && isAdmin ? allLogs : myLogs
  const hasMore = scope === 'all' && isAdmin ? allLogsHasMore : myLogsHasMore
  const isFetching = scope === 'all' && isAdmin ? isAllLogsFetching : isMyLogsFetching
  const visibleColumns = isAdmin && scope === 'all' ? 4 : 3

  // Calculate paginated view (20 items per page)
  const startIdx = (currentPage - 1) * LOGS_PER_PAGE
  const endIdx = startIdx + LOGS_PER_PAGE
  const displayedLogs = activeLogs.slice(startIdx, endIdx)
  const totalLoadedLogs = activeLogs.length
  const totalPages = Math.ceil(totalLoadedLogs / LOGS_PER_PAGE)
  const canGoNext = currentPage < totalPages
  const canGoPrev = currentPage > 1
  const latestActivity = useMemo(() => activeLogs[0] ?? null, [activeLogs])

  const handleLoadMore = async () => {
    if (scope === 'all' && isAdmin) {
      await onLoadAllLogsNextPage()
    } else {
      await onLoadMyLogsNextPage()
    }
  }

  const handleSwitchScope = async (nextScope: LogScope) => {
    setScope(nextScope)
    setCurrentPage(1)

    if (nextScope === 'all' && isAdmin && allLogs.length === 0) {
      await onLoadAllLogsFirstPage()
      return
    }

    if (nextScope === 'mine' && myLogs.length === 0) {
      await onLoadMyLogsFirstPage()
    }
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-br from-white via-blue-50 to-cyan-50 shadow-sm">
        <div className="grid gap-6 px-6 py-6 lg:grid-cols-[1.4fr_0.9fr] lg:px-8 lg:py-8">
          <div className="space-y-4">
            <div className="inline-flex items-center rounded-full border border-blue-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-blue-600">
              Activity Log
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-black tracking-tight text-blue-950 sm:text-4xl">Accountability trail</h1>
              <p className="max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                Review your own activity history. Admins can switch to the system-wide feed and inspect everyone’s logged actions.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => {
                  setCurrentPage(1)
                  if (scope === 'all' && isAdmin) {
                    void onLoadAllLogsFirstPage()
                  } else {
                    void onLoadMyLogsFirstPage()
                  }
                }}
                disabled={isFetching}
                className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
              >
                {isFetching ? 'Refreshing...' : 'Refresh Logs'}
              </button>
              <span className="inline-flex items-center rounded-xl border border-blue-200 bg-white px-3 py-2 text-sm font-semibold text-blue-800">
                {isAdmin ? 'Admin access enabled' : 'Personal activity view'}
              </span>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            <div className="rounded-2xl border border-white/80 bg-white/80 p-4 shadow-sm backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Loaded logs</p>
              <p className="mt-2 text-3xl font-black text-blue-900">{totalLoadedLogs}</p>
            </div>
            <div className="rounded-2xl border border-white/80 bg-white/80 p-4 shadow-sm backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Page</p>
              <p className="mt-2 text-lg font-bold text-slate-900">
                {totalLoadedLogs === 0 ? '—' : `${currentPage} of ${totalPages}`}
              </p>
            </div>
            <div className="rounded-2xl border border-white/80 bg-white/80 p-4 shadow-sm backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Latest</p>
              <p className="mt-2 text-sm font-semibold text-slate-900">{latestActivity ? formatTimestamp(latestActivity.createdAt) : 'No activity yet'}</p>
            </div>
          </div>
        </div>
      </section>

      {isAdmin ? (
        <SectionGroup title="View Mode" subtitle="Switch between your personal log and the full system log">
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => void handleSwitchScope('mine')}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                scope === 'mine' ? 'bg-blue-600 text-white' : 'border border-blue-200 bg-white text-blue-700 hover:bg-blue-50'
              }`}
            >
              My Activity
            </button>
            <button
              type="button"
              onClick={() => void handleSwitchScope('all')}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                scope === 'all' ? 'bg-blue-600 text-white' : 'border border-blue-200 bg-white text-blue-700 hover:bg-blue-50'
              }`}
            >
              All Activity
            </button>
          </div>
        </SectionGroup>
      ) : null}

      {errorMessage ? <p className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-600">{errorMessage}</p> : null}

      <SectionGroup
        title={scope === 'all' && isAdmin ? 'System Activity' : 'My Activity'}
        subtitle={
          scope === 'all' && isAdmin
            ? 'Latest authenticated actions captured across the platform'
            : 'Your personal activity history captured by the accountability module'
        }
      >
        {displayedLogs.length === 0 ? (
          <EmptyState
            title="No logs available"
            subtitle={scope === 'all' && isAdmin ? 'There are no system entries to show yet.' : 'Your activity will appear here after you use the app.'}
          />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Time</th>
                    {isAdmin && scope === 'all' ? (
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">User</th>
                    ) : null}
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Action</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {displayedLogs.map((log) => (
                    <ActivityRow key={log.id} log={log} isAdminView={isAdmin && scope === 'all'} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {displayedLogs.length > 0 && (
          <div className="mt-6 space-y-4">
            {/* Pagination Info */}
            <div className="flex items-center justify-between rounded-xl bg-blue-50 px-4 py-3">
              <p className="text-sm text-slate-600">
                Showing <span className="font-semibold">{totalLoadedLogs === 0 ? 0 : startIdx + 1}</span>–
                <span className="font-semibold">{Math.min(endIdx, totalLoadedLogs)}</span> of{' '}
                <span className="font-semibold">{totalLoadedLogs}</span> loaded
                {hasMore && ' (+more available)'}
              </p>
              <p className="text-sm font-semibold text-blue-900">
                Page {currentPage} of {totalPages}
              </p>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={!canGoPrev || isFetching}
                className="rounded-xl border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
              >
                ← Previous Page
              </button>

              {hasMore && (
                <button
                  type="button"
                  onClick={() => void handleLoadMore()}
                  disabled={isFetching}
                  className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
                >
                  {isFetching ? 'Loading...' : `Load More (500 batch)`}
                </button>
              )}

              <button
                type="button"
                onClick={() => setCurrentPage((p) => (canGoNext ? p + 1 : p))}
                disabled={!canGoNext || isFetching}
                className="rounded-xl border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
              >
                Next Page →
              </button>
            </div>
          </div>
        )}

        <p className="mt-3 text-xs text-slate-500">
          {visibleColumns === 4
            ? 'System view includes the user who performed each action.'
            : 'Personal view hides other users and shows only your own recorded activity.'}
        </p>
      </SectionGroup>
    </div>
  )
}

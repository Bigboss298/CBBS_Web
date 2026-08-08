import { useEffect, useState, type FormEvent } from 'react'
import SectionGroup from '../components/SectionGroup'
import type { DepartmentDto } from '../store/departmentStore'
import type { PromoteStudentsResultDto } from '../store/promotionStore'

type PromotionPageProps = {
  currentRole: string | null
  currentDepartmentId: string | null
  departments: DepartmentDto[]
  isFetching: boolean
  isPromoting: boolean
  lastResult: PromoteStudentsResultDto | null
  errorMessage: string | null
  onPromote: (departmentId: string) => Promise<PromoteStudentsResultDto | null>
  onClear: () => void
}

export default function Promotion({
  currentRole,
  currentDepartmentId,
  departments,
  isFetching,
  isPromoting,
  lastResult,
  errorMessage,
  onPromote,
  onClear,
}: PromotionPageProps) {
  const isHOD = currentRole === 'HOD'

  // For HOD: always use their own department. For others: let them pick.
  const [departmentId, setDepartmentId] = useState(isHOD ? (currentDepartmentId ?? '') : '')
  const [confirmed, setConfirmed] = useState(false)

  // Keep HOD's departmentId in sync if departments load after mount
  useEffect(() => {
    if (isHOD && currentDepartmentId) {
      setDepartmentId(currentDepartmentId)
    }
  }, [isHOD, currentDepartmentId])

  const canPromote =
    currentRole === 'Admin' ||
    currentRole === 'Dean' ||
    currentRole === 'FacultyOfficer' ||
    currentRole === 'HOD'

  const selectedDept = departments.find((d) => d.id === departmentId)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!departmentId || !confirmed) return

    const result = await onPromote(departmentId)
    if (result?.isSuccess) {
      if (!isHOD) setDepartmentId('')
      setConfirmed(false)
    }
  }

  const handleReset = () => {
    if (!isHOD) setDepartmentId('')
    setConfirmed(false)
    onClear()
  }

  return (
    <div className="space-y-6">
      <SectionGroup
        title="Session Promotion"
        subtitle="Promote all active students in a department one level up. Students at the terminal level are graduated automatically."
      >
        {!canPromote ? (
          <p className="rounded-xl border border-dashed border-blue-200 bg-blue-50 p-4 text-sm text-blue-700">
            You do not have permission to run student promotions.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl bg-blue-50 p-4 sm:p-5">
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm font-semibold text-amber-800">⚠ This action cannot be undone</p>
              <ul className="mt-2 space-y-1 text-xs text-amber-700">
                <li>• Every active student below the terminal level will move up one level.</li>
                <li>• Students at the terminal level will be marked as <strong>graduated</strong> and deactivated.</li>
                <li>• Run this once per academic session, after all results have been confirmed.</li>
              </ul>
            </div>

            {isHOD ? (
              /* HOD sees their department as a read-only display, no dropdown */
              <div className="space-y-2">
                <span className="text-sm font-semibold text-blue-900">Department</span>
                {isFetching ? (
                  <p className="rounded-xl border border-blue-100 bg-white px-3 py-2 text-sm text-slate-400">
                    Loading department info...
                  </p>
                ) : selectedDept ? (
                  <div className="rounded-xl border border-blue-200 bg-white px-3 py-2 text-sm text-slate-800">
                    {selectedDept.name}
                    <span className="ml-2 text-xs text-slate-400">{selectedDept.facultyName}</span>
                  </div>
                ) : (
                  <p className="rounded-xl border border-amber-100 bg-amber-50 px-3 py-2 text-sm text-amber-700">
                    Your account is not linked to a department. Contact an administrator.
                  </p>
                )}
              </div>
            ) : (
              /* Admin / Dean / FacultyOfficer get the full dropdown */
              <label className="block space-y-2">
                <span className="text-sm font-semibold text-blue-900">Department</span>
                <select
                  value={departmentId}
                  onChange={(e) => {
                    setDepartmentId(e.target.value)
                    setConfirmed(false)
                    onClear()
                  }}
                  disabled={isFetching || isPromoting}
                  className="w-full rounded-xl border border-blue-200 bg-white px-3 py-2 text-base outline-none focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm"
                  required
                >
                  {isFetching ? (
                    <option value="">Loading departments...</option>
                  ) : (
                    <option value="">Select Department</option>
                  )}
                  {!isFetching &&
                    departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name} — {dept.facultyName}
                      </option>
                    ))}
                </select>
              </label>
            )}

            {selectedDept ? (
              <label className="flex items-start gap-3">
                <input
                  id="confirm-promote"
                  type="checkbox"
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                  disabled={isPromoting}
                  className="mt-0.5 h-4 w-4 rounded border-blue-300"
                />
                <span className="text-sm text-blue-900">
                  I confirm I want to promote all students in{' '}
                  <strong>{selectedDept.name}</strong> for the new academic session.
                </span>
              </label>
            ) : null}

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={isPromoting || !departmentId || !confirmed}
                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
              >
                {isPromoting ? 'Promoting...' : 'Run Promotion'}
              </button>
              <button
                type="button"
                onClick={handleReset}
                disabled={isPromoting}
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed"
              >
                Reset
              </button>
            </div>
          </form>
        )}
      </SectionGroup>

      {lastResult ? (
        <SectionGroup title="Promotion Result" subtitle="Summary of the last promotion run">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 space-y-3 sm:p-5 sm:space-y-4">
            <p className="text-sm font-semibold text-emerald-800">{lastResult.message}</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-2 sm:gap-3">
              <div className="rounded-xl border border-emerald-100 bg-white p-3 text-center shadow-sm sm:p-4">
                <p className="text-2xl font-black text-blue-700 sm:text-3xl">{lastResult.promotedCount}</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-slate-500">Students Promoted</p>
              </div>
              <div className="rounded-xl border border-emerald-100 bg-white p-3 text-center shadow-sm sm:p-4">
                <p className="text-2xl font-black text-emerald-700 sm:text-3xl">{lastResult.graduatedCount}</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-slate-500">Students Graduated</p>
              </div>
            </div>
            <p className="text-xs text-slate-500">
              Graduated students have been deactivated. New intake students can now be enrolled into the entry-level.
            </p>
          </div>
        </SectionGroup>
      ) : null}

      {errorMessage ? (
        <p className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-600">{errorMessage}</p>
      ) : null}
    </div>
  )
}

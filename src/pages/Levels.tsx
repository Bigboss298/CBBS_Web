import { useMemo, useState, type FormEvent } from 'react'
import SectionGroup from '../components/SectionGroup'
import type { DepartmentDto } from '../store/departmentStore'
import type { LevelDto } from '../store/levelStore'

type LevelsPageProps = {
  levels: LevelDto[]
  departments: DepartmentDto[]
  isDepartmentsFetching: boolean
  isFetching: boolean
  isCreating: boolean
  errorMessage: string | null
  onRefresh: () => Promise<void>
  onCreateLevel: (payload: { name: string; departmentId: string }) => Promise<LevelDto | null>
}

type LevelGroup = {
  key: string
  departments: DepartmentDto[]
}

function getLevelKey(levelName: string): string {
  const match = levelName.match(/\d+/)
  return match ? `${match[0]}L` : levelName.trim()
}

export default function Levels({
  levels,
  departments,
  isDepartmentsFetching,
  isFetching,
  isCreating,
  errorMessage,
  onRefresh,
  onCreateLevel,
}: LevelsPageProps) {
  const [name, setName] = useState('')
  const [departmentId, setDepartmentId] = useState('')
  const [selectedLevelKey, setSelectedLevelKey] = useState('')

  const selectedDepartment = useMemo(
    () => departments.find((department) => department.id === departmentId),
    [departments, departmentId],
  )

  const levelGroups = useMemo<LevelGroup[]>(() => {
    const grouped = levels.reduce<Record<string, LevelGroup>>((accumulator, level) => {
      const key = getLevelKey(level.name)

      if (!accumulator[key]) {
        accumulator[key] = { key, departments: [] }
      }

      const department = departments.find((item) => item.id === level.departmentId)
      if (department && !accumulator[key].departments.some((item) => item.id === department.id)) {
        accumulator[key].departments.push(department)
      }

      return accumulator
    }, {})

    return Object.values(grouped).sort((left, right) => left.key.localeCompare(right.key, undefined, { numeric: true }))
  }, [departments, levels])

  const selectedGroup = useMemo(
    () => levelGroups.find((group) => group.key === selectedLevelKey),
    [levelGroups, selectedLevelKey],
  )

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const created = await onCreateLevel({ name, departmentId })
    if (created) {
      setName('')
      setDepartmentId('')
    }
  }

  return (
    <div className="space-y-4">
      <SectionGroup title="Level Management" subtitle="Create levels under existing departments">
        <form onSubmit={handleSubmit} className="grid gap-3 rounded-2xl bg-blue-50 p-4 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-semibold text-blue-900">Department</span>
            <select
              value={departmentId}
              onChange={(event) => setDepartmentId(event.target.value)}
              disabled={isDepartmentsFetching}
              className="w-full rounded-xl border border-blue-200 bg-white px-3 py-2 text-base outline-none focus:border-blue-500 sm:text-sm"
              required
            >
              {isDepartmentsFetching ? (
                <option value="">Loading departments...</option>
              ) : (
                <option value="">Select Department</option>
              )}
              {!isDepartmentsFetching
                ? departments.map((department) => (
                    <option key={department.id} value={department.id}>
                      {department.name}
                    </option>
                  ))
                : null}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold text-blue-900">Level Name</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full rounded-xl border border-blue-200 bg-white px-3 py-2 text-base outline-none focus:border-blue-500 sm:text-sm"
              placeholder="e.g. 100 Level"
              required
            />
          </label>

            <div className="md:col-span-2 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="submit"
              disabled={isCreating || !departmentId}
                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              {isCreating ? 'Creating...' : 'Create Level'}
            </button>
            {selectedDepartment ? <p className="text-xs text-slate-500">Department: {selectedDepartment.name}</p> : null}
          </div>
        </form>
      </SectionGroup>

      <SectionGroup title="Levels" subtitle="Distinct levels across all departments">
        <button
          type="button"
          onClick={onRefresh}
          disabled={isFetching}
          className="mb-4 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300 sm:w-auto"
        >
          {isFetching ? 'Refreshing...' : 'Refresh Levels'}
        </button>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {levelGroups.map((group) => (
            <button
              key={group.key}
              type="button"
              onClick={() => setSelectedLevelKey(group.key)}
              className={`rounded-2xl border p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                selectedLevelKey === group.key
                  ? 'border-blue-500 bg-blue-600 text-white'
                  : 'border-blue-100 bg-white text-blue-900'
              }`}
            >
              <h3 className="text-lg font-bold">{group.key}</h3>
              <p className={`text-sm ${selectedLevelKey === group.key ? 'text-blue-50' : 'text-slate-500'}`}>
                {group.departments.length} department(s)
              </p>
            </button>
          ))}
        </div>

        {selectedGroup ? (
          <div className="mt-4 rounded-2xl border border-blue-100 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-blue-900">{selectedGroup.key}</h3>
                <p className="text-xs text-slate-500">Departments using this level</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLevelKey('')}
                className="rounded-xl border border-blue-200 px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-50"
              >
                Close
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {selectedGroup.departments.map((department) => (
                <div key={department.id} className="rounded-xl border border-blue-100 bg-blue-50 p-3">
                  <h4 className="text-sm font-semibold text-blue-900">{department.name}</h4>
                  <p className="text-xs text-slate-500">{department.facultyName}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="rounded-xl border border-dashed border-blue-200 bg-blue-50 p-4 text-sm text-blue-700">
            Select a level to view the departments that have it.
          </p>
        )}
      </SectionGroup>

      {errorMessage ? <p className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-600">{errorMessage}</p> : null}
    </div>
  )
}

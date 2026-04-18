import { useMemo, useState } from 'react'
import SectionGroup from '../components/SectionGroup'
import type { DepartmentDto } from '../store/departmentStore'
import type { FacultyDto } from '../store/facultyStore'

type DepartmentsPageProps = {
  departments: DepartmentDto[]
  faculties: FacultyDto[]
  isFacultiesFetching: boolean
  isFetching: boolean
  isCreating: boolean
  errorMessage: string | null
  onRefresh: () => Promise<void>
  onCreateDepartment: (payload: { name: string; facultyId: string }) => Promise<DepartmentDto | null>
}

export default function Departments({
  departments,
  faculties,
  isFacultiesFetching,
  isFetching,
  isCreating,
  errorMessage,
  onRefresh,
  onCreateDepartment,
}: DepartmentsPageProps) {
  const [name, setName] = useState('')
  const [facultyId, setFacultyId] = useState('')

  const selectedFacultyName = useMemo(
    () => faculties.find((faculty) => faculty.id === facultyId)?.name ?? '',
    [faculties, facultyId],
  )

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const created = await onCreateDepartment({ name, facultyId })
    if (created) {
      setName('')
      setFacultyId('')
    }
  }

  return (
    <div className="space-y-4">
      <SectionGroup title="Department Management" subtitle="Create departments under existing faculties">
        <form onSubmit={handleSubmit} className="grid gap-3 rounded-2xl bg-blue-50 p-4 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-semibold text-blue-900">Faculty</span>
            <select
              value={facultyId}
              onChange={(event) => setFacultyId(event.target.value)}
              disabled={isFacultiesFetching}
              className="w-full rounded-xl border border-blue-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
              required
            >
              {isFacultiesFetching ? <option value="">Loading faculties...</option> : <option value="">Select Faculty</option>}
              {!isFacultiesFetching
                ? faculties.map((faculty) => (
                    <option key={faculty.id} value={faculty.id}>
                      {faculty.name}
                    </option>
                  ))
                : null}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold text-blue-900">Department Name</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full rounded-xl border border-blue-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
              placeholder="e.g. Computer Science"
              required
            />
          </label>

          <div className="md:col-span-2 flex items-center gap-3">
            <button
              type="submit"
              disabled={isCreating || !facultyId}
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              {isCreating ? 'Creating...' : 'Create Department'}
            </button>
            {selectedFacultyName ? <p className="text-xs text-slate-500">Faculty: {selectedFacultyName}</p> : null}
          </div>
        </form>
      </SectionGroup>

      <SectionGroup title="Departments" subtitle="Available departments for hierarchy assignment">
        <button
          type="button"
          onClick={onRefresh}
          disabled={isFetching}
          className="mb-4 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
        >
          {isFetching ? 'Refreshing...' : 'Refresh Departments'}
        </button>

        <div className="space-y-3">
          {departments.map((department) => (
            <div key={department.id} className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-blue-900">{department.name}</h3>
              <p className="text-xs text-slate-500">{department.facultyName}</p>
            </div>
          ))}
        </div>
      </SectionGroup>

      {errorMessage ? <p className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-600">{errorMessage}</p> : null}
    </div>
  )
}

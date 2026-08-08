import { useState } from 'react'
import SectionGroup from '../components/SectionGroup'
import type { FacultyDto } from '../store/facultyStore'

type FacultiesPageProps = {
  faculties: FacultyDto[]
  isFetching: boolean
  isCreating: boolean
  errorMessage: string | null
  onRefresh: () => Promise<void>
  onCreateFaculty: (payload: { name: string }) => Promise<FacultyDto | null>
}

export default function Faculties({
  faculties,
  isFetching,
  isCreating,
  errorMessage,
  onRefresh,
  onCreateFaculty,
}: FacultiesPageProps) {
  const [name, setName] = useState('')

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const created = await onCreateFaculty({ name })
    if (created) {
      setName('')
    }
  }

  return (
    <div className="space-y-4">
      <SectionGroup title="Faculty Management" subtitle="Create faculties before onboarding dean and faculty officer accounts">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-2xl bg-blue-50 p-4 md:flex-row md:items-end">
          <label className="flex-1 space-y-2">
            <span className="text-sm font-semibold text-blue-900">Faculty Name</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full rounded-xl border border-blue-200 bg-white px-3 py-2 text-base outline-none focus:border-blue-500 sm:text-sm"
              placeholder="e.g. Faculty of Science"
              required
            />
          </label>
          <button
            type="submit"
            disabled={isCreating}
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
          >
            {isCreating ? 'Creating...' : 'Create Faculty'}
          </button>
        </form>
      </SectionGroup>

      <SectionGroup title="Faculties" subtitle="Available faculties for account assignment">
        <button
          type="button"
          onClick={onRefresh}
          disabled={isFetching}
          className="mb-4 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300 sm:w-auto"
        >
          {isFetching ? 'Refreshing...' : 'Refresh Faculties'}
        </button>

        <div className="space-y-3">
          {faculties.map((faculty) => (
            <div key={faculty.id} className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-blue-900">{faculty.name}</h3>
                  <p className="text-xs text-slate-500">ID: {faculty.id}</p>
                </div>
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                  {new Date(faculty.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </SectionGroup>

      {errorMessage ? <p className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-600">{errorMessage}</p> : null}
    </div>
  )
}

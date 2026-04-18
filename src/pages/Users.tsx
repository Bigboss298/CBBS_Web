import { useEffect, useMemo, useState, type FormEvent } from 'react'
import SectionGroup from '../components/SectionGroup'
import {
  RoleEnum,
  getCreatableRoles,
  type BulkStudentImportResultDto,
  type CreateUserRequestDto,
  type UserDto,
} from '../store/userStore'
import type { DepartmentDto } from '../store/departmentStore'
import type { FacultyDto } from '../store/facultyStore'
import type { LevelOptionDto } from '../store/levelStore'

const roleLabels: Record<RoleEnum, string> = {
  [RoleEnum.Student]: 'Student',
  [RoleEnum.LevelAdviser]: 'Level Adviser',
  [RoleEnum.HOD]: 'HOD',
  [RoleEnum.Dean]: 'Dean',
  [RoleEnum.FacultyOfficer]: 'Faculty Officer',
  [RoleEnum.Admin]: 'Admin',
}

type UsersPageProps = {
  currentRole: string | null
  users: UserDto[]
  pageNumber: number
  pageSize: number
  totalCount: number
  totalPages: number
  searchTerm: string
  faculties: FacultyDto[]
  departments: DepartmentDto[]
  levelOptions: LevelOptionDto[]
  isFacultiesFetching: boolean
  isFetchingLevelOptions: boolean
  isFetching: boolean
  isCreating: boolean
  isBulkImporting: boolean
  bulkImportResult: BulkStudentImportResultDto | null
  errorMessage: string | null
  canManageUsers: boolean
  onRefresh: (params?: { pageNumber?: number; pageSize?: number; searchTerm?: string }) => Promise<void>
  onCreateUser: (payload: CreateUserRequestDto) => Promise<UserDto | null>
  onFetchLevelsByDepartment: (departmentId: string) => Promise<void>
  onBulkImport: (file: File) => Promise<BulkStudentImportResultDto | null>
}

type UsersFormState = {
  matricNumber: string
  email: string
  fullName: string
  role: RoleEnum | null
  facultyId: string
  departmentId: string
  levelId: string
  assignedLevelId: string
  isActive: boolean
}

const emptyForm: UsersFormState = {
  matricNumber: '',
  email: '',
  fullName: '',
  role: null,
  facultyId: '',
  departmentId: '',
  levelId: '',
  assignedLevelId: '',
  isActive: true,
}

export default function Users({
  currentRole,
  users,
  pageNumber,
  pageSize,
  totalCount,
  totalPages,
  searchTerm,
  faculties,
  departments,
  levelOptions,
  isFacultiesFetching,
  isFetchingLevelOptions,
  isFetching,
  isCreating,
  isBulkImporting,
  bulkImportResult,
  errorMessage,
  canManageUsers,
  onRefresh,
  onCreateUser,
  onFetchLevelsByDepartment,
  onBulkImport,
}: UsersPageProps) {
  const [form, setForm] = useState<UsersFormState>(emptyForm)
  const [bulkFile, setBulkFile] = useState<File | null>(null)
  const [searchInput, setSearchInput] = useState(searchTerm)
  const [selectedPageSize, setSelectedPageSize] = useState(pageSize)
  const creatableRoles = useMemo(() => getCreatableRoles(currentRole), [currentRole])
  const shouldShowFacultyField = currentRole === 'Admin'
  const isLevelAdviserCreator = currentRole === 'LevelAdviser'

  useEffect(() => {
    setSearchInput(searchTerm)
  }, [searchTerm])

  useEffect(() => {
    setSelectedPageSize(pageSize)
  }, [pageSize])

  useEffect(() => {
    if (creatableRoles.length === 0) {
      return
    }

    if (form.role === null || !creatableRoles.includes(form.role)) {
      setForm((current) => ({
        ...current,
        role: null,
        facultyId: '',
        departmentId: '',
        levelId: '',
        assignedLevelId: '',
      }))
    }
  }, [creatableRoles, form.role])

  const requiresFacultyId = useMemo(() => shouldShowFacultyField && (form.role === RoleEnum.Dean || form.role === RoleEnum.FacultyOfficer || form.role === RoleEnum.Student || form.role === RoleEnum.LevelAdviser), [form.role, shouldShowFacultyField])
  const requiresDepartmentId = useMemo(
    () => form.role === RoleEnum.HOD || form.role === RoleEnum.LevelAdviser || (form.role === RoleEnum.Student && !isLevelAdviserCreator),
    [form.role, isLevelAdviserCreator],
  )
  const requiresLevelId = useMemo(() => form.role === RoleEnum.Student && !isLevelAdviserCreator, [form.role, isLevelAdviserCreator])
  const requiresAssignedLevelId = useMemo(() => form.role === RoleEnum.LevelAdviser, [form.role])

  const departmentOptions = useMemo(() => {
    if (!requiresDepartmentId) {
      return departments
    }

    if (requiresFacultyId && form.facultyId) {
      return departments.filter((department) => department.facultyId === form.facultyId)
    }

    return departments
  }, [departments, form.facultyId, requiresDepartmentId, requiresFacultyId])

  const shouldLoadLevels = requiresLevelId || requiresAssignedLevelId

  useEffect(() => {
    if (!shouldLoadLevels || !form.departmentId) {
      return
    }

    void onFetchLevelsByDepartment(form.departmentId)
  }, [form.departmentId, onFetchLevelsByDepartment, shouldLoadLevels])

  const visiblePageNumbers = useMemo(() => {
    if (totalPages <= 0) {
      return []
    }

    const windowSize = 2
    const start = Math.max(1, pageNumber - windowSize)
    const end = Math.min(totalPages, pageNumber + windowSize)

    const pages: number[] = []
    for (let current = start; current <= end; current++) {
      pages.push(current)
    }

    return pages
  }, [pageNumber, totalPages])

  const displayStart = totalCount === 0 ? 0 : (pageNumber - 1) * pageSize + 1
  const displayEnd = totalCount === 0 ? 0 : Math.min(pageNumber * pageSize, totalCount)

  const refreshUsers = async (nextPageNumber = pageNumber, nextPageSize = selectedPageSize, nextSearchTerm = searchTerm) => {
    await onRefresh({
      pageNumber: nextPageNumber,
      pageSize: nextPageSize,
      searchTerm: nextSearchTerm,
    })
  }

  const handleSearchSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    await refreshUsers(1, selectedPageSize, searchInput.trim())
  }

  const handleSearchReset = async () => {
    setSearchInput('')
    await refreshUsers(1, selectedPageSize, '')
  }

  const handlePageSizeChange = async (value: string) => {
    const nextPageSize = Number(value)
    setSelectedPageSize(nextPageSize)
    await refreshUsers(1, nextPageSize, searchInput.trim())
  }

  const handlePageChange = async (nextPageNumber: number) => {
    if (nextPageNumber < 1 || nextPageNumber > totalPages || nextPageNumber === pageNumber) {
      return
    }

    await refreshUsers(nextPageNumber, selectedPageSize, searchInput.trim())
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (creatableRoles.length === 0 || form.role === null) {
      return
    }

    await onCreateUser({
      matricNumber: form.matricNumber,
      email: form.email,
      fullName: form.fullName,
      password: '', // Auto-generated on backend from surname
      role: form.role,
      facultyId: requiresFacultyId ? form.facultyId || null : null,
      departmentId: requiresDepartmentId ? form.departmentId || null : null,
      levelId: requiresLevelId ? form.levelId || null : null,
      assignedLevelId: requiresAssignedLevelId ? form.assignedLevelId || null : null,
      isActive: form.isActive,
    })
  }

  const handleBulkSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!bulkFile) {
      return
    }

    await onBulkImport(bulkFile)
  }

  const handleDownloadTemplate = () => {
    const csvTemplate = [
      'matricNumber,email,fullName,isActive',
      'STU001,student1@example.com,Okafor John Chukwu,true',
      'STU002,student2@example.com,Adeyemi Tunde Samuel,true',
    ].join('\n')

    const blob = new Blob([csvTemplate], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'student_bulk_template.csv'
    anchor.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-r from-slate-950 via-slate-900 to-blue-900 text-white shadow-2xl">
        <div className="grid gap-6 p-6 lg:grid-cols-[1.5fr_0.9fr] lg:p-8">
          <div className="space-y-4">
            <div className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-blue-100">
              User Management
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Manage users without drowning in a long list.</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                Create staff accounts, bulk import students for LA, and browse users with server-side pagination and search.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-300">Total Matches</p>
              <p className="mt-2 text-2xl font-bold">{totalCount.toLocaleString()}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-300">Page</p>
              <p className="mt-2 text-2xl font-bold">
                {totalPages > 0 ? `${pageNumber}/${totalPages}` : '0/0'}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-300">Showing</p>
              <p className="mt-2 text-2xl font-bold">
                {displayStart === 0 ? '0' : `${displayStart}-${displayEnd}`}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <SectionGroup title="Create Account" subtitle="Create Dean, Faculty Officer, HOD, and other managed accounts">
          {canManageUsers && creatableRoles.length > 0 ? (
            <form onSubmit={handleSubmit} autoComplete="off" className="grid gap-4 rounded-2xl bg-blue-50 p-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-semibold text-blue-900">Staff / Matric Number</span>
                <input
                  name="create-user-matric-number"
                  autoComplete="off"
                  value={form.matricNumber}
                  onChange={(event) => setForm((current) => ({ ...current, matricNumber: event.target.value }))}
                  className="w-full rounded-xl border border-blue-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
                  required
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-semibold text-blue-900">Email</span>
                <input
                  type="email"
                  name="create-user-email"
                  autoComplete="off"
                  value={form.email}
                  onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                  className="w-full rounded-xl border border-blue-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
                  required
                />
              </label>

              <label className="space-y-2 md:col-span-2">
                <span className="text-sm font-semibold text-blue-900">Full Name</span>
                <p className="mb-2 text-xs text-blue-600">Format: Surname Firstname Other name (e.g., Okafor John Chukwu)</p>
                <input
                  name="create-user-full-name"
                  autoComplete="off"
                  value={form.fullName}
                  onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))}
                  className="w-full rounded-xl border border-blue-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
                  placeholder="Surname Firstname Other name"
                  required
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-semibold text-blue-900">Role</span>
                <select
                  value={form.role === null ? '' : String(form.role)}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      role: event.target.value === '' ? null : (Number(event.target.value) as RoleEnum),
                      facultyId: '',
                      departmentId: '',
                      levelId: '',
                      assignedLevelId: '',
                    }))
                  }
                  className="w-full rounded-xl border border-blue-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
                  required
                >
                  <option value="">Select Role</option>
                  {creatableRoles.map((roleValue) => (
                    <option key={roleValue} value={roleValue}>
                      {roleLabels[roleValue]}
                    </option>
                  ))}
                </select>
              </label>

              {requiresFacultyId ? (
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-blue-900">Faculty</span>
                  <select
                    value={form.facultyId}
                    onChange={(event) => setForm((current) => ({ ...current, facultyId: event.target.value }))}
                    className="w-full rounded-xl border border-blue-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
                    required
                  >
                    <option value="">Select Faculty</option>
                    {faculties.map((faculty) => (
                      <option key={faculty.id} value={faculty.id}>
                        {faculty.name}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}

              {requiresFacultyId && isFacultiesFetching ? (
                <p className="rounded-xl border border-blue-100 bg-blue-50 p-3 text-xs text-blue-700 md:col-span-2">Loading faculties...</p>
              ) : null}

              {requiresFacultyId && !isFacultiesFetching && faculties.length === 0 ? (
                <p className="rounded-xl border border-amber-100 bg-amber-50 p-3 text-xs text-amber-700 md:col-span-2">
                  No faculties found. Admin must create faculties first.
                </p>
              ) : null}

              {requiresDepartmentId ? (
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-blue-900">Department</span>
                  <select
                    value={form.departmentId}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        departmentId: event.target.value,
                        levelId: '',
                        assignedLevelId: '',
                      }))
                    }
                    className="w-full rounded-xl border border-blue-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
                    required
                  >
                    <option value="">Select Department</option>
                    {departmentOptions.map((department) => (
                      <option key={department.id} value={department.id}>
                        {department.name}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}

              {requiresLevelId ? (
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-blue-900">Level</span>
                  <select
                    value={form.levelId}
                    onChange={(event) => setForm((current) => ({ ...current, levelId: event.target.value }))}
                    className="w-full rounded-xl border border-blue-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
                    required
                  >
                    <option value="">Select Level</option>
                    {levelOptions.map((level) => (
                      <option key={level.id} value={level.id}>
                        {level.name}
                      </option>
                    ))}
                  </select>
                  {isFetchingLevelOptions ? <p className="text-xs text-blue-600">Loading levels...</p> : null}
                  {!form.departmentId ? <p className="text-xs text-blue-600">Select a department first to load levels.</p> : null}
                </label>
              ) : null}

              {requiresAssignedLevelId ? (
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-blue-900">Assigned Level</span>
                  <select
                    value={form.assignedLevelId}
                    onChange={(event) => setForm((current) => ({ ...current, assignedLevelId: event.target.value }))}
                    className="w-full rounded-xl border border-blue-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
                    required
                  >
                    <option value="">Select Level</option>
                    {levelOptions.map((level) => (
                      <option key={level.id} value={level.id}>
                        {level.name}
                      </option>
                    ))}
                  </select>
                  {isFetchingLevelOptions ? <p className="text-xs text-blue-600">Loading levels...</p> : null}
                  {!form.departmentId ? <p className="text-xs text-blue-600">Select a department first to load levels.</p> : null}
                </label>
              ) : null}

              <div className="flex items-center gap-2 md:col-span-2">
                <input
                  id="isActive"
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.checked }))}
                  className="h-4 w-4 rounded border-blue-300"
                />
                <label htmlFor="isActive" className="text-sm font-semibold text-blue-900">
                  Active account
                </label>
              </div>

              <div className="md:col-span-2 flex gap-3">
                <button
                  type="submit"
                  disabled={isCreating}
                  className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                >
                  {isCreating ? 'Creating...' : 'Create Account'}
                </button>
                <button
                  type="button"
                  onClick={() => setForm(emptyForm)}
                  className="rounded-xl border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
                >
                  Reset
                </button>
              </div>
            </form>
          ) : (
            <p className="rounded-xl border border-dashed border-blue-200 bg-blue-50 p-4 text-sm text-blue-700">
              You do not have permission to create staff accounts.
            </p>
          )}
        </SectionGroup>

        <div className="space-y-6">
          <SectionGroup title="Search & Paging" subtitle="Find users quickly without loading everything at once">
            <form onSubmit={handleSearchSubmit} className="space-y-4 rounded-2xl bg-blue-50 p-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 sm:col-span-2">
                  <span className="text-sm font-semibold text-blue-900">Search users</span>
                  <input
                    value={searchInput}
                    onChange={(event) => setSearchInput(event.target.value)}
                    className="w-full rounded-xl border border-blue-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
                    placeholder="Search by name, matric number, or email"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-semibold text-blue-900">Page size</span>
                  <select
                    value={selectedPageSize}
                    onChange={(event) => void handlePageSizeChange(event.target.value)}
                    className="w-full rounded-xl border border-blue-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
                  >
                    {[8, 12, 20, 25].map((option) => (
                      <option key={option} value={option}>
                        {option} per page
                      </option>
                    ))}
                  </select>
                </label>

                <div className="flex items-end gap-3 sm:justify-end">
                  <button
                    type="submit"
                    disabled={isFetching}
                    className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                  >
                    {isFetching ? 'Searching...' : 'Apply'}
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleSearchReset()}
                    className="rounded-xl border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </form>

            {currentRole === 'LevelAdviser' ? (
              <div className="mt-4 rounded-2xl border border-blue-100 bg-white p-4 shadow-sm">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-blue-900">Bulk Student Upload</h3>
                    <p className="text-xs text-slate-500">Upload one CSV file and create many student accounts at once</p>
                  </div>
                </div>

                <form onSubmit={handleBulkSubmit} className="space-y-4 rounded-2xl bg-blue-50 p-4">
                  <p className="text-xs text-blue-700">
                    CSV required columns: <strong>matricNumber</strong>, <strong>email</strong>, <strong>fullName</strong>.
                    Optional columns: <strong>isActive</strong>, <strong>facultyId</strong>, <strong>departmentId</strong>, <strong>levelId</strong>.
                    For Level Adviser uploads, faculty/department/level are always taken from your LA account.
                  </p>

                  <button
                    type="button"
                    onClick={handleDownloadTemplate}
                    className="rounded-xl border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
                  >
                    Download CSV Template
                  </button>

                  <label className="block space-y-2">
                    <span className="text-sm font-semibold text-blue-900">Student CSV File</span>
                    <input
                      type="file"
                      accept=".csv,text/csv"
                      onChange={(event) => setBulkFile(event.target.files?.[0] ?? null)}
                      className="w-full rounded-xl border border-blue-200 bg-white px-3 py-2 text-sm outline-none file:mr-3 file:rounded-lg file:border-0 file:bg-blue-100 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-blue-700"
                      required
                    />
                  </label>

                  <button
                    type="submit"
                    disabled={isBulkImporting || !bulkFile}
                    className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                  >
                    {isBulkImporting ? 'Importing...' : 'Upload and Import Students'}
                  </button>
                </form>

                {bulkImportResult ? (
                  <div className="mt-4 space-y-3">
                    <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900">
                      <p className="font-semibold">{bulkImportResult.message || 'Import result'}</p>
                      <p className="mt-2 text-xs text-slate-600">
                        Processed: {bulkImportResult.totalRows} | Successful: {bulkImportResult.successCount} | Failed: {bulkImportResult.failureCount}
                      </p>
                    </div>

                    {bulkImportResult.rows.length > 0 ? (
                      <div className="space-y-2">
                        {bulkImportResult.rows.map((row) => (
                          <div
                            key={`${row.rowNumber}-${row.matricNumber}-${row.email}`}
                            className={`rounded-xl border p-3 text-xs ${row.isSuccess ? 'border-emerald-100 bg-emerald-50 text-emerald-700' : 'border-red-100 bg-red-50 text-red-700'}`}
                          >
                            <p className="font-semibold">Row {row.rowNumber}</p>
                            <p>
                              {row.fullName || 'N/A'} • {row.matricNumber || 'N/A'} • {row.email || 'N/A'}
                            </p>
                            <p>{row.message}</p>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ) : null}
          </SectionGroup>
        </div>
      </div>

      <SectionGroup title="Users" subtitle="Server-side paginated list of managed accounts">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-50 p-4">
          <div>
            <p className="text-sm font-semibold text-slate-900">
              {totalCount === 0 ? 'No users found' : `${displayStart}-${displayEnd} of ${totalCount.toLocaleString()} users`}
            </p>
            <p className="text-xs text-slate-500">
              {searchTerm ? `Filtered by “${searchTerm}”` : 'Showing the current page only'}
            </p>
          </div>

          <button
            type="button"
            onClick={() => void refreshUsers(pageNumber, selectedPageSize, searchInput.trim())}
            disabled={isFetching}
            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
          >
            {isFetching ? 'Refreshing...' : 'Refresh Page'}
          </button>
        </div>

        {users.length > 0 ? (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left">
                <thead className="bg-slate-50 text-xs uppercase tracking-[0.18em] text-slate-500">
                  <tr>
                    <th className="px-4 py-3">User</th>
                    <th className="px-4 py-3">Contact</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((user) => (
                    <tr key={user.id} className="bg-white transition hover:bg-blue-50/40">
                      <td className="px-4 py-4 align-top">
                        <div className="space-y-1">
                          <p className="font-semibold text-slate-900">{user.fullName}</p>
                          <p className="text-xs text-slate-500">{user.matricNumber}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4 align-top text-sm text-slate-700">
                        <div className="space-y-1">
                          <p>{user.email}</p>
                          <p className="text-xs text-slate-500">Created {new Date(user.createdAt).toLocaleDateString()}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4 align-top">
                        <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                          {roleLabels[user.role]}
                        </span>
                      </td>
                      <td className="px-4 py-4 align-top">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${user.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
            <p className="text-sm font-semibold text-slate-900">No users found on this page.</p>
            <p className="mt-1 text-xs text-slate-500">Try another search term or refresh the current page.</p>
          </div>
        )}

        <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-500">
            Page {totalPages > 0 ? pageNumber : 0} of {totalPages} {isFetching ? '• Loading...' : ''}
          </p>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => void handlePageChange(pageNumber - 1)}
              disabled={pageNumber <= 1 || isFetching}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-400"
            >
              Previous
            </button>

            {visiblePageNumbers.map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => void handlePageChange(page)}
                disabled={isFetching}
                className={`rounded-xl px-3 py-2 text-xs font-semibold transition ${
                  page === pageNumber
                    ? 'bg-blue-600 text-white'
                    : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                } disabled:cursor-not-allowed disabled:opacity-60`}
              >
                {page}
              </button>
            ))}

            <button
              type="button"
              onClick={() => void handlePageChange(pageNumber + 1)}
              disabled={pageNumber >= totalPages || isFetching}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-400"
            >
              Next
            </button>
          </div>
        </div>
      </SectionGroup>

      {errorMessage ? <p className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-600">{errorMessage}</p> : null}
    </div>
  )
}

import { useMemo, useState, type FormEvent } from 'react'
import SectionGroup from '../components/SectionGroup'
import { RoleEnum, getCreatableRoles, type CreateUserRequestDto, type UserDto } from '../store/userStore'
import type { DepartmentDto } from '../store/departmentStore'
import type { FacultyDto } from '../store/facultyStore'
import type { LevelDto } from '../store/levelStore'

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
  faculties: FacultyDto[]
  departments: DepartmentDto[]
  levels: LevelDto[]
  isFetching: boolean
  isCreating: boolean
  errorMessage: string | null
  canManageUsers: boolean
  onRefresh: () => Promise<void>
  onCreateUser: (payload: CreateUserRequestDto) => Promise<UserDto | null>
}

type UsersFormState = {
  matricNumber: string
  email: string
  fullName: string
  password: string
  role: RoleEnum
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
  password: '',
  role: RoleEnum.Dean,
  facultyId: '',
  departmentId: '',
  levelId: '',
  assignedLevelId: '',
  isActive: true,
}

export default function Users({
  currentRole,
  users,
  faculties,
  departments,
  levels,
  isFetching,
  isCreating,
  errorMessage,
  canManageUsers,
  onRefresh,
  onCreateUser,
}: UsersPageProps) {
  const [form, setForm] = useState<UsersFormState>(emptyForm)
  const creatableRoles = useMemo(() => getCreatableRoles(currentRole), [currentRole])

  const requiresFacultyId = useMemo(
    () => form.role === RoleEnum.Dean || form.role === RoleEnum.FacultyOfficer || form.role === RoleEnum.Student || form.role === RoleEnum.LevelAdviser,
    [form.role],
  )
  const requiresDepartmentId = useMemo(
    () => form.role === RoleEnum.HOD || form.role === RoleEnum.Student || form.role === RoleEnum.LevelAdviser,
    [form.role],
  )
  const requiresLevelId = useMemo(() => form.role === RoleEnum.Student, [form.role])
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

  const levelOptions = useMemo(() => {
    if (requiresAssignedLevelId && !requiresLevelId) {
      return levels
    }

    if (form.departmentId) {
      return levels.filter((level) => level.departmentId === form.departmentId)
    }

    return levels
  }, [levels, form.departmentId, requiresAssignedLevelId, requiresLevelId])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (creatableRoles.length === 0) {
      return
    }

    await onCreateUser({
      matricNumber: form.matricNumber,
      email: form.email,
      fullName: form.fullName,
      password: form.password,
      role: form.role,
      facultyId: requiresFacultyId ? form.facultyId || null : null,
      departmentId: requiresDepartmentId ? form.departmentId || null : null,
      levelId: requiresLevelId ? form.levelId || null : null,
      assignedLevelId: requiresAssignedLevelId ? form.assignedLevelId || null : null,
      isActive: form.isActive,
    })
  }

  return (
    <div className="space-y-4">
      <SectionGroup title="Staff Management" subtitle="Create Dean, Faculty Officer, HOD, and other managed accounts">
        {canManageUsers && creatableRoles.length > 0 ? (
          <form onSubmit={handleSubmit} className="grid gap-4 rounded-2xl bg-blue-50 p-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-semibold text-blue-900">Matric Number</span>
              <input
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
                value={form.email}
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                className="w-full rounded-xl border border-blue-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
                required
              />
            </label>

            <label className="space-y-2 md:col-span-2">
              <span className="text-sm font-semibold text-blue-900">Full Name</span>
              <input
                value={form.fullName}
                onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))}
                className="w-full rounded-xl border border-blue-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
                required
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-blue-900">Password</span>
              <input
                type="password"
                value={form.password}
                onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                className="w-full rounded-xl border border-blue-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
                required
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-blue-900">Role</span>
              <select
                value={form.role}
                onChange={(event) => setForm((current) => ({ ...current, role: Number(event.target.value) as RoleEnum }))}
                className="w-full rounded-xl border border-blue-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
              >
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

            {requiresFacultyId && faculties.length === 0 ? (
              <p className="rounded-xl border border-amber-100 bg-amber-50 p-3 text-xs text-amber-700 md:col-span-2">
                No faculties found. Admin must create faculties first.
              </p>
            ) : null}

            {requiresDepartmentId ? (
              <label className="space-y-2">
                <span className="text-sm font-semibold text-blue-900">Department</span>
                <select
                  value={form.departmentId}
                  onChange={(event) => setForm((current) => ({ ...current, departmentId: event.target.value }))}
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

      <SectionGroup title="Existing Users" subtitle="Latest managed accounts">
        <button
          type="button"
          onClick={onRefresh}
          disabled={isFetching}
          className="mb-4 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
        >
          {isFetching ? 'Refreshing...' : 'Refresh Users'}
        </button>

        <div className="space-y-3">
          {users.map((user) => (
            <div key={user.id} className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-blue-900">{user.fullName}</h3>
                  <p className="text-xs text-slate-500">
                    {user.matricNumber} • {user.email} • {roleLabels[user.role]}
                  </p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${user.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                  {user.isActive ? 'Active' : 'Inactive'}
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

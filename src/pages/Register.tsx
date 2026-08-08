import { useEffect, useId, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiClient } from '../lib/apiClient'
import AuthLeftPane from '../components/AuthLeftPane'

// Roles available for self-registration
const ROLES = [
	{ id: 0, label: 'Student' },
	{ id: 1, label: 'Level Adviser' },
	{ id: 2, label: 'HOD' },
	{ id: 3, label: 'Dean' },
	{ id: 4, label: 'Faculty Officer' },
]

// What each role needs
const needsFacultyRoles   = new Set([0, 1, 2, 3, 4]) // Student, LA, HOD, Dean, FO
const needsDeptRoles      = new Set([0, 1, 2])        // Student, LA, HOD
const needsLevelRoles     = new Set([0, 1])           // Student, LA

type FacultyOption = { id: string; name: string }
type DepartmentOption = { id: string; name: string; facultyId: string }
type LevelOption = { id: string; name: string }

type FieldShellProps = {
	id: string
	label: string
	value: string
	type?: string
	placeholder: string
	autoComplete?: string
	icon: React.ReactNode
	error?: string | null
	onChange: (value: string) => void
	onBlur: () => void
}

function UserIcon() {
	return (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4.5 w-4.5">
			<path d="M20 21a8 8 0 0 0-16 0" /><circle cx="12" cy="7" r="4" />
		</svg>
	)
}
function MailIcon() {
	return (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4.5 w-4.5">
			<rect x="2" y="4" width="20" height="16" rx="2" /><path d="m2 7 10 7 10-7" />
		</svg>
	)
}
function IdCardIcon() {
	return (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4.5 w-4.5">
			<rect x="2" y="5" width="20" height="14" rx="2" /><circle cx="9" cy="12" r="2" /><path d="M13 11h4M13 15h4" />
		</svg>
	)
}
function LockIcon() {
	return (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4.5 w-4.5">
			<rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" />
		</svg>
	)
}
function EyeIcon() {
	return (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4.5 w-4.5">
			<path d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7Z" /><circle cx="12" cy="12" r="3" />
		</svg>
	)
}
function EyeOffIcon() {
	return (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4.5 w-4.5">
			<path d="m3 3 18 18" /><path d="M10.6 10.6A3 3 0 0 0 12 15a3 3 0 0 0 2.4-1.2" />
			<path d="M7.5 7.9C4.7 9.7 3 12 3 12s3.5 7 9 7c1.4 0 2.7-.3 3.8-.8" />
			<path d="M10.1 5.3A8.7 8.7 0 0 1 12 5c5.5 0 9 7 9 7a19 19 0 0 1-3.1 4.2" />
		</svg>
	)
}

function FieldShell({ id, label, value, type = 'text', placeholder, autoComplete, icon, error, onChange, onBlur }: FieldShellProps) {
	const hasValue = value.trim().length > 0
	const hasError = Boolean(error)
	return (
		<div className="space-y-1.5">
			<div className="group relative">
				<span aria-hidden="true" className={`pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 rounded-full border px-2 py-2 text-slate-400 transition ${hasError ? 'border-red-200 bg-red-50 text-red-500' : 'border-slate-200 bg-white group-focus-within:border-blue-200 group-focus-within:text-blue-700'}`}>
					{icon}
				</span>
				<input
					id={id} type={type} value={value}
					onChange={(e) => onChange(e.target.value)} onBlur={onBlur}
					placeholder=" " autoComplete={autoComplete} spellCheck={false}
					className={`peer w-full rounded-2xl border bg-white px-4 pb-3.5 pt-6 pl-12 text-sm text-slate-900 shadow-[0_1px_0_rgba(15,23,42,0.02)] outline-none transition placeholder:text-transparent focus:-translate-y-0.5 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 ${hasError ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : 'border-slate-200 hover:border-slate-300'}`}
				/>
				<label htmlFor={id} className={`absolute left-12 top-1/2 -translate-y-1/2 text-sm transition-all duration-200 peer-focus:top-3 peer-focus:translate-y-0 peer-focus:text-xs peer-focus:font-semibold peer-focus:text-blue-700 ${hasValue ? 'top-3 translate-y-0 text-xs font-semibold text-slate-500' : 'text-slate-500'}`}>
					{label}
				</label>
			</div>
			{error ? <p className="px-1 text-xs font-medium text-red-600">{error}</p> : <p className="px-1 text-xs text-slate-500">{placeholder}</p>}
		</div>
	)
}

function SelectField({ label, value, onChange, disabled, error, hint, children }: {
	label: string; value: string; onChange: (v: string) => void
	disabled?: boolean; error?: string | null; hint?: string; children: React.ReactNode
}) {
	return (
		<div className="space-y-1.5">
			<label className="text-sm font-semibold text-slate-800">{label}</label>
			<select
				value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled}
				className={`w-full rounded-2xl border bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition hover:border-slate-300 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-60 ${error ? 'border-red-300' : 'border-slate-200'}`}
			>
				{children}
			</select>
			{error ? <p className="px-1 text-xs font-medium text-red-600">{error}</p> : hint ? <p className="px-1 text-xs text-slate-500">{hint}</p> : null}
		</div>
	)
}

export default function Register() {
	const navigate = useNavigate()
	const fullNameId = useId()
	const emailId = useId()
	const matricId = useId()
	const passwordId = useId()
	const confirmPasswordId = useId()

	// core fields
	const [fullName, setFullName] = useState('')
	const [email, setEmail] = useState('')
	const [matric, setMatric] = useState('')
	const [password, setPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')
	const [roleId, setRoleId] = useState<number>(0)
	const [showPassword, setShowPassword] = useState(false)
	const [showConfirm, setShowConfirm] = useState(false)

	// faculty / department / level
	const [faculties, setFaculties] = useState<FacultyOption[]>([])
	const [departments, setDepartments] = useState<DepartmentOption[]>([])
	const [levels, setLevels] = useState<LevelOption[]>([])
	const [facultyId, setFacultyId] = useState('')
	const [departmentId, setDepartmentId] = useState('')
	const [levelId, setLevelId] = useState('')
	const [isFetchingDepts, setIsFetchingDepts] = useState(false)
	const [isFetchingLevels, setIsFetchingLevels] = useState(false)

	// form state
	const [submitted, setSubmitted] = useState(false)
	const [touched, setTouched] = useState({ fullName: false, email: false, matric: false, password: false, confirm: false })
	const [isLoading, setIsLoading] = useState(false)
	const [successMessage, setSuccessMessage] = useState<string | null>(null)
	const [errorMessage, setErrorMessage] = useState<string | null>(null)

	const needsFaculty = needsFacultyRoles.has(roleId)
	const needsDept    = needsDeptRoles.has(roleId)
	const needsLevel   = needsLevelRoles.has(roleId)
	const isStudent = roleId === 0
	const isLA = roleId === 1

	// Load faculties once on mount
	useEffect(() => {
		apiClient.get<FacultyOption[]>('/api/faculty/public')
			.then((r) => setFaculties(r.data))
			.catch(() => { /* silently fail — user will see empty dropdown */ })
	}, [])

	// Load departments when faculty changes (only for roles that need it)
	useEffect(() => {
		if (!needsDept || !facultyId) {
			setDepartments([])
			setDepartmentId('')
			setLevels([])
			setLevelId('')
			return
		}
		setIsFetchingDepts(true)
		setDepartmentId('')
		setLevels([])
		setLevelId('')
		apiClient.get<DepartmentOption[]>(`/api/department/public?facultyId=${facultyId}`)
			.then((r) => setDepartments(r.data))
			.catch(() => setDepartments([]))
			.finally(() => setIsFetchingDepts(false))
	}, [facultyId, needsDept])

	// Load levels when department changes (only for Student and LA)
	useEffect(() => {
		if (!needsLevel || !departmentId) {
			setLevels([])
			setLevelId('')
			return
		}
		setIsFetchingLevels(true)
		setLevelId('')
		apiClient.get<LevelOption[]>(`/api/level/department/${departmentId}/public-options`)
			.then((r) => setLevels(r.data))
			.catch(() => setLevels([]))
			.finally(() => setIsFetchingLevels(false))
	}, [departmentId, needsLevel])

	// Reset location fields when role changes
	useEffect(() => {
		if (!needsFaculty) {
			setFacultyId('')
			setDepartmentId('')
			setLevelId('')
		} else if (!needsDept) {
			setDepartmentId('')
			setLevelId('')
		} else if (!needsLevel) {
			setLevelId('')
		}
	}, [needsFaculty, needsDept, needsLevel])

	// Validation
	const mark = (field: keyof typeof touched) => setTouched((t) => ({ ...t, [field]: true }))
	const e = (field: keyof typeof touched, cond: boolean, msg: string) =>
		(submitted || touched[field]) && cond ? msg : null

	const fullNameError = e('fullName', fullName.trim().length === 0, 'Enter your full name.')
	const emailError = e('email', email.trim().length === 0, 'Enter your email address.')
	const matricError = e('matric', matric.trim().length === 0, 'Enter your matric number.')
	const passwordError = e('password', password.length === 0, 'Enter a password.')
	const confirmError = (submitted || touched.confirm) && confirmPassword.length === 0
		? 'Confirm your password.'
		: (submitted || touched.confirm) && confirmPassword !== password
			? 'Passwords do not match.'
			: null
	const facultyError = needsFaculty && submitted && !facultyId ? 'Select your faculty.' : null
	const departmentError = needsDept && submitted && !departmentId ? 'Select your department.' : null
	const levelError = needsLevel && submitted && !levelId ? `Select your ${isStudent ? 'level' : 'assigned level'}.` : null

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		setSubmitted(true)
		setErrorMessage(null)

		const hasError =
			fullName.trim().length === 0 || email.trim().length === 0 ||
			matric.trim().length === 0 || password.length === 0 ||
			confirmPassword !== password ||
			(needsFaculty && !facultyId) ||
			(needsDept && !departmentId) ||
			(needsLevel && !levelId)

		if (hasError) return

		setIsLoading(true)
		try {
			const payload: Record<string, unknown> = {
				fullName: fullName.trim(),
				email: email.trim(),
				matricNumber: matric.trim(),
				password,
				roleId,
			}
			if (needsFaculty) payload.facultyId = facultyId
			if (needsDept)    payload.departmentId = departmentId
			if (needsLevel) {
				if (isStudent) payload.levelId = levelId
				if (isLA)      payload.assignedLevelId = levelId
			}

			const response = await apiClient.post<{ isSuccess: boolean; message: string }>('/api/auth/register', payload)
			if (response.data.isSuccess) {
				setSuccessMessage(response.data.message)
			} else {
				setErrorMessage(response.data.message)
			}
		} catch (err: unknown) {
			const data = (err as { response?: { data?: { message?: string } } })?.response?.data
			setErrorMessage(data?.message ?? 'Registration failed. Please try again.')
		} finally {
			setIsLoading(false)
		}
	}

	// Success state
	if (successMessage) {
		return (
			<div className="min-h-screen bg-slate-100 text-slate-900">
				<div className="grid min-h-screen w-full items-center gap-4 px-4 py-4 sm:px-6 sm:py-6 lg:grid-cols-[0.84fr_1.16fr] lg:px-6 lg:py-6">
					<AuthLeftPane />
					<section className="w-full">
						<div className="mx-auto w-full max-w-lg rounded-2xl border border-slate-200/80 bg-white/95 p-8 text-center shadow-[0_24px_80px_rgba(15,23,42,0.24)] backdrop-blur-xl">
							<div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
								<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-emerald-600">
									<path d="M20 6 9 17l-5-5" />
								</svg>
							</div>
							<h2 className="text-2xl font-black tracking-tight text-slate-950">Registration submitted</h2>
							<p className="mt-3 text-sm leading-6 text-slate-500">{successMessage}</p>
							<p className="mt-2 text-sm text-slate-500">You will receive an email once an admin reviews your account.</p>
							<button type="button" onClick={() => navigate('/login')}
								className="mt-8 inline-flex min-h-11 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-blue-200">
								Back to Sign In
							</button>
						</div>
					</section>
				</div>
			</div>
		)
	}

	return (
		<div className="min-h-screen bg-slate-100 text-slate-900">
			<div className="grid min-h-screen w-full items-center gap-4 px-4 py-4 sm:px-6 sm:py-6 lg:grid-cols-[0.84fr_1.16fr] lg:px-6 lg:py-6">
				<AuthLeftPane />

				<section className="w-full">
					<div className="mx-auto w-full max-w-lg rounded-2xl border border-slate-200/80 bg-white/95 p-5 text-slate-900 shadow-[0_24px_80px_rgba(15,23,42,0.24)] backdrop-blur-xl sm:p-8">
						<div className="mb-8 space-y-4">
							<div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">
								CBBS Portal
							</div>
							<div>
								<h2 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">Create an account</h2>
								<p className="mt-2 text-sm leading-6 text-slate-500">Submit your details. An admin will review and approve your access.</p>
							</div>
						</div>

						<form onSubmit={handleSubmit} className="space-y-5" noValidate>
							{/* Full Name + Matric side-by-side on lg */}
							<div className="grid gap-5 lg:grid-cols-2">
								<FieldShell id={fullNameId} label="Full Name" value={fullName} placeholder="Enter your full name"
									autoComplete="name" icon={<UserIcon />} error={fullNameError}
									onChange={setFullName} onBlur={() => mark('fullName')} />

								<FieldShell id={matricId} label="Matric Number" value={matric}
									placeholder="Enter your matric number" autoComplete="off" icon={<IdCardIcon />} error={matricError}
									onChange={setMatric} onBlur={() => mark('matric')} />
							</div>

							{/* Email + Role side-by-side on lg */}
							<div className="grid gap-5 lg:grid-cols-2">
								<FieldShell id={emailId} label="Email Address" value={email} type="email"
									placeholder="Enter your email address" autoComplete="email" icon={<MailIcon />} error={emailError}
									onChange={setEmail} onBlur={() => mark('email')} />

								<SelectField label="Role" value={String(roleId)} onChange={(v) => setRoleId(Number(v))}
									hint="Select the role you are requesting.">
									{ROLES.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
								</SelectField>
							</div>

						{/* Faculty / Department / Level — conditional per role */}
						{needsFaculty ? (
							<div className="space-y-4 rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
								<p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">Academic Assignment</p>

								<SelectField label="Faculty" value={facultyId} onChange={(v) => setFacultyId(v)}
									error={facultyError} hint="Select your faculty.">
									<option value="">Select Faculty</option>
									{faculties.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
								</SelectField>

								{needsDept ? (
									<SelectField label="Department" value={departmentId} onChange={(v) => setDepartmentId(v)}
										disabled={!facultyId || isFetchingDepts} error={departmentError}
										hint={!facultyId ? 'Select a faculty first.' : isFetchingDepts ? 'Loading departments...' : 'Select your department.'}>
										<option value="">Select Department</option>
										{departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
									</SelectField>
								) : null}

								{needsLevel ? (
									<SelectField
										label={isStudent ? 'Level' : 'Assigned Level'}
										value={levelId} onChange={(v) => setLevelId(v)}
										disabled={!departmentId || isFetchingLevels} error={levelError}
										hint={!departmentId ? 'Select a department first.' : isFetchingLevels ? 'Loading levels...' : isStudent ? 'Select your current level.' : 'Select the level you advise.'}>
										<option value="">Select Level</option>
										{levels.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
									</SelectField>
								) : null}
							</div>
						) : null}

						{/* Password + Confirm side-by-side on lg */}
						<div className="grid gap-5 lg:grid-cols-2">
						{/* Password */}
						<div className="space-y-1.5">
							<label htmlFor={passwordId} className="text-sm font-semibold text-slate-800">Password</label>
							<div className="group relative">
								<span aria-hidden="true" className={`pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 rounded-full border px-2 py-2 text-slate-400 transition ${passwordError ? 'border-red-200 bg-red-50 text-red-500' : 'border-slate-200 bg-white group-focus-within:border-blue-200 group-focus-within:text-blue-700'}`}>
									<LockIcon />
								</span>
								<input id={passwordId} type={showPassword ? 'text' : 'password'} value={password}
									onChange={(e) => setPassword(e.target.value)} onBlur={() => mark('password')}
									placeholder=" " autoComplete="new-password"
									className={`peer w-full rounded-2xl border bg-white px-4 pb-3.5 pt-6 pl-12 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-transparent focus:-translate-y-0.5 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 ${passwordError ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : 'border-slate-200 hover:border-slate-300'}`} />
								<label htmlFor={passwordId} className={`absolute left-12 top-1/2 -translate-y-1/2 text-sm transition-all duration-200 peer-focus:top-3 peer-focus:translate-y-0 peer-focus:text-xs peer-focus:font-semibold peer-focus:text-blue-700 ${password.length > 0 ? 'top-3 translate-y-0 text-xs font-semibold text-slate-500' : 'text-slate-500'}`}>Password</label>
								<button type="button" onClick={() => setShowPassword((v) => !v)} disabled={password.length === 0}
									className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-transparent p-2 text-slate-400 transition hover:border-slate-200 hover:bg-slate-50 hover:text-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-100"
									aria-label={showPassword ? 'Hide password' : 'Show password'}>
									{showPassword ? <EyeOffIcon /> : <EyeIcon />}
								</button>
							</div>
							{passwordError ? <p className="px-1 text-xs font-medium text-red-600">{passwordError}</p> : null}
						</div>

						{/* Confirm Password */}
						<div className="space-y-1.5">
							<label htmlFor={confirmPasswordId} className="text-sm font-semibold text-slate-800">Confirm Password</label>
							<div className="group relative">
								<span aria-hidden="true" className={`pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 rounded-full border px-2 py-2 text-slate-400 transition ${confirmError ? 'border-red-200 bg-red-50 text-red-500' : 'border-slate-200 bg-white group-focus-within:border-blue-200 group-focus-within:text-blue-700'}`}>
									<LockIcon />
								</span>
								<input id={confirmPasswordId} type={showConfirm ? 'text' : 'password'} value={confirmPassword}
									onChange={(e) => setConfirmPassword(e.target.value)} onBlur={() => mark('confirm')}
									placeholder=" " autoComplete="new-password"
									className={`peer w-full rounded-2xl border bg-white px-4 pb-3.5 pt-6 pl-12 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-transparent focus:-translate-y-0.5 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 ${confirmError ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : 'border-slate-200 hover:border-slate-300'}`} />
								<label htmlFor={confirmPasswordId} className={`absolute left-12 top-1/2 -translate-y-1/2 text-sm transition-all duration-200 peer-focus:top-3 peer-focus:translate-y-0 peer-focus:text-xs peer-focus:font-semibold peer-focus:text-blue-700 ${confirmPassword.length > 0 ? 'top-3 translate-y-0 text-xs font-semibold text-slate-500' : 'text-slate-500'}`}>Confirm Password</label>
								<button type="button" onClick={() => setShowConfirm((v) => !v)} disabled={confirmPassword.length === 0}
									className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-transparent p-2 text-slate-400 transition hover:border-slate-200 hover:bg-slate-50 hover:text-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-100"
									aria-label={showConfirm ? 'Hide password' : 'Show password'}>
									{showConfirm ? <EyeOffIcon /> : <EyeIcon />}
								</button>
							</div>
							{confirmError ? <p className="px-1 text-xs font-medium text-red-600">{confirmError}</p> : null}
						</div>
						</div>

						<button type="submit" disabled={isLoading} aria-busy={isLoading}
							className="inline-flex min-h-11 w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:from-blue-600 hover:via-blue-500 hover:to-cyan-500 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-70">
							{isLoading ? (<><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />Submitting...</>) : 'Submit Registration'}
						</button>

						{errorMessage ? (
							<div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-sm">{errorMessage}</div>
						) : null}

						<p className="text-center text-sm text-slate-500">
							Already have an account?{' '}
							<Link to="/login" className="font-semibold text-blue-700 transition hover:text-blue-800">Sign in</Link>
						</p>
					</form>
				</div>
			</section>
		</div>
	</div>
	)
}

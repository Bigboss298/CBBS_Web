import { useEffect, useState } from 'react'
import SectionGroup from '../components/SectionGroup'
import { apiClient } from '../lib/apiClient'

// ─── Constants ────────────────────────────────────────────────────────────────

const roleLabels: Record<number, string> = {
	0: 'Student',
	1: 'Level Adviser',
	2: 'HOD',
	3: 'Dean',
	4: 'Faculty Officer',
	5: 'Admin',
}

const needsFacultyRoles = new Set([0, 1, 2, 3, 4])
const needsDeptRoles    = new Set([0, 1, 2])
const needsLevelRoles   = new Set([0, 1])

// ─── Types ────────────────────────────────────────────────────────────────────

type PendingUser = {
	id: string
	fullName: string
	email: string
	matricNumber: string
	role: number
	facultyId: string | null
	facultyName: string | null
	departmentId: string | null
	departmentName: string | null
	levelId: string | null
	levelName: string | null
	assignedLevelId: string | null
	assignedLevelName: string | null
	createdAt: string
}

type FacultyOption = { id: string; name: string }
type DeptOption    = { id: string; name: string; facultyId: string }
type LevelOption   = { id: string; name: string }

type ApproveForm = {
	roleId: number
	facultyId: string
	departmentId: string
	levelId: string // Student → LevelId, LA → AssignedLevelId
}

type ModalState =
	| { type: 'closed' }
	| { type: 'approving'; user: PendingUser; form: ApproveForm }
	| { type: 'rejecting'; user: PendingUser; reason: string }

// ─── Main page ────────────────────────────────────────────────────────────────

export default function PendingRegistrations() {
	const [users, setUsers]           = useState<PendingUser[]>([])
	const [isFetching, setIsFetching] = useState(false)
	const [fetchError, setFetchError] = useState<string | null>(null)
	const [modal, setModal]           = useState<ModalState>({ type: 'closed' })
	const [isProcessing, setIsProcessing] = useState(false)
	const [modalError, setModalError] = useState<string | null>(null)
	const [toastMessage, setToastMessage] = useState<string | null>(null)
	const [faculties, setFaculties]   = useState<FacultyOption[]>([])

	const fetchPending = async () => {
		setIsFetching(true)
		setFetchError(null)
		try {
			const r = await apiClient.get<PendingUser[]>('/api/user/pending-registrations')
			setUsers(r.data)
		} catch {
			setFetchError('Failed to load pending registrations. Try refreshing.')
		} finally {
			setIsFetching(false)
		}
	}

	useEffect(() => {
		void fetchPending()
		apiClient.get<FacultyOption[]>('/api/faculty/public')
			.then((r) => setFaculties(r.data))
			.catch(() => {})
	}, [])

	const showToast = (msg: string) => {
		setToastMessage(msg)
		setTimeout(() => setToastMessage(null), 4000)
	}

	const buildApproveForm = (u: PendingUser): ApproveForm => ({
		roleId:       u.role,
		facultyId:    u.facultyId    ?? '',
		departmentId: u.departmentId ?? '',
		levelId:      (u.role === 1 ? u.assignedLevelId : u.levelId) ?? '',
	})

	const openApprove = (u: PendingUser) => {
		setModalError(null)
		setModal({ type: 'approving', user: u, form: buildApproveForm(u) })
	}

	const openReject = (u: PendingUser) => {
		setModalError(null)
		setModal({ type: 'rejecting', user: u, reason: '' })
	}

	const closeModal = () => { setModal({ type: 'closed' }); setModalError(null) }

	const handleApprove = async (userId: string, form: ApproveForm) => {
		setIsProcessing(true)
		setModalError(null)
		const isLA = form.roleId === 1
		const payload: Record<string, unknown> = { userId, roleId: form.roleId }
		if (needsFacultyRoles.has(form.roleId) && form.facultyId)    payload.facultyId    = form.facultyId
		if (needsDeptRoles.has(form.roleId)    && form.departmentId) payload.departmentId = form.departmentId
		if (needsLevelRoles.has(form.roleId)   && form.levelId) {
			if (isLA) payload.assignedLevelId = form.levelId
			else      payload.levelId         = form.levelId
		}
		try {
			const r = await apiClient.post<{ isSuccess: boolean; message: string }>('/api/user/approve-registration', payload)
			if (r.data.isSuccess) {
				setUsers((prev) => prev.filter((u) => u.id !== userId))
				closeModal()
				showToast('Registration approved successfully.')
			} else {
				setModalError(r.data.message)
			}
		} catch {
			setModalError('Failed to approve registration. Please try again.')
		} finally {
			setIsProcessing(false)
		}
	}

	const handleReject = async (userId: string, reason: string) => {
		setIsProcessing(true)
		setModalError(null)
		try {
			const r = await apiClient.post<{ isSuccess: boolean; message: string }>('/api/user/reject-registration', {
				userId, reason: reason.trim() || null,
			})
			if (r.data.isSuccess) {
				setUsers((prev) => prev.filter((u) => u.id !== userId))
				closeModal()
				showToast('Registration rejected.')
			} else {
				setModalError(r.data.message)
			}
		} catch {
			setModalError('Failed to reject registration. Please try again.')
		} finally {
			setIsProcessing(false)
		}
	}

	return (
		<div className="space-y-6">
			{/* Toast */}
			{toastMessage ? (
				<div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm font-semibold text-emerald-700 shadow-lg">
					{toastMessage}
				</div>
			) : null}

			{/* Modals */}
			{modal.type === 'approving' ? (
				<ApproveModal
					user={modal.user}
					form={modal.form}
					faculties={faculties}
					isProcessing={isProcessing}
					error={modalError}
					onChange={(form) => setModal({ ...modal, form })}
					onConfirm={() => void handleApprove(modal.user.id, modal.form)}
					onClose={closeModal}
				/>
			) : null}

			{modal.type === 'rejecting' ? (
				<RejectModal
					user={modal.user}
					reason={modal.reason}
					isProcessing={isProcessing}
					error={modalError}
					onReasonChange={(reason) => setModal({ ...modal, reason })}
					onConfirm={() => void handleReject(modal.user.id, modal.reason)}
					onClose={closeModal}
				/>
			) : null}

			<SectionGroup title="Pending Registrations" subtitle="Review and approve or reject self-submitted registration requests">
				<div className="mb-4 flex items-center justify-between gap-3">
					<p className="text-sm text-slate-500">
						{isFetching ? 'Loading...' : `${users.length} pending request${users.length === 1 ? '' : 's'}`}
					</p>
					<button type="button" onClick={() => void fetchPending()} disabled={isFetching}
						className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300">
						{isFetching ? 'Refreshing...' : 'Refresh'}
					</button>
				</div>

				{fetchError ? <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{fetchError}</p> : null}

				{!isFetching && !fetchError && users.length === 0 ? (
					<p className="rounded-xl border border-dashed border-blue-200 bg-blue-50 p-6 text-sm text-blue-700">
						No pending registrations at the moment.
					</p>
				) : null}

				{users.length > 0 ? (
					<>
						{/* Mobile cards */}
						<div className="space-y-3 sm:hidden">
							{users.map((u) => (
								<article key={u.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
									<div className="space-y-1">
										<h3 className="font-semibold text-slate-900">{u.fullName}</h3>
										<p className="text-xs text-slate-500">{u.matricNumber}</p>
										<p className="break-words text-xs text-slate-600">{u.email}</p>
										<div className="flex flex-wrap gap-2 pt-1">
											<span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
												{roleLabels[u.role] ?? `Role ${u.role}`}
											</span>
											<span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">Pending</span>
										</div>
										{u.facultyName    ? <p className="text-xs text-slate-500">Faculty: <span className="font-medium text-slate-700">{u.facultyName}</span></p> : null}
										{u.departmentName ? <p className="text-xs text-slate-500">Dept: <span className="font-medium text-slate-700">{u.departmentName}</span></p> : null}
										{u.levelName         ? <p className="text-xs text-slate-500">Level: <span className="font-medium text-slate-700">{u.levelName}</span></p> : null}
										{u.assignedLevelName ? <p className="text-xs text-slate-500">Assigned Level: <span className="font-medium text-slate-700">{u.assignedLevelName}</span></p> : null}
										<p className="text-xs text-slate-400">Submitted {new Date(u.createdAt).toLocaleDateString()}</p>
									</div>
									<div className="mt-3 flex gap-2">
										<button type="button" onClick={() => openApprove(u)} disabled={isProcessing}
											className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50">
											Approve
										</button>
										<button type="button" onClick={() => openReject(u)} disabled={isProcessing}
											className="rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50">
											Reject
										</button>
									</div>
								</article>
							))}
						</div>

						{/* Desktop table */}
						<div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:block">
							<div className="overflow-x-auto">
								<table className="min-w-full divide-y divide-slate-200 text-left text-sm">
									<thead className="bg-slate-50 text-xs uppercase tracking-[0.18em] text-slate-500">
										<tr>
											<th className="px-4 py-3">Applicant</th>
											<th className="px-4 py-3">Contact</th>
											<th className="px-4 py-3">Requested Role</th>
											<th className="px-4 py-3">Academic Assignment</th>
											<th className="px-4 py-3">Submitted</th>
											<th className="px-4 py-3">Actions</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-slate-100">
										{users.map((u) => (
											<tr key={u.id} className="bg-white align-top transition hover:bg-blue-50/40">
												<td className="px-4 py-4">
													<p className="font-semibold text-slate-900">{u.fullName}</p>
													<p className="text-xs text-slate-500">{u.matricNumber}</p>
												</td>
												<td className="px-4 py-4 text-slate-700">{u.email}</td>
												<td className="px-4 py-4">
													<span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
														{roleLabels[u.role] ?? `Role ${u.role}`}
													</span>
												</td>
												<td className="px-4 py-4 space-y-0.5 text-xs text-slate-600">
													{u.facultyName    ? <p><span className="text-slate-400">Faculty:</span> {u.facultyName}</p>             : null}
													{u.departmentName ? <p><span className="text-slate-400">Dept:</span> {u.departmentName}</p>             : null}
													{u.levelName         ? <p><span className="text-slate-400">Level:</span> {u.levelName}</p>              : null}
													{u.assignedLevelName ? <p><span className="text-slate-400">Assigned Level:</span> {u.assignedLevelName}</p> : null}
													{!u.facultyName && !u.departmentName && !u.levelName && !u.assignedLevelName
														? <span className="text-slate-400">—</span> : null}
												</td>
												<td className="px-4 py-4 text-xs text-slate-500">{new Date(u.createdAt).toLocaleDateString()}</td>
												<td className="px-4 py-4">
													<div className="flex gap-2">
														<button type="button" onClick={() => openApprove(u)} disabled={isProcessing}
															className="rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50">
															Approve
														</button>
														<button type="button" onClick={() => openReject(u)} disabled={isProcessing}
															className="rounded-xl border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50">
															Reject
														</button>
													</div>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</div>
					</>
				) : null}
			</SectionGroup>
		</div>
	)
}

// ─── Approve Modal ────────────────────────────────────────────────────────────

type ApproveModalProps = {
	user: PendingUser
	form: ApproveForm
	faculties: FacultyOption[]
	isProcessing: boolean
	error: string | null
	onChange: (form: ApproveForm) => void
	onConfirm: () => void
	onClose: () => void
}

function ApproveModal({ user, form, faculties, isProcessing, error, onChange, onConfirm, onClose }: ApproveModalProps) {
	const [departments, setDepartments] = useState<DeptOption[]>([])
	const [levels, setLevels]           = useState<LevelOption[]>([])
	const [loadingDepts,  setLoadingDepts]  = useState(false)
	const [loadingLevels, setLoadingLevels] = useState(false)

	const showFaculty = needsFacultyRoles.has(form.roleId)
	const showDept    = needsDeptRoles.has(form.roleId)
	const showLevel   = needsLevelRoles.has(form.roleId)
	const isLA        = form.roleId === 1

	const set = (patch: Partial<ApproveForm>) => onChange({ ...form, ...patch })

	useEffect(() => {
		if (!showDept || !form.facultyId) { setDepartments([]); return }
		setLoadingDepts(true)
		apiClient.get<DeptOption[]>(`/api/department/public?facultyId=${form.facultyId}`)
			.then((r) => setDepartments(r.data))
			.catch(() => setDepartments([]))
			.finally(() => setLoadingDepts(false))
	}, [form.facultyId, showDept])

	useEffect(() => {
		if (!showLevel || !form.departmentId) { setLevels([]); return }
		setLoadingLevels(true)
		apiClient.get<LevelOption[]>(`/api/level/department/${form.departmentId}/public-options`)
			.then((r) => setLevels(r.data))
			.catch(() => setLevels([]))
			.finally(() => setLoadingLevels(false))
	}, [form.departmentId, showLevel])

	// close on Escape key
	useEffect(() => {
		const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && !isProcessing) onClose() }
		window.addEventListener('keydown', onKey)
		return () => window.removeEventListener('keydown', onKey)
	}, [isProcessing, onClose])

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="approve-modal-title">
			{/* Backdrop */}
			<button type="button" aria-label="Close modal" onClick={() => { if (!isProcessing) onClose() }}
				className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" />

			{/* Panel */}
			<div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-2xl">
				{/* Header */}
				<div className="flex items-start justify-between border-b border-slate-100 px-6 py-4">
					<div>
						<h2 id="approve-modal-title" className="text-base font-bold text-slate-900">Approve Registration</h2>
						<p className="mt-0.5 text-sm text-slate-500">{user.fullName} · {user.matricNumber}</p>
					</div>
					<button type="button" onClick={() => { if (!isProcessing) onClose() }} disabled={isProcessing}
						aria-label="Close"
						className="ml-4 rounded-xl border border-slate-200 p-2 text-slate-400 transition hover:bg-slate-50 hover:text-slate-700 disabled:opacity-50">
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
							<path d="M18 6 6 18M6 6l12 12" />
						</svg>
					</button>
				</div>

				{/* Body */}
				<div className="space-y-4 px-6 py-5">
					<p className="text-xs text-slate-500">Verify and adjust the applicant's details before approving.</p>

					{error ? <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}

					{/* Role */}
					<div className="space-y-1.5">
						<label className="text-sm font-semibold text-slate-800">Role</label>
						<select value={form.roleId}
							onChange={(e) => set({ roleId: Number(e.target.value), facultyId: '', departmentId: '', levelId: '' })}
							disabled={isProcessing}
							className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100 disabled:opacity-50">
							{Object.entries(roleLabels).map(([id, label]) => (
								<option key={id} value={id}>{label}</option>
							))}
						</select>
					</div>

					{/* Faculty */}
					{showFaculty ? (
						<div className="space-y-1.5">
							<label className="text-sm font-semibold text-slate-800">Faculty</label>
							<select value={form.facultyId}
								onChange={(e) => set({ facultyId: e.target.value, departmentId: '', levelId: '' })}
								disabled={isProcessing}
								className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100 disabled:opacity-50">
								<option value="">Select Faculty</option>
								{faculties.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
							</select>
						</div>
					) : null}

					{/* Department */}
					{showDept ? (
						<div className="space-y-1.5">
							<label className="text-sm font-semibold text-slate-800">Department</label>
							<select value={form.departmentId}
								onChange={(e) => set({ departmentId: e.target.value, levelId: '' })}
								disabled={isProcessing || !form.facultyId || loadingDepts}
								className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100 disabled:opacity-50">
								<option value="">
									{loadingDepts ? 'Loading...' : !form.facultyId ? 'Select a faculty first' : 'Select Department'}
								</option>
								{departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
							</select>
						</div>
					) : null}

					{/* Level */}
					{showLevel ? (
						<div className="space-y-1.5">
							<label className="text-sm font-semibold text-slate-800">{isLA ? 'Assigned Level' : 'Level'}</label>
							<select value={form.levelId}
								onChange={(e) => set({ levelId: e.target.value })}
								disabled={isProcessing || !form.departmentId || loadingLevels}
								className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100 disabled:opacity-50">
								<option value="">
									{loadingLevels ? 'Loading...' : !form.departmentId ? 'Select a department first' : isLA ? 'Select Assigned Level' : 'Select Level'}
								</option>
								{levels.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
							</select>
						</div>
					) : null}
				</div>

				{/* Footer */}
				<div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4">
					<button type="button" onClick={onClose} disabled={isProcessing}
						className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50">
						Cancel
					</button>
					<button type="button" onClick={onConfirm} disabled={isProcessing}
						className="rounded-xl bg-emerald-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50">
						{isProcessing ? 'Approving...' : 'Approve'}
					</button>
				</div>
			</div>
		</div>
	)
}

// ─── Reject Modal ─────────────────────────────────────────────────────────────

type RejectModalProps = {
	user: PendingUser
	reason: string
	isProcessing: boolean
	error: string | null
	onReasonChange: (reason: string) => void
	onConfirm: () => void
	onClose: () => void
}

function RejectModal({ user, reason, isProcessing, error, onReasonChange, onConfirm, onClose }: RejectModalProps) {
	useEffect(() => {
		const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && !isProcessing) onClose() }
		window.addEventListener('keydown', onKey)
		return () => window.removeEventListener('keydown', onKey)
	}, [isProcessing, onClose])

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="reject-modal-title">
			{/* Backdrop */}
			<button type="button" aria-label="Close modal" onClick={() => { if (!isProcessing) onClose() }}
				className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" />

			{/* Panel */}
			<div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-2xl">
				{/* Header */}
				<div className="flex items-start justify-between border-b border-slate-100 px-6 py-4">
					<div>
						<h2 id="reject-modal-title" className="text-base font-bold text-slate-900">Reject Registration</h2>
						<p className="mt-0.5 text-sm text-slate-500">{user.fullName} · {user.matricNumber}</p>
					</div>
					<button type="button" onClick={() => { if (!isProcessing) onClose() }} disabled={isProcessing}
						aria-label="Close"
						className="ml-4 rounded-xl border border-slate-200 p-2 text-slate-400 transition hover:bg-slate-50 hover:text-slate-700 disabled:opacity-50">
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
							<path d="M18 6 6 18M6 6l12 12" />
						</svg>
					</button>
				</div>

				{/* Body */}
				<div className="space-y-4 px-6 py-5">
					<p className="text-sm text-slate-500">
						This will permanently delete the registration. The applicant will receive a rejection email.
					</p>

					{error ? <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}

					<div className="space-y-1.5">
						<label className="text-sm font-semibold text-slate-800">
							Reason <span className="font-normal text-slate-400">(optional)</span>
						</label>
						<textarea
							value={reason}
							onChange={(e) => onReasonChange(e.target.value)}
							placeholder="e.g. Incorrect role selection, duplicate account..."
							rows={3}
							disabled={isProcessing}
							className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-red-400 focus:ring-4 focus:ring-red-100 disabled:opacity-50"
						/>
					</div>
				</div>

				{/* Footer */}
				<div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4">
					<button type="button" onClick={onClose} disabled={isProcessing}
						className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50">
						Cancel
					</button>
					<button type="button" onClick={onConfirm} disabled={isProcessing}
						className="rounded-xl bg-red-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50">
						{isProcessing ? 'Rejecting...' : 'Reject'}
					</button>
				</div>
			</div>
		</div>
	)
}

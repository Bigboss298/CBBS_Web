import { useMemo, useState } from 'react'
import SectionGroup from '../components/SectionGroup'
import { getDocumentTypeLabel } from '../lib/documentType'
import type { DocumentDto } from '../store/documentStore'

type DashboardPageProps = {
	role: string | null
	documents: DocumentDto[]
}

const ALL_OPTION = '__all__'

function formatDepartment(document: DocumentDto): string {
	return document.departmentName ?? 'Unassigned Department'
}

function formatLevel(document: DocumentDto): string {
	return document.levelName ?? 'Unassigned Level'
}

function formatType(document: DocumentDto): string {
	return getDocumentTypeLabel(document.documentType)
}

function formatStudent(document: DocumentDto): string {
	return `${document.uploadedByName} (${document.uploadedByMatricNumber})`
}

function toUniqueSorted(values: string[]): string[] {
	return [...new Set(values)].sort((left, right) => left.localeCompare(right))
}

function groupForStudentOrLa(documents: DocumentDto[]) {
	return documents.reduce<Record<string, DocumentDto[]>>((accumulator, document) => {
		const typeLabel = formatType(document)
		if (!accumulator[typeLabel]) {
			accumulator[typeLabel] = []
		}

		accumulator[typeLabel].push(document)
		return accumulator
	}, {})
}

function groupForLevelAdviser(documents: DocumentDto[]) {
	return documents.reduce<Record<string, Record<string, DocumentDto[]>>>((accumulator, document) => {
		const typeLabel = formatType(document)
		const studentLabel = formatStudent(document)

		if (!accumulator[typeLabel]) {
			accumulator[typeLabel] = {}
		}

		if (!accumulator[typeLabel][studentLabel]) {
			accumulator[typeLabel][studentLabel] = []
		}

		accumulator[typeLabel][studentLabel].push(document)
		return accumulator
	}, {})
}

function groupForHod(documents: DocumentDto[]) {
	return documents.reduce<Record<string, Record<string, DocumentDto[]>>>((accumulator, document) => {
		const levelLabel = formatLevel(document)
		const typeLabel = formatType(document)

		if (!accumulator[levelLabel]) {
			accumulator[levelLabel] = {}
		}

		if (!accumulator[levelLabel][typeLabel]) {
			accumulator[levelLabel][typeLabel] = []
		}

		accumulator[levelLabel][typeLabel].push(document)
		return accumulator
	}, {})
}

function groupForDean(documents: DocumentDto[]) {
	return documents.reduce<Record<string, Record<string, Record<string, DocumentDto[]>>>>((accumulator, document) => {
		const departmentLabel = formatDepartment(document)
		const levelLabel = formatLevel(document)
		const typeLabel = formatType(document)

		if (!accumulator[departmentLabel]) {
			accumulator[departmentLabel] = {}
		}

		if (!accumulator[departmentLabel][levelLabel]) {
			accumulator[departmentLabel][levelLabel] = {}
		}

		if (!accumulator[departmentLabel][levelLabel][typeLabel]) {
			accumulator[departmentLabel][levelLabel][typeLabel] = []
		}

		accumulator[departmentLabel][levelLabel][typeLabel].push(document)
		return accumulator
	}, {})
}

export default function Dashboard({ role, documents }: DashboardPageProps) {
	const [selectedDepartment, setSelectedDepartment] = useState(ALL_OPTION)
	const [selectedLevel, setSelectedLevel] = useState(ALL_OPTION)
	const [selectedType, setSelectedType] = useState(ALL_OPTION)
	const [selectedStudent, setSelectedStudent] = useState(ALL_OPTION)

	const departmentOptions = useMemo(
		() => toUniqueSorted(documents.map((document) => formatDepartment(document))),
		[documents],
	)

	const levelOptions = useMemo(() => {
		const scoped =
			selectedDepartment === ALL_OPTION
				? documents
				: documents.filter((document) => formatDepartment(document) === selectedDepartment)

		return toUniqueSorted(scoped.map((document) => formatLevel(document)))
	}, [documents, selectedDepartment])

	const typeOptions = useMemo(() => {
		const scoped = documents
			.filter((document) =>
				selectedDepartment === ALL_OPTION ? true : formatDepartment(document) === selectedDepartment,
			)
			.filter((document) => (selectedLevel === ALL_OPTION ? true : formatLevel(document) === selectedLevel))

		return toUniqueSorted(scoped.map((document) => formatType(document)))
	}, [documents, selectedDepartment, selectedLevel])

	const studentOptions = useMemo(() => {
		const scoped = documents
			.filter((document) =>
				selectedDepartment === ALL_OPTION ? true : formatDepartment(document) === selectedDepartment,
			)
			.filter((document) => (selectedLevel === ALL_OPTION ? true : formatLevel(document) === selectedLevel))
			.filter((document) => (selectedType === ALL_OPTION ? true : formatType(document) === selectedType))

		return toUniqueSorted(scoped.map((document) => formatStudent(document)))
	}, [documents, selectedDepartment, selectedLevel, selectedType])

	const filteredDocuments = useMemo(
		() =>
			documents
				.filter((document) =>
					selectedDepartment === ALL_OPTION ? true : formatDepartment(document) === selectedDepartment,
				)
				.filter((document) => (selectedLevel === ALL_OPTION ? true : formatLevel(document) === selectedLevel))
				.filter((document) => (selectedType === ALL_OPTION ? true : formatType(document) === selectedType))
				.filter((document) =>
					selectedStudent === ALL_OPTION ? true : formatStudent(document) === selectedStudent,
				),
		[documents, selectedDepartment, selectedLevel, selectedType, selectedStudent],
	)

	if (documents.length === 0) {
		return (
			<SectionGroup title="Dashboard Overview" subtitle="Role-based document hierarchy">
				<p className="rounded-xl border border-dashed border-blue-200 bg-blue-50 p-6 text-sm text-blue-700">
					No documents loaded yet. Use the refresh button to load accessible documents.
				</p>
			</SectionGroup>
		)
	}

	const showDepartmentFilter = role === 'Dean' || role === 'FacultyOfficer'
	const showLevelFilter = role === 'HOD' || role === 'Dean' || role === 'FacultyOfficer'
	const showStudentFilter = role === 'LevelAdviser'

	const filterPanel = (
		<SectionGroup title="Quick Filters" subtitle="Narrow records by hierarchy">
			<div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
				{showDepartmentFilter ? (
					<label className="space-y-2">
						<span className="text-xs font-semibold uppercase tracking-wide text-blue-700">Department</span>
						<select
							value={selectedDepartment}
							onChange={(event) => {
								setSelectedDepartment(event.target.value)
								setSelectedLevel(ALL_OPTION)
								setSelectedType(ALL_OPTION)
								setSelectedStudent(ALL_OPTION)
							}}
							className="w-full rounded-xl border border-blue-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500"
						>
							<option value={ALL_OPTION}>All Departments</option>
							{departmentOptions.map((option) => (
								<option key={option} value={option}>
									{option}
								</option>
							))}
						</select>
					</label>
				) : null}

				{showLevelFilter ? (
					<label className="space-y-2">
						<span className="text-xs font-semibold uppercase tracking-wide text-blue-700">Level</span>
						<select
							value={selectedLevel}
							onChange={(event) => {
								setSelectedLevel(event.target.value)
								setSelectedType(ALL_OPTION)
								setSelectedStudent(ALL_OPTION)
							}}
							className="w-full rounded-xl border border-blue-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500"
						>
							<option value={ALL_OPTION}>All Levels</option>
							{levelOptions.map((option) => (
								<option key={option} value={option}>
									{option}
								</option>
							))}
						</select>
					</label>
				) : null}

				<label className="space-y-2">
					<span className="text-xs font-semibold uppercase tracking-wide text-blue-700">Document Type</span>
					<select
						value={selectedType}
						onChange={(event) => {
							setSelectedType(event.target.value)
							setSelectedStudent(ALL_OPTION)
						}}
						className="w-full rounded-xl border border-blue-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500"
					>
						<option value={ALL_OPTION}>All Types</option>
						{typeOptions.map((option) => (
							<option key={option} value={option}>
								{option}
							</option>
						))}
					</select>
				</label>

				{showStudentFilter ? (
					<label className="space-y-2">
						<span className="text-xs font-semibold uppercase tracking-wide text-blue-700">Student</span>
						<select
							value={selectedStudent}
							onChange={(event) => setSelectedStudent(event.target.value)}
							className="w-full rounded-xl border border-blue-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500"
						>
							<option value={ALL_OPTION}>All Students</option>
							{studentOptions.map((option) => (
								<option key={option} value={option}>
									{option}
								</option>
							))}
						</select>
					</label>
				) : null}
			</div>

			<div className="mt-3 flex items-center justify-between gap-3 rounded-xl bg-blue-50 px-3 py-2 text-xs text-blue-700">
				<span>{filteredDocuments.length} record(s) matched</span>
				<button
					type="button"
					onClick={() => {
						setSelectedDepartment(ALL_OPTION)
						setSelectedLevel(ALL_OPTION)
						setSelectedType(ALL_OPTION)
						setSelectedStudent(ALL_OPTION)
					}}
					className="rounded-lg border border-blue-200 bg-white px-3 py-1 font-semibold text-blue-700 transition hover:bg-blue-100"
				>
					Reset Filters
				</button>
			</div>
		</SectionGroup>
	)

	if (filteredDocuments.length === 0) {
		return (
			<div className="space-y-4">
				{filterPanel}
				<SectionGroup title="No Results" subtitle="Adjust filters to see records">
					<p className="rounded-xl border border-dashed border-blue-200 bg-blue-50 p-6 text-sm text-blue-700">
						No document matched the current filter combination.
					</p>
				</SectionGroup>
			</div>
		)
	}

	if (role === 'Student') {
		const grouped = groupForStudentOrLa(filteredDocuments)

		return (
			<div className="space-y-4">
				{filterPanel}
				{Object.entries(grouped).map(([documentType, group]) => (
					<SectionGroup key={documentType} title={documentType} subtitle={`${group.length} file(s)`}>
						<ul className="space-y-2">
							{group.map((document) => (
								<li key={document.id} className="rounded-xl border border-blue-100 p-3 text-sm text-slate-700">
									<div className="flex flex-wrap items-center justify-between gap-2">
										<span>{document.fileName}</span>
										<a
											href={document.fileUrl}
											target="_blank"
											rel="noreferrer"
											className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700"
										>
											Download
										</a>
									</div>
								</li>
							))}
						</ul>
					</SectionGroup>
				))}
			</div>
		)
	}

	if (role === 'LevelAdviser') {
		const grouped = groupForLevelAdviser(filteredDocuments)

		return (
			<div className="space-y-4">
				{filterPanel}
				{Object.entries(grouped).map(([documentType, byStudent]) => (
					<SectionGroup key={documentType} title={documentType} subtitle="Student documents in your assigned level">
						<div className="space-y-3">
							{Object.entries(byStudent).map(([student, group]) => (
								<div key={`${documentType}-${student}`} className="rounded-xl border border-blue-100 p-3">
									<h3 className="text-sm font-semibold text-blue-900">{student}</h3>
									<ul className="mt-2 space-y-1 text-sm text-slate-700">
										{group.map((document) => (
											<li key={document.id} className="flex flex-wrap items-center justify-between gap-2">
												<span>{document.fileName}</span>
												<a
													href={document.fileUrl}
													target="_blank"
													rel="noreferrer"
													className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700"
												>
													Download
												</a>
											</li>
										))}
									</ul>
								</div>
							))}
						</div>
					</SectionGroup>
				))}
			</div>
		)
	}

	if (role === 'HOD') {
		const grouped = groupForHod(filteredDocuments)

		return (
			<div className="space-y-4">
				{filterPanel}
				{Object.entries(grouped).map(([level, byType]) => (
					<SectionGroup key={level} title={level} subtitle="Grouped by level and document type">
						<div className="space-y-3">
							{Object.entries(byType).map(([documentType, group]) => (
								<div key={`${level}-${documentType}`} className="rounded-xl border border-blue-100 p-3">
									<h3 className="text-sm font-semibold text-blue-900">{documentType}</h3>
									<p className="mt-1 text-xs text-slate-500">{group.length} file(s)</p>
								</div>
							))}
						</div>
					</SectionGroup>
				))}
			</div>
		)
	}

	const groupedForDean = groupForDean(filteredDocuments)

	return (
		<div className="space-y-4">
			{filterPanel}
			{Object.entries(groupedForDean).map(([department, byLevel]) => (
				<SectionGroup key={department} title={department} subtitle="Department -> Level -> Document Type">
					<div className="space-y-3">
						{Object.entries(byLevel).map(([level, byType]) => (
							<div key={`${department}-${level}`} className="rounded-xl border border-blue-100 p-3">
								<h3 className="text-sm font-semibold text-blue-900">{level}</h3>
								<div className="mt-2 space-y-2">
									{Object.entries(byType).map(([documentType, group]) => (
										<div key={`${department}-${level}-${documentType}`}>
											<p className="text-xs font-semibold text-slate-700">{documentType}</p>
											<p className="text-xs text-slate-500">{group.length} file(s)</p>
										</div>
									))}
								</div>
							</div>
						))}
					</div>
				</SectionGroup>
			))}
		</div>
	)
}

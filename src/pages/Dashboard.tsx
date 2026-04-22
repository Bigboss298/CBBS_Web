import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import SectionGroup from '../components/SectionGroup'
import { getDocumentTypeLabel } from '../lib/documentType'
import type { DocumentDto } from '../store/documentStore'
import { useDocumentStore } from '../store/documentStore'

type DashboardPageProps = {
	role: string | null
	documents: DocumentDto[]
}

type BrowserLevel = {
	label: string
	accessor: (document: DocumentDto) => string
}

type BrowserConfig = {
	heroLabel: string
	heroTitle: string
	heroDescription: string
	levels: BrowserLevel[]
}

function formatDepartment(document: DocumentDto): string {
	return document.departmentName ?? 'Unassigned Department'
}

function formatFaculty(document: DocumentDto): string {
	return document.facultyName ?? 'Unassigned Faculty'
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

function parseFolderPath(rawPath: string | null): string[] {
	if (!rawPath) {
		return []
	}

	try {
		const parsed = JSON.parse(rawPath)
		if (!Array.isArray(parsed)) {
			return []
		}

		return parsed.filter((entry): entry is string => typeof entry === 'string')
	} catch {
		return []
	}
}

function isImageFile(fileName: string): boolean {
	return /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(fileName)
}

function ViewIcon() {
	return (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
			<path d="M3 12s3.5-7 9-7 9 7 9 7-3.5 7-9 7-9-7-9-7Z" />
			<circle cx="12" cy="12" r="3" />
		</svg>
	)
}

function DownloadIcon() {
	return (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
			<path d="M12 3v10" />
			<path d="m7 10 5 5 5-5" />
			<path d="M5 20h14" />
		</svg>
	)
}

function canPreviewDocument(document: DocumentDto): boolean {
	return isImageFile(document.fileName) || /\.pdf$/i.test(document.fileName)
}

function getBrowserConfig(role: string | null): BrowserConfig {
	switch (role) {
		case 'Student':
			return {
				heroLabel: 'Student Summary',
				heroTitle: 'My Documents',
				heroDescription: 'Document types as folders. Open one to see the file cards.',
				levels: [{ label: 'Document Type', accessor: formatType }],
			}
		case 'LevelAdviser':
			return {
				heroLabel: 'Level Adviser Summary',
				heroTitle: 'Student Folders',
				heroDescription: 'Students at the top level, then their files inside.',
				levels: [{ label: 'Student', accessor: formatStudent }],
			}
		case 'HOD':
			return {
				heroLabel: 'HOD Summary',
				heroTitle: 'Level Browser',
				heroDescription: 'Level folders first, then student folders, then files.',
				levels: [
					{ label: 'Level', accessor: formatLevel },
					{ label: 'Student', accessor: formatStudent },
				],
			}
		case 'Dean':
		case 'FacultyOfficer':
			return {
				heroLabel: role === 'Dean' ? 'Dean Summary' : 'Faculty Officer Summary',
				heroTitle: 'Department Browser',
				heroDescription: 'Departments first, then levels, then students, then files.',
				levels: [
					{ label: 'Department', accessor: formatDepartment },
					{ label: 'Level', accessor: formatLevel },
					{ label: 'Student', accessor: formatStudent },
				],
			}
		case 'Admin':
			return {
				heroLabel: 'Admin Summary',
				heroTitle: 'Academic Hierarchy',
				heroDescription: 'Faculty -> Department -> Level -> Student -> Files.',
				levels: [
					{ label: 'Faculty', accessor: formatFaculty },
					{ label: 'Department', accessor: formatDepartment },
					{ label: 'Level', accessor: formatLevel },
					{ label: 'Student', accessor: formatStudent },
				],
			}
		default:
			return {
				heroLabel: 'Dashboard Summary',
				heroTitle: 'Documents',
				heroDescription: 'Browse document folders and file snapshots.',
				levels: [{ label: 'Document Type', accessor: formatType }],
			}
	}
}

function pathToParam(path: string[]): string {
	return JSON.stringify(path)
}

function matchesPath(document: DocumentDto, levels: BrowserLevel[], path: string[]): boolean {
	return path.every((segment, index) => levels[index]?.accessor(document) === segment)
}

function getCurrentDocuments(documents: DocumentDto[], levels: BrowserLevel[], path: string[]): DocumentDto[] {
	return documents.filter((document) => matchesPath(document, levels, path))
}

function getFolderLabels(documents: DocumentDto[], levels: BrowserLevel[], path: string[]): string[] {
	const depth = path.length
	if (depth >= levels.length) {
		return []
	}

	return toUniqueSorted(getCurrentDocuments(documents, levels, path).map((document) => levels[depth].accessor(document)))
}

function FolderCard({ label, count, onClick }: { label: string; count: number; onClick: () => void }) {
	return (
		<button
			type="button"
			onClick={onClick}
			className="group flex flex-col items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-5 text-center shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
		>
			<div className="flex h-28 w-32 items-center justify-center rounded-2xl bg-amber-50 text-8xl transition group-hover:scale-105">
				📁
			</div>
			<div className="space-y-0.5">
				<p className="text-sm font-semibold text-slate-900">{label}</p>
				<p className="text-[11px] text-slate-500">{count} item(s)</p>
			</div>
		</button>
	)
}

function DocumentList({
	documents,
	onPreview,
	onDownload,
}: {
	documents: DocumentDto[]
	onPreview: (document: DocumentDto) => void
	onDownload: (document: DocumentDto) => void
}) {
	return (
		<ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
			{documents.map((document) => (
				<li key={document.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
					<div className="relative h-40 overflow-hidden bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50 p-3">
						{isImageFile(document.fileName) ? (
							<img src={document.fileUrl} alt={document.fileName} className="h-full w-full rounded-xl object-cover" loading="lazy" />
						) : (
							<div className="flex h-full w-full items-center justify-center">
								<div className="w-full max-w-28 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
									<div className="space-y-2">
										<div className="h-2 w-1/2 rounded-full bg-slate-200" />
										<div className="h-2 w-3/4 rounded-full bg-slate-200" />
										<div className="h-2 w-2/3 rounded-full bg-slate-200" />
										<div className="mt-4 rounded-lg bg-slate-50 p-2 text-center">
											<p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">{formatType(document)}</p>
										</div>
									</div>
								</div>
							</div>
						)}
						</div>
					<div className="border-t border-slate-200 bg-white px-3 py-2">
						<div className="flex items-start justify-between gap-3">
							<div className="min-w-0">
								<p className="truncate text-xs font-semibold text-slate-900">{document.fileName}</p>
								<p className="mt-0.5 text-[11px] text-slate-500">{formatType(document)}</p>
							</div>
							<div className="flex items-center gap-2 text-slate-500">
								{canPreviewDocument(document) ? (
									<button
										type="button"
										onClick={() => onPreview(document)}
										className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
										title="View"
									>
										<ViewIcon />
									</button>
								) : null}
								<button
									type="button"
									onClick={() => onDownload(document)}
									className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
									title="Download"
								>
									<DownloadIcon />
								</button>
							</div>
						</div>
					</div>
				</li>
			))}
		</ul>
	)
}

export default function Dashboard({ role, documents }: DashboardPageProps) {
	const [previewDocument, setPreviewDocument] = useState<DocumentDto | null>(null)
	const [searchParams, setSearchParams] = useSearchParams()
	const downloadDocument = useDocumentStore((state) => state.downloadDocument)
	const config = useMemo(() => getBrowserConfig(role), [role])
	const currentPath = useMemo(() => parseFolderPath(searchParams.get('path')), [searchParams])
	const safePath = currentPath.slice(0, config.levels.length)
	const currentDocuments = useMemo(() => getCurrentDocuments(documents, config.levels, safePath), [documents, config.levels, safePath])
	const isLeafLevel = safePath.length >= config.levels.length
	const nextFolderLabels = useMemo(() => getFolderLabels(documents, config.levels, safePath), [documents, config.levels, safePath])

	const navigatePath = (nextPath: string[]) => {
		const normalized = nextPath.slice(0, config.levels.length)
		setSearchParams(normalized.length > 0 ? { path: pathToParam(normalized) } : {})
	}

	const goBack = () => {
		navigatePath(safePath.slice(0, -1))
	}

	const totalDocuments = documents.length
	const folderCount = nextFolderLabels.length
	const visibleItemCount = currentDocuments.length
	const levelLabel = isLeafLevel ? 'Files' : config.levels[safePath.length]?.label ?? 'Folders'
	const previewableDocument = previewDocument && canPreviewDocument(previewDocument) ? previewDocument : null

	const breadcrumbSegments = [
		{ label: 'Home', path: [] as string[] },
		...safePath.map((segment, index) => ({ label: segment, path: safePath.slice(0, index + 1) })),
	]

	if (documents.length === 0) {
		return (
			<div className="space-y-6">
				<section className="overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-r from-slate-950 via-slate-900 to-blue-900 text-white shadow-2xl">
					<div className="grid gap-6 p-6 lg:grid-cols-[1.5fr_0.9fr] lg:p-8">
						<div className="space-y-4">
							<div className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-blue-100">
								{config.heroLabel}
							</div>
							<div>
								<h1 className="text-3xl font-black tracking-tight sm:text-4xl">{config.heroTitle}</h1>
								<p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
									{config.heroDescription}
								</p>
							</div>
						</div>
						<div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
							<div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
								<p className="text-xs uppercase tracking-[0.18em] text-slate-300">Total Documents</p>
								<p className="mt-2 text-2xl font-bold">0</p>
							</div>
							<div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
								<p className="text-xs uppercase tracking-[0.18em] text-slate-300">Visible Folders</p>
								<p className="mt-2 text-2xl font-bold">0</p>
							</div>
							<div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
								<p className="text-xs uppercase tracking-[0.18em] text-slate-300">Visible Items</p>
								<p className="mt-2 text-2xl font-bold">0</p>
							</div>
						</div>
					</div>
				</section>

				<SectionGroup title="No Documents" subtitle="Refresh to load accessible records">
					<p className="rounded-xl border border-dashed border-blue-200 bg-blue-50 p-6 text-sm text-blue-700">
						No documents loaded yet. Use the refresh icon to load accessible documents.
					</p>
				</SectionGroup>
			</div>
		)
	}
	const renderPage = () => {
		const currentLabel = safePath.length === 0 ? 'Home' : safePath[safePath.length - 1]

		return (
			<div className="space-y-6">
				<section className="overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-r from-slate-950 via-slate-900 to-blue-900 text-white shadow-2xl">
					<div className="grid gap-6 p-6 lg:grid-cols-[1.5fr_0.9fr] lg:p-8">
						<div className="space-y-4">
							<div className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-blue-100">
								{config.heroLabel}
							</div>
							<div>
								<h1 className="text-3xl font-black tracking-tight sm:text-4xl">{config.heroTitle}</h1>
								<p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">{config.heroDescription}</p>
							</div>
						</div>
						<div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
							<div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
								<p className="text-xs uppercase tracking-[0.18em] text-slate-300">Total Documents</p>
								<p className="mt-2 text-2xl font-bold">{totalDocuments.toLocaleString()}</p>
							</div>
							<div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
								<p className="text-xs uppercase tracking-[0.18em] text-slate-300">Current Folders</p>
								<p className="mt-2 text-2xl font-bold">{folderCount.toLocaleString()}</p>
							</div>
							<div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
								<p className="text-xs uppercase tracking-[0.18em] text-slate-300">Current Items</p>
								<p className="mt-2 text-2xl font-bold">{visibleItemCount.toLocaleString()}</p>
							</div>
						</div>
					</div>
				</section>

				<div className="rounded-2xl p-4 shadow-sm">
					<div className="flex flex-wrap items-center justify-between gap-3">
						<div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
							<button
								type="button"
								onClick={() => navigatePath([])}
								className="px-3 py-1.5 font-semibold text-slate-700 transition hover:bg-slate-100"
							>
								Home
							</button>
							{breadcrumbSegments.slice(1).map((segment) => (
								<div key={segment.path.join('|')} className="flex items-center gap-2">
									<span className="text-slate-300">/</span>
									<button
										type="button"
										onClick={() => navigatePath(segment.path)}
										className="px-3 py-1.5 font-semibold text-slate-700 transition hover:bg-slate-100"
									>
										{segment.label}
									</button>
								</div>
							))}
						</div>
					</div>
					<p className="mt-3 text-xs text-slate-500">Current view: {currentLabel}</p>
				</div>

				<SectionGroup title={config.levels[safePath.length]?.label ?? 'Files'} subtitle={isLeafLevel ? 'File snapshots' : `${levelLabel} folder grid`}>
					{!isLeafLevel ? (
						nextFolderLabels.length > 0 ? (
							<div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
								{nextFolderLabels.map((label) => (
									<FolderCard
										key={label}
										label={label}
										count={getCurrentDocuments(documents, config.levels, safePath).filter((document) => config.levels[safePath.length].accessor(document) === label).length}
										onClick={() => navigatePath([...safePath, label])}
									/>
								))}
							</div>
						) : (
							<p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
								No folders found in the current view.
							</p>
						)
					) : currentDocuments.length > 0 ? (
						<DocumentList
							documents={currentDocuments}
							onPreview={(document) => setPreviewDocument(document)}
							onDownload={(document) => void downloadDocument({ documentId: document.id, fileName: document.fileName })}
						/>
					) : (
						<p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
							No files found in this folder.
						</p>
					)}
				</SectionGroup>

				{previewableDocument ? (
					<div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 py-6 backdrop-blur-sm">
						<div className="w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl">
							<div className="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-4">
								<div>
									<p className="text-sm font-semibold text-slate-900">{previewableDocument.fileName}</p>
									<p className="text-xs text-slate-500">{formatType(previewableDocument)}</p>
								</div>
								<button
									type="button"
									onClick={() => setPreviewDocument(null)}
									className="rounded-full border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
								>
									Close
								</button>
							</div>
							<div className="max-h-[80vh] overflow-auto bg-slate-50 p-4">
								{isImageFile(previewableDocument.fileName) ? (
									<img src={previewableDocument.fileUrl} alt={previewableDocument.fileName} className="mx-auto max-h-[75vh] rounded-2xl object-contain" />
								) : (
									<iframe
										src={previewableDocument.fileUrl}
										title={previewableDocument.fileName}
										className="h-[75vh] w-full rounded-2xl border border-slate-200 bg-white"
									/>
								)}
							</div>
						</div>
					</div>
				) : null}
			</div>
		)
	}

	return renderPage()
}

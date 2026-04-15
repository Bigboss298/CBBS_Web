import DocumentCard from './DocumentCard'
import SectionGroup from './SectionGroup'
import { getDocumentTypeLabel } from '../lib/documentType'
import type { DocumentDto } from '../store/documentStore'

type DocumentListProps = {
	documents: DocumentDto[]
	isLoading?: boolean
	emptyMessage?: string
}

export default function DocumentList({
	documents,
	isLoading = false,
	emptyMessage = 'No documents found yet.',
}: DocumentListProps) {
	if (isLoading) {
		return (
			<SectionGroup title="Documents" subtitle="Loading your records">
				<p className="rounded-xl bg-blue-50 p-4 text-sm text-blue-700">Fetching documents...</p>
			</SectionGroup>
		)
	}

	if (documents.length === 0) {
		return (
			<SectionGroup title="Documents" subtitle="Grouped by document type">
				<p className="rounded-xl border border-dashed border-blue-200 bg-blue-50 p-6 text-sm text-blue-700">
					{emptyMessage}
				</p>
			</SectionGroup>
		)
	}

	const groupedDocuments = documents.reduce<Record<string, DocumentDto[]>>((accumulator, document) => {
		const label = getDocumentTypeLabel(document.documentType)
		if (!accumulator[label]) {
			accumulator[label] = []
		}

		accumulator[label].push(document)
		return accumulator
	}, {})

	return (
		<div className="space-y-4">
			{Object.entries(groupedDocuments).map(([documentType, group]) => (
				<SectionGroup key={documentType} title={documentType} subtitle={`${group.length} file(s)`}>
					<div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
						{group.map((document) => (
							<DocumentCard key={document.id} document={document} />
						))}
					</div>
				</SectionGroup>
			))}
		</div>
	)
}

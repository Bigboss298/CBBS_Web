import DocumentList from '../components/DocumentList'
import FileUpload from '../components/FileUpload'
import SectionGroup from '../components/SectionGroup'
import type { DocumentDto, DocumentTypeEnum } from '../store/documentStore'

type UploadPageProps = {
	documents: DocumentDto[]
	isFetching: boolean
	isUploading: boolean
	errorMessage: string | null
	onRefresh: () => Promise<void>
	onUpload: (payload: { file: File; documentType: DocumentTypeEnum }) => Promise<DocumentDto | null>
}

export default function Upload({
	documents,
	isFetching,
	isUploading,
	errorMessage,
	onRefresh,
	onUpload,
}: UploadPageProps) {
	return (
		<div className="space-y-4">
			<FileUpload isUploading={isUploading} onUpload={onUpload} />

			{errorMessage ? (
				<SectionGroup title="Upload Status">
					<p className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-600">{errorMessage}</p>
				</SectionGroup>
			) : null}

			<SectionGroup title="Your Documents" subtitle="Refresh to load latest uploads">
				<button
					type="button"
					onClick={onRefresh}
					disabled={isFetching}
					className="mb-4 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
				>
					{isFetching ? 'Refreshing...' : 'Refresh Documents'}
				</button>
				<DocumentList documents={documents} isLoading={isFetching} emptyMessage="Upload a document to get started." />
			</SectionGroup>
		</div>
	)
}

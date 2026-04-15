import { useMemo, useState } from 'react'
import { DOCUMENT_TYPE_LABELS } from '../lib/documentType'
import { DocumentTypeEnum, type DocumentDto } from '../store/documentStore'

type FileUploadProps = {
	isUploading: boolean
	onUpload: (payload: { file: File; documentType: DocumentTypeEnum }) => Promise<DocumentDto | null>
}

export default function FileUpload({ isUploading, onUpload }: FileUploadProps) {
	const [selectedFile, setSelectedFile] = useState<File | null>(null)
	const [documentType, setDocumentType] = useState<DocumentTypeEnum>(DocumentTypeEnum.AdmissionLetter)

	const options = useMemo(
		() =>
			Object.entries(DOCUMENT_TYPE_LABELS).map(([value, label]) => ({
				value: Number(value) as DocumentTypeEnum,
				label,
			})),
		[],
	)

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault()

		if (!selectedFile) {
			return
		}

		const uploaded = await onUpload({
			file: selectedFile,
			documentType,
		})

		if (uploaded) {
			setSelectedFile(null)
			event.currentTarget.reset()
		}
	}

	return (
		<form onSubmit={handleSubmit} className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
			<div className="mb-4">
				<h2 className="text-lg font-bold text-blue-900">Upload Document</h2>
				<p className="mt-1 text-sm text-slate-500">Choose a document type and upload one file at a time.</p>
			</div>

			<div className="grid gap-4 sm:grid-cols-2">
				<label className="space-y-2">
					<span className="text-sm font-semibold text-blue-900">Document Type</span>
					<select
						value={documentType}
						onChange={(event) => setDocumentType(Number(event.target.value) as DocumentTypeEnum)}
						className="w-full rounded-xl border border-blue-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500"
					>
						{options.map((option) => (
							<option key={option.value} value={option.value}>
								{option.label}
							</option>
						))}
					</select>
				</label>

				<label className="space-y-2">
					<span className="text-sm font-semibold text-blue-900">Select File</span>
					<input
						type="file"
						onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
						className="w-full rounded-xl border border-blue-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500"
						required
					/>
				</label>
			</div>

			<button
				type="submit"
				disabled={isUploading || !selectedFile}
				className="mt-4 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
			>
				{isUploading ? 'Uploading...' : 'Upload'}
			</button>
		</form>
	)
}

import { getDocumentTypeLabel } from '../lib/documentType'
import type { DocumentDto } from '../store/documentStore'

type DocumentCardProps = {
  document: DocumentDto
}

export default function DocumentCard({ document }: DocumentCardProps) {
  return (
    <article className="flex h-full flex-col rounded-2xl border border-blue-100 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="mb-3 flex items-start justify-between gap-2">
        <h3 className="line-clamp-2 break-words text-sm font-semibold text-blue-900">{document.fileName}</h3>
        <span className="shrink-0 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
          {getDocumentTypeLabel(document.documentType)}
        </span>
      </div>

      <div className="flex-1 space-y-1 text-xs leading-5 text-slate-600">
        <p className="break-words">Uploaded by: {document.uploadedByName}</p>
        <p className="break-words">Matric: {document.uploadedByMatricNumber}</p>
        <p className="break-words">
          {document.departmentName ?? 'No Department'} / {document.levelName ?? 'No Level'}
        </p>
        <p>{new Date(document.createdAt).toLocaleString()}</p>
      </div>

      <div className="mt-4">
        <a
          href={document.fileUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-700 sm:w-auto"
        >
          Download
        </a>
      </div>
    </article>
  )
}

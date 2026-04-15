import { DocumentTypeEnum } from '../store/documentStore'

export const DOCUMENT_TYPE_LABELS: Record<DocumentTypeEnum, string> = {
  [DocumentTypeEnum.AdmissionLetter]: 'Admission Letters',
  [DocumentTypeEnum.BioData]: 'Bio Data',
  [DocumentTypeEnum.Result]: 'Results',
  [DocumentTypeEnum.ClearanceCertificate]: 'Clearance Certificates',
  [DocumentTypeEnum.PaymentReceipt]: 'Payment Receipts',
  [DocumentTypeEnum.Others]: 'Others',
}

export function getDocumentTypeLabel(documentType: DocumentTypeEnum): string {
  return DOCUMENT_TYPE_LABELS[documentType] ?? 'Unknown'
}

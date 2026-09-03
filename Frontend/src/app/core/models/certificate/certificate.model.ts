export interface Certificate {
  id: number;
  studentId: number;
  studentName?: string;
  certificateTypeId: number;
  certificateTypeName?: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Ready for Collection' | string;
  requestedAt: string;
}

export interface CertificateType {
  id: number;
  name: string;
  isActive: boolean;
}

export interface SubmitCertificateRequestDto {
  certificateTypeId: number;
  reason: string;
}

export interface UpdateCertificateStatusDto {
  status: 'Pending' | 'Approved' | 'Rejected' | 'Ready for Collection' | string;
}

export interface CreateCertificateTypeRequestDto {
  name: string;
}

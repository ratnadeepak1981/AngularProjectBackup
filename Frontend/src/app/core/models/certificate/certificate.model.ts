export interface Certificate {
  id: number;
  studentId: number;
  certificateType: string;
  purpose?: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Issued' | string;
  requestedDate: string;
}

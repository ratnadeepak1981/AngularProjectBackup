export interface Complaint {
  id: number;
  studentId: number;
  studentName?: string;
  categoryId: number;
  categoryName?: string;
  description: string;
  status: 'Pending' | 'In Progress' | 'Resolved' | 'Rejected' | string;
  resolutionNote?: string;
  createdAt: string;
}

export interface ComplaintCategory {
  id: number;
  name: string;
  isActive: boolean;
}

export interface SubmitComplaintDto {
  categoryId: number;
  description: string;
}

export interface UpdateComplaintStatusDto {
  status: 'Pending' | 'In Progress' | 'Resolved' | 'Rejected' | string;
  resolutionNote?: string;
}

export interface CreateComplaintCategoryDto {
  name: string;
}

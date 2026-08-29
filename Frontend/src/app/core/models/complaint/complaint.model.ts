export interface Complaint {
  id: number;
  studentId: number;
  title: string;
  description: string;
  status: 'Pending' | 'InProgress' | 'Resolved' | 'Closed' | string;
  createdAt: string;
}

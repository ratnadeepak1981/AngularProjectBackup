export interface Billing {
  id: number;
  studentId: number;
  description: string;
  amount: number;
  status: 'Pending' | 'Paid' | 'Overdue' | string;
  dueDate: string;
  paidDate?: string;
}

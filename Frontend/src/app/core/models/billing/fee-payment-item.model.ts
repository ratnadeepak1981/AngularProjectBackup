export interface FeePaymentItem {
  id: number;
  studentId?: number;
  studentName?: string;
  studentIndexNumber?: string;
  feeTypeId?: number;
  feeTypeName?: string;
  description?: string;
  amount: number;
  status: string;
  receiptNumber?: string;
  paidAt?: string;
  dueDate?: string;
  createdAt?: string;
}

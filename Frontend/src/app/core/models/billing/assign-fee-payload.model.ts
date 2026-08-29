export interface AssignFeePayload {
  studentId?: number | null;
  facultyId?: number | null;
  feeTypeId: number;
  amount: number;
  billingPeriod: string;
  description: string;
  dueDate: string;
}

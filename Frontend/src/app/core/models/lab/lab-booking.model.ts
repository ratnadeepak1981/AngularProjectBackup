export interface LabBooking {
  id: number;
  studentId: number;
  seatId: number;
  startTime: string;
  endTime: string;
  status: 'Active' | 'Hold' | 'Completed' | 'Cancelled' | string;
}

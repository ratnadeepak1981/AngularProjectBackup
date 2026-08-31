import { LabSeat } from './lab-seat.model';

export interface LabBooking {
  id: number;
  studentId: number;
  labId?: number;
  labName?: string;
  labType?: string;
  seatId?: number;
  seatNumber?: string;
  bookingDate: string;
  timeSlot: string;
  status: 'Confirmed' | 'Held' | 'Cancelled' | 'Completed' | string;
  expiresAt?: string;
  createdAt?: string;
}

export interface LabMatrixLayoutResponse {
  totalRows: number;
  totalColumns: number;
  seats: LabSeat[];
}

export interface CreateHoldPayload {
  labId: number;
  studentId: number;
  seatId?: number;
  bookingDate: string;
  timeSlot: string;
}

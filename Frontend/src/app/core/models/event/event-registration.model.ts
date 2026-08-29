export interface EventRegistration {
  id: number;
  eventId?: number;
  studentId?: number;
  status: string;
  registrationDate?: string;
  student?: {
    id?: number;
    indexNumber?: string;
    fullName?: string;
    email?: string;
  };
}

export type EventAttendeeItem = EventRegistration;

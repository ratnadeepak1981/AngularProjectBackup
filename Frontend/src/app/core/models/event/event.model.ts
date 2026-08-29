export interface CampusEvent {
  id: number;
  title: string;
  description?: string;
  venueId?: number;
  venueName?: string;
  startDateTime?: string;
  endDateTime?: string;
  eventDate?: string;
  capacity: number;
  registeredCount: number;
  currentAttendeesCount?: number;
  usesReservedSeating?: boolean;
  registeredStudentIds?: number[];
  isRegistered?: boolean;
}

export type AdminEventItem = CampusEvent;

export interface CreateEventPayload {
  title: string;
  venueId: number;
  startDateTime: string;
  endDateTime: string;
  capacity: number;
  description?: string;
}

export interface EventCardModel {
  id: number;
  title: string;
  venueName: string;
  startDateTime: string;
  endDateTime: string;
  capacity: number;
  registeredCount: number;
  description?: string;
  isRegistered?: boolean;
  isFull?: boolean;
}

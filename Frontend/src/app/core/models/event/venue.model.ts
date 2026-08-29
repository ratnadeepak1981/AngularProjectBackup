export interface Venue {
  id: number;
  name: string;
  type: string;
  location?: string;
  capacity: number;
  isActive: boolean;
}

export type AdminVenueItem = Venue;

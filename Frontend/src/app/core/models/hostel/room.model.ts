export interface HostelRoom {
  id: number;
  roomNumber: string;
  maxCapacity: number;
  currentOccupancy?: number;
  balanceCapacity?: number;
}

export type Room = HostelRoom;

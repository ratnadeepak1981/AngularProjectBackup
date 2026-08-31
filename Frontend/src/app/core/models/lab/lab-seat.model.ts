export interface LabSeat {
  id: number;
  labId: number;
  seatNumber: string;
  rowIndex: number;
  columnIndex: number;
  status: 'Available' | 'Held' | 'Occupied' | 'Broken' | string;
  isBroken?: boolean;
  equipmentDetails?: string;
  maintenanceStatus?: string;
}

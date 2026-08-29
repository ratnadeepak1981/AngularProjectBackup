import { HostelRoom } from './room.model';

export interface HostelBuilding {
  id: number;
  name: string;
  rooms?: HostelRoom[];
}

export type Hostel = HostelBuilding;

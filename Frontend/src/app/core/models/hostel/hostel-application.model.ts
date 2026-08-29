export interface HousingApplication {
  id: number;
  studentId?: number;
  studentIndexNumber?: string;
  studentName?: string;
  hostelName?: string;
  preferredHostelId?: number;
  preferredHostelName?: string;
  termSemester?: string;
  specialRequirements?: string;
  status: string;
  assignedRoomId?: number;
  assignedRoomNumber?: string;
  createdAt?: string;
}

export type HostelApplication = HousingApplication;

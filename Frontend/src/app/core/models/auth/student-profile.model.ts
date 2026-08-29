export interface StudentProfile {
  id: number;
  indexNumber: string;
  name: string;
  email: string;
  facultyName?: string;
  contactDetails?: string;
  emailVerified: boolean;
  isActive: boolean;
}

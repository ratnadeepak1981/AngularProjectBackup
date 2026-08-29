export interface RegisterStudentRequest {
  indexNumber: string;
  email: string;
  password: string;
  facultyId: number;
  contactDetails?: string;
}

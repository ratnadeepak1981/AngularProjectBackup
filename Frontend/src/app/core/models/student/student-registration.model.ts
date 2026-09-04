import { StudentPhoneNumber } from './student-phone-number.model';
import { StudentAddress } from './student-address.model';

export interface RegisterStudentRequest {
  indexNumber: string;
  email: string;
  password: string;
  facultyId: number;
  contactDetails?: string;
  phoneNumbers?: StudentPhoneNumber[];
  addresses?: StudentAddress[];
}

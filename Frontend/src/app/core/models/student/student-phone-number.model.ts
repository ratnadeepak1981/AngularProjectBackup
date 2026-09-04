export interface StudentPhoneNumber {
  id?: number;
  phoneType: string; // 'Primary Mobile', 'Home Landline', 'Emergency Contact'
  phoneNumber: string;
  isPrimary: boolean;
  isVerified: boolean;
}

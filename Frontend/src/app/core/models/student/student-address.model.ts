export interface StudentAddress {
  id?: number;
  addressType: string; // 'Permanent', 'Residential', 'Hostel'
  addressLine1: string;
  addressLine2?: string;
  city: string;
  districtOrProvince?: string;
  postalCode?: string;
  country: string;
  isPrimary: boolean;
}

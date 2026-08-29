export interface CsvMasterRow {
  lineNumber: number;
  indexNumber: string;
  fullName: string;
  facultyId: number;
  isValid: boolean;
  errors: string[];
}

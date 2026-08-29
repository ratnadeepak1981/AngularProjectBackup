export interface ErrorDiagnostics {
  statusCode?: number;
  endpoint?: string;
  timestamp: string;
  technicalMessage?: string;
  errors?: string[];
}

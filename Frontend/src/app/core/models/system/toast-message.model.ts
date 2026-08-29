import { ErrorDiagnostics } from './error-diagnostics.model';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error' | 'critical';
  title?: string;
  message: string;
  diagnostics?: ErrorDiagnostics;
  durationMs?: number;
}

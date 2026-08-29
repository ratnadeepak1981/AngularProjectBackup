import { Injectable, signal } from '@angular/core';
import { ToastMessage } from '../models/system/toast-message.model';
import { ErrorDiagnostics } from '../models/system/error-diagnostics.model';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  public readonly toasts = signal<ToastMessage[]>([]);

  public show(
    type: 'success' | 'info' | 'warning' | 'error' | 'critical',
    message: string,
    diagnostics?: ErrorDiagnostics,
    title?: string,
    durationMs: number = 5000
  ): string {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: ToastMessage = {
      id,
      type,
      message,
      title,
      diagnostics,
      durationMs,
    };

    this.toasts.update((current) => [...current, newToast]);

    if (durationMs > 0) {
      setTimeout(() => {
        this.remove(id);
      }, durationMs);
    }

    return id;
  }

  public success(message: string, title?: string): string {
    return this.show('success', message, undefined, title, 4000);
  }

  public info(message: string, title?: string): string {
    return this.show('info', message, undefined, title, 4000);
  }

  public warning(message: string, title?: string): string {
    return this.show('warning', message, undefined, title, 6000);
  }

  public error(message: string, diagnostics?: ErrorDiagnostics, title?: string): string {
    return this.show('error', message, diagnostics, title, 7000);
  }

  public critical(message: string, diagnostics?: ErrorDiagnostics, title?: string): string {
    return this.show('critical', message, diagnostics, title, 10000);
  }

  public remove(id: string): void {
    this.toasts.update((current) => current.filter((t) => t.id !== id));
  }

  public clear(): void {
    this.toasts.set([]);
  }
}

import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ToastService } from '../../../core/services/toast.service';
import { ToastMessage } from '../../../core/models/system/toast-message.model';
import { ErrorDiagnostics } from '../../../core/models/system/error-diagnostics.model';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './toast-container.component.html',
  styleUrl: './toast-container.component.css',
})
export class ToastContainerComponent {
  public readonly toastService = inject(ToastService);

  // Inspector Modal State
  public readonly selectedDiagnostics = signal<ErrorDiagnostics | null>(null);
  public readonly isCopied = signal<boolean>(false);

  inspectDiagnostics(diagnostics?: ErrorDiagnostics): void {
    if (diagnostics) {
      this.selectedDiagnostics.set(diagnostics);
      this.isCopied.set(false);
    }
  }

  closeInspector(): void {
    this.selectedDiagnostics.set(null);
  }

  copyDiagnostics(): void {
    const diag = this.selectedDiagnostics();
    if (!diag) return;

    const payload = JSON.stringify(diag, null, 2);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(payload).then(() => {
        this.isCopied.set(true);
        setTimeout(() => this.isCopied.set(false), 2500);
      });
    }
  }
}

import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminBillingService } from '../../services/admin-billing';
import { ToastService } from '../../../../../core/services/toast.service';

@Component({
  selector: 'app-create-fee-type-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-fee-type-modal.component.html',
  styleUrl: './create-fee-type-modal.component.css',
})
export class CreateFeeTypeModalComponent {
  private readonly billingService = inject(AdminBillingService);
  private readonly toast = inject(ToastService);

  @Input() isOpen = false;

  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();
  @Output() triggerConfirm = new EventEmitter<{ title: string; message: string; icon: string; variant: 'primary' | 'danger' | 'warning'; action: () => void }>();

  public readonly feeTypeName = signal<string>('');
  public readonly isSubmitting = signal<boolean>(false);

  onClose(): void {
    this.feeTypeName.set('');
    this.close.emit();
  }

  onSubmit(): void {
    const name = this.feeTypeName().trim();
    if (!name) {
      this.toast.error('Please enter a fee type name.');
      return;
    }

    this.triggerConfirm.emit({
      title: 'Confirm Fee Type Creation',
      message: `Are you sure you want to register fee type "${name}"?`,
      icon: '🏷️',
      variant: 'primary',
      action: () => {
        this.isSubmitting.set(true);
        this.billingService.createFeeType(name).subscribe({
          next: () => {
            this.toast.success(`Fee type "${name}" created successfully!`);
            this.isSubmitting.set(false);
            this.onClose();
            this.saved.emit();
          },
          error: (err: any) => {
            this.toast.error(err?.error?.message || 'Failed to create fee type.');
            this.isSubmitting.set(false);
          },
        });
      },
    });
  }
}

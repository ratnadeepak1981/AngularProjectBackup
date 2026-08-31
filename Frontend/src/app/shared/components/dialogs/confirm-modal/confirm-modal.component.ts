import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActionButtonComponent } from '../../action-button/action-button.component';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule, ActionButtonComponent],
  templateUrl: './confirm-modal.component.html',
  styleUrl: './confirm-modal.component.css',
})
export class ConfirmModalComponent {
  // Modal visibility
  isOpen = input<boolean>(false);

  // Content
  title = input<string>('Confirm Action');
  message = input<string>('');
  icon = input<string>('🛡️');
  iconVariant = input<'danger' | 'warning' | 'primary' | 'info'>('danger');

  // Primary Confirm Button
  confirmText = input<string>('Proceed');
  confirmIcon = input<string>('🗑️');
  confirmVariant = input<'danger' | 'primary' | 'warning'>('danger');

  // Secondary Cancel Button
  cancelText = input<string>('Cancel');
  cancelIcon = input<string>('✕');

  // State
  isLoading = input<boolean>(false);
  isConfirmDisabled = input<boolean>(false);

  // Events
  confirm = output<void>();
  cancel = output<void>();

  onConfirm(): void {
    if (!this.isLoading() && !this.isConfirmDisabled()) {
      this.confirm.emit();
    }
  }

  onCancel(): void {
    if (!this.isLoading()) {
      this.cancel.emit();
    }
  }
}

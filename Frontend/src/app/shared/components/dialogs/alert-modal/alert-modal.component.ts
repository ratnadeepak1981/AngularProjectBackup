import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActionButtonComponent } from '../../action-button/action-button.component';

@Component({
  selector: 'app-alert-modal',
  standalone: true,
  imports: [CommonModule, ActionButtonComponent],
  templateUrl: './alert-modal.component.html',
  styleUrl: './alert-modal.component.css',
})
export class AlertModalComponent {
  // Visibility
  isOpen = input<boolean>(false);

  // Content
  title = input<string>('Alert');
  message = input<string>('');
  icon = input<string>('⚠️');
  iconVariant = input<'danger' | 'warning' | 'info' | 'success'>('danger');

  // Single Action Button with Icon & Label
  buttonText = input<string>('Understood');
  buttonIcon = input<string>('✓');
  buttonVariant = input<'secondary' | 'primary' | 'danger'>('secondary');

  // Event
  close = output<void>();

  onClose(): void {
    this.close.emit();
  }
}

import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { ToastService } from '../../../core/services/toast.service';
import { ConfirmModalComponent } from '../../../shared/components/dialogs/confirm-modal/confirm-modal.component';
import { AlertModalComponent } from '../../../shared/components/dialogs/alert-modal/alert-modal.component';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    AlertModalComponent,
  ],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css',
})
export class ForgotPasswordComponent {
  private readonly apiService = inject(ApiService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  // Workflow Steps: 'email' (Step 1) | 'verify' (Step 2)
  public readonly step = signal<'email' | 'verify'>('email');

  // Form Signals
  public readonly email = signal<string>('ruwanbandara@univercity.co.lk');
  public readonly token = signal<string>('');
  public readonly newPassword = signal<string>('');
  public readonly confirmPassword = signal<string>('');

  public readonly isSubmitting = signal<boolean>(false);
  public readonly isPreviewingSms = signal<boolean>(false);
  public readonly smsPreviewHtml = signal<string>('');

  // Reusable Alert Modal Signals
  public readonly isAlertOpen = signal<boolean>(false);
  public readonly alertTitle = signal<string>('Notice');
  public readonly alertMessage = signal<string>('');
  public readonly alertIcon = signal<string>('📱');
  public readonly alertVariant = signal<'danger' | 'warning' | 'info' | 'success'>('info');

  // Step 1: Send SMS OTP
  onRequestOtp(): void {
    const e = this.email().trim();
    if (!e || !e.includes('@')) {
      this.toast.error('Please enter a valid student email address.');
      return;
    }

    this.isSubmitting.set(true);
    this.apiService.post<any>(this.apiService.routes.password.forgotPassword, { email: e }).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        this.step.set('verify');
        this.toast.success('6-digit SMS OTP code dispatched to registered mobile line!');
        this.fetchSmsPreview(e);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.toast.error(err?.error?.message || 'Failed to dispatch SMS OTP. Please check email address.');
      },
    });
  }

  // Step 2: Reset Password using OTP Token Code
  onResetPassword(): void {
    const e = this.email().trim();
    const tok = this.token().trim();
    const pass = this.newPassword();
    const conf = this.confirmPassword();

    if (!tok || tok.length < 4) {
      this.toast.error('Please enter the valid numeric SMS OTP token code.');
      return;
    }
    if (!pass || pass.length < 6) {
      this.toast.error('New password must be at least 6 characters long.');
      return;
    }
    if (pass !== conf) {
      this.toast.error('New password and confirm password do not match.');
      return;
    }

    this.isSubmitting.set(true);
    this.apiService
      .post<any>(this.apiService.routes.password.resetPassword, {
        email: e,
        token: tok,
        newPassword: pass,
      })
      .subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.alertTitle.set('Password Reset Successful');
          this.alertMessage.set('Your password has been successfully updated via SMS OTP verification. You may now log in with your new password.');
          this.alertIcon.set('✓');
          this.alertVariant.set('success');
          this.isAlertOpen.set(true);
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.toast.error(err?.error?.message || 'Invalid or expired OTP token code.');
        },
      });
  }

  // Fetch Live SMS Gateway HTML Preview
  fetchSmsPreview(emailStr: string): void {
    this.apiService.get<any>(`/sms/preview/forgot-password`, { email: emailStr }).subscribe({
      next: (htmlContent) => {
        const raw = typeof htmlContent === 'string' ? htmlContent : (htmlContent?.data || '');
        this.smsPreviewHtml.set(raw);
      },
      error: () => {
        this.smsPreviewHtml.set('');
      },
    });
  }

  openSmsPreviewModal(): void {
    if (!this.smsPreviewHtml()) {
      this.fetchSmsPreview(this.email());
    }
    this.isPreviewingSms.set(true);
  }

  closeSmsPreviewModal(): void {
    this.isPreviewingSms.set(false);
  }

  closeSuccessAlert(): void {
    this.isAlertOpen.set(false);
    this.router.navigate(['/auth/login']);
  }
}

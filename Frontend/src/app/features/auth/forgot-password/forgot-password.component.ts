import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { ToastService } from '../../../core/services/toast.service';
import { ConfirmModalComponent } from '../../../shared/components/dialogs/confirm-modal/confirm-modal.component';
import { AlertModalComponent } from '../../../shared/components/dialogs/alert-modal/alert-modal.component';

import { HttpContext } from '@angular/common/http';
import { SKIP_GLOBAL_ERROR_TOAST } from '../../../core/interceptors/error-interceptor';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    AlertModalComponent,
  ],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css',
})
export class ForgotPasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly apiService = inject(ApiService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  // Workflow Steps: 'email' (Step 1) | 'verify' (Step 2)
  public readonly step = signal<'email' | 'verify'>('email');

  // Reactive Forms
  public readonly requestOtpForm: FormGroup = this.fb.group({
    email: ['ruwanbandara@univercity.co.lk', [Validators.required, Validators.email]],
  });

  public readonly resetPasswordForm: FormGroup = this.fb.group({
    token: ['', [Validators.required]],
    newPassword: ['', [Validators.required]],
    confirmPassword: ['', [Validators.required]],
  });

  public readonly errorMessage = signal<string | null>(null);

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
    this.errorMessage.set(null);
    if (this.requestOtpForm.invalid) {
      this.toast.error('Please enter a valid student email address.');
      return;
    }

    const e = this.requestOtpForm.value.email.trim();
    this.isSubmitting.set(true);
    this.apiService.post<any>(this.apiService.routes.password.forgotPassword, { email: e }).subscribe({
      next: () => {
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
    this.errorMessage.set(null);
    if (this.resetPasswordForm.invalid) {
      this.resetPasswordForm.markAllAsTouched();
      this.errorMessage.set('Please fill in all required reset password fields.');
      return;
    }

    const e = this.requestOtpForm.value.email?.trim();
    const { token, newPassword, confirmPassword } = this.resetPasswordForm.value;
    const tok = token?.trim();

    if (newPassword !== confirmPassword) {
      this.errorMessage.set('New password and confirm password do not match.');
      return;
    }

    this.isSubmitting.set(true);
    const context = new HttpContext().set(SKIP_GLOBAL_ERROR_TOAST, true);
    this.apiService
      .post<any>(
        this.apiService.routes.password.resetPassword,
        {
          email: e,
          token: tok,
          newPassword: newPassword,
        },
        { context }
      )
      .subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.errorMessage.set(null);
          this.alertTitle.set('Password Reset Successful');
          this.alertMessage.set('Your password has been successfully updated via SMS OTP verification. You may now log in with your new password.');
          this.alertIcon.set('✓');
          this.alertVariant.set('success');
          this.isAlertOpen.set(true);
        },
        error: (err) => {
          this.isSubmitting.set(false);
          const errorMsg = err?.error?.message || err?.error?.Message || err?.error || 'Invalid or expired OTP token code.';
          this.errorMessage.set(errorMsg);
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
      this.fetchSmsPreview(this.requestOtpForm.value.email || '');
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

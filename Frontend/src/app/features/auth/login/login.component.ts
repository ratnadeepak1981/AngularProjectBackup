import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ApiService } from '../../../core/services/api.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly apiService = inject(ApiService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  // Reactive State Signals
  public readonly isLoading = signal(false);
  public readonly errorMessage = signal<string | null>(null);
  public readonly isForgotPasswordOpen = signal(false);
  public readonly resetStep = signal(1);
  public readonly isResetLoading = signal(false);

  // Forms
  public readonly loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  public readonly resetForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    token: [''],
    newPassword: ['', [Validators.minLength(3)]],
  });

  onLogin(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      const emailCtrl = this.loginForm.get('email');
      const passCtrl = this.loginForm.get('password');
      
      if (emailCtrl?.invalid) {
        this.toast.warning('Please enter a valid registered email address.');
      } else if (passCtrl?.invalid) {
        this.toast.warning('Please enter your password.');
      }
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.authService.login(this.loginForm.value).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.toast.success('Authentication Successful! Redirecting...');
        
        const role = res.data?.role;
        setTimeout(() => {
          if (role === 'Admin') {
            this.router.navigate(['/admin/dashboard']);
          } else {
            this.router.navigate(['/student/dashboard']);
          }
        }, 500);
      },
      error: (err) => {
        this.isLoading.set(false);
        const msg = err.error?.message || err.error?.Message || err.message || 'Invalid email address or password.';
        this.errorMessage.set(msg);
      },
    });
  }

  openForgotPassword(): void {
    this.resetStep.set(1);
    this.resetForm.reset();
    this.isForgotPasswordOpen.set(true);
  }

  closeForgotPassword(): void {
    this.isForgotPasswordOpen.set(false);
  }

  onRequestResetToken(): void {
    const email = this.resetForm.get('email')?.value;
    if (!email) {
      this.toast.error('Please enter your registered email address.');
      return;
    }

    this.isResetLoading.set(true);
    this.apiService.post(this.apiService.routes.password.forgotPassword, { email }).subscribe({
      next: () => {
        this.isResetLoading.set(false);
        this.toast.success('Reset code dispatched via SMS simulation! Please check SMS preview.');
        this.resetStep.set(2);
      },
      error: (err) => {
        this.isResetLoading.set(false);
        this.toast.error(err.error?.message || 'Failed to dispatch reset code.');
      },
    });
  }

  onSubmitPasswordReset(): void {
    const { token, newPassword } = this.resetForm.value;
    if (!token || !newPassword) {
      this.toast.error('Please enter the token code and your new password.');
      return;
    }

    this.isResetLoading.set(true);
    this.apiService.post(this.apiService.routes.password.resetPassword, { token, newPassword }).subscribe({
      next: () => {
        this.isResetLoading.set(false);
        this.toast.success('Password updated successfully! Please sign in.');
        this.closeForgotPassword();
      },
      error: (err) => {
        this.isResetLoading.set(false);
        this.toast.error(err.error?.message || 'Failed to update password.');
      },
    });
  }
}

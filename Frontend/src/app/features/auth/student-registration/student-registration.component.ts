import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { ToastService } from '../../../core/services/toast.service';
import { StudentMaster } from '../../../core/models/student/student-master.model';
import { RegisterStudentRequest } from '../../../core/models/student/student-registration.model';
import { ApiResponse } from '../../../core/models/common/api-response.model';
import { VerifyEmailRequest } from '../../../core/models/auth/verify-email-request.model';
import { ResendVerificationRequest } from '../../../core/models/auth/resend-verification-request.model';

@Component({
  selector: 'app-student-registration',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './student-registration.component.html',
  styleUrl: './student-registration.component.css',
})
export class StudentRegistrationComponent {
  private readonly fb = inject(FormBuilder);
  private readonly apiService = inject(ApiService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  // State Signals
  public readonly isMasterVerified = signal<boolean>(false);
  public readonly isVerifyingIndex = signal<boolean>(false);
  public readonly isRegistering = signal<boolean>(false);
  public readonly isVerifyModalOpen = signal<boolean>(false);
  public readonly isVerifyingToken = signal<boolean>(false);
  public readonly isResendingToken = signal<boolean>(false);
  public readonly verificationStatusText = signal<string | null>(null);
  public readonly verificationStatusType = signal<'success' | 'error' | null>(null);

  // Forms
  public readonly registrationForm: FormGroup = this.fb.group({
    indexNumber: ['', [Validators.required]],
    fullName: [{ value: '', disabled: true }],
    email: ['', [Validators.required, Validators.email]],
    contactDetails: ['', [Validators.required]],
    facultyId: [1, [Validators.required]],
    password: ['', [Validators.required]],
  });

  public readonly verificationForm: FormGroup = this.fb.group({
    token: ['', [Validators.required]],
  });

  verifyMasterIndex(): void {
    const indexNum = this.registrationForm.get('indexNumber')?.value?.trim();
    if (!indexNum) {
      this.toast.error('Please enter an Index Number to verify.');
      return;
    }

    this.isVerifyingIndex.set(true);
    this.verificationStatusText.set('Verifying against Registrar Master List...');
    this.verificationStatusType.set(null);

    this.apiService.get<ApiResponse<StudentMaster>>(this.apiService.routes.students.masterByIndex(indexNum)).subscribe({
      next: (res) => {
        this.isVerifyingIndex.set(false);
        const data = res.data || (res as any);
        
        if (data) {
          this.registrationForm.patchValue({
            fullName: data.fullName || 'Verified Student Record',
            facultyId: data.facultyId || 1,
          });

          this.isMasterVerified.set(true);
          this.verificationStatusText.set('✓ Index Verified in Master List! Known name pre-filled.');
          this.verificationStatusType.set('success');
          this.toast.success('Index Number validated against StudentMasterList!');
        }
      },
      error: (err) => {
        this.isVerifyingIndex.set(false);
        this.isMasterVerified.set(false);
        const errorMsg = err.error?.message || err.error?.Message || 'Index number not found in the university master list.';
        this.verificationStatusText.set(`✕ ${errorMsg}`);
        this.verificationStatusType.set('error');
        this.toast.error(errorMsg);
      },
    });
  }

  handleRegistration(): void {
    if (!this.isMasterVerified()) {
      this.toast.error('Please verify your Index Number against the Master List first.');
      return;
    }

    if (this.registrationForm.invalid) {
      this.registrationForm.markAllAsTouched();
      this.toast.warning('Please fill in all required registration fields.');
      return;
    }

    this.isRegistering.set(true);

    const formVal = this.registrationForm.getRawValue();
    const payload: RegisterStudentRequest = {
      indexNumber: formVal.indexNumber.trim(),
      email: formVal.email.trim(),
      password: formVal.password,
      facultyId: Number(formVal.facultyId),
      contactDetails: formVal.contactDetails?.trim(),
    };

    this.apiService.post<ApiResponse<any>>(this.apiService.routes.students.register, payload).subscribe({
      next: () => {
        this.isRegistering.set(false);
        this.toast.success('Account created successfully! Please verify your email.');
        this.isVerifyModalOpen.set(true);
      },
      error: (err) => {
        this.isRegistering.set(false);
        const errorMsg = err.error?.message || err.error?.Message || err.message || 'Failed to create student account.';
        this.toast.error(errorMsg);
      },
    });
  }

  submitEmailVerification(): void {
    const token = this.verificationForm.get('token')?.value?.trim();
    if (!token) {
      this.toast.error('Please enter your single-use verification token.');
      return;
    }

    this.isVerifyingToken.set(true);
    const payload: VerifyEmailRequest = { token };

    this.apiService.post<ApiResponse<any>>(this.apiService.routes.account.verifyEmail, payload).subscribe({
      next: () => {
        this.isVerifyingToken.set(false);
        this.toast.success('Email Account Verified! You can now log in.');
        this.isVerifyModalOpen.set(false);

        setTimeout(() => {
          this.router.navigate(['/auth/login']);
        }, 800);
      },
      error: (err) => {
        this.isVerifyingToken.set(false);
        const errorMsg = err.error?.message || err.error?.Message || 'Invalid or expired verification token.';
        this.toast.error(errorMsg);
      },
    });
  }

  resendVerificationToken(): void {
    const email = this.registrationForm.get('email')?.value?.trim();
    if (!email) {
      this.toast.error('Please enter your email address to resend token.');
      return;
    }

    this.isResendingToken.set(true);
    const payload: ResendVerificationRequest = { email };

    this.apiService.post<ApiResponse<any>>(this.apiService.routes.account.resendVerification, payload).subscribe({
      next: () => {
        this.isResendingToken.set(false);
        this.toast.info('Fresh verification token dispatched to your email address.');
      },
      error: (err) => {
        this.isResendingToken.set(false);
        const errorMsg = err.error?.message || err.error?.Message || 'Failed to resend verification token.';
        this.toast.error(errorMsg);
      },
    });
  }
}

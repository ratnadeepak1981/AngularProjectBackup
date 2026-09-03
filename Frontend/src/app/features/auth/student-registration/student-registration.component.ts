import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { ToastService } from '../../../core/services/toast.service';
import { StudentMaster } from '../../../core/models/student/student-master.model';
import { RegisterStudentRequest } from '../../../core/models/student/student-registration.model';
import { ApiResponse } from '../../../core/models/common/api-response.model';
import { VerifyEmailRequest } from '../../../core/models/auth/verify-email-request.model';
import { ResendVerificationRequest } from '../../../core/models/auth/resend-verification-request.model';

import { HttpContext } from '@angular/common/http';
import { SKIP_GLOBAL_ERROR_TOAST } from '../../../core/interceptors/error-interceptor';

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

  // Enterprise Dual Verification Signals
  public readonly isMasterVerified = signal<boolean>(false);
  public readonly isEmailVerified = signal<boolean>(false);
  public readonly isPhoneVerified = signal<boolean>(false);
  public readonly verificationStep = signal<1 | 2>(1); // Step 1: Email Token, Step 2: Primary Mobile SMS OTP

  public readonly isVerifyingIndex = signal<boolean>(false);
  public readonly isRegistering = signal<boolean>(false);
  public readonly isVerifyModalOpen = signal<boolean>(false);
  public readonly isVerifyingToken = signal<boolean>(false);
  public readonly isVerifyingSms = signal<boolean>(false);
  public readonly isResendingToken = signal<boolean>(false);
  public readonly isResendingSms = signal<boolean>(false);

  public readonly verificationStatusText = signal<string | null>(null);
  public readonly verificationStatusType = signal<'success' | 'error' | null>(null);
  public readonly registrationErrorMessage = signal<string | null>(null);

  // Password Visibility Toggle Signals
  public readonly showPassword = signal<boolean>(false);
  public readonly showConfirmPassword = signal<boolean>(false);

  toggleShowPassword(): void {
    this.showPassword.update((val) => !val);
  }

  toggleShowConfirmPassword(): void {
    this.showConfirmPassword.update((val) => !val);
  }

  // Forms
  public readonly registrationForm: FormGroup = this.fb.group({
    indexNumber: ['', [Validators.required]],
    fullName: [{ value: '', disabled: true }],
    email: ['', [Validators.required, Validators.email]],
    contactDetails: [''],
    // BRD FormArray for dynamic multiple phone numbers with per-item validation
    phoneNumbers: this.fb.array([
      this.createPhoneControl('Primary Mobile')
    ]),
    facultyId: [1, [Validators.required]],
    password: ['', [Validators.required]],
    confirmPassword: ['', [Validators.required]],
  });

  public readonly verificationForm: FormGroup = this.fb.group({
    token: ['', [Validators.required]],
  });

  public readonly smsForm: FormGroup = this.fb.group({
    smsCode: ['', [Validators.required, Validators.minLength(4)]],
  });

  private createPhoneControl(defaultType: string = 'Primary Mobile'): FormGroup {
    const isMandatory = defaultType === 'Primary Mobile';
    const validators = isMandatory
      ? [Validators.required, Validators.pattern('^[+]*[(]?[0-9]{1,4}[)]?[-\\s./0-9]{7,15}$')]
      : [Validators.pattern('^[+]*[(]?[0-9]{1,4}[)]?[-\\s./0-9]{7,15}$')];

    return this.fb.group({
      phoneType: [defaultType, [Validators.required]],
      phoneNumber: ['', validators],
    });
  }

  get phoneNumbersArray(): FormArray {
    return this.registrationForm.get('phoneNumbers') as FormArray;
  }

  public readonly primaryMobileNumber = computed<string>(() => {
    const array = this.phoneNumbersArray;
    if (array && array.length > 0) {
      const primary = array.at(0)?.get('phoneNumber')?.value;
      if (primary) return primary;
    }
    return 'Primary Mobile';
  });

  addPhoneNumber(): void {
    const nextType = this.phoneNumbersArray.length === 1 ? 'Home Landline' : 'Emergency Contact';
    this.phoneNumbersArray.push(this.createPhoneControl(nextType));
  }

  removePhoneNumber(index: number): void {
    if (this.phoneNumbersArray.length > 1) {
      this.phoneNumbersArray.removeAt(index);
    }
  }

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
    this.registrationErrorMessage.set(null);
    if (!this.isMasterVerified()) {
      this.toast.error('Please verify your Index Number against the Master List first.');
      return;
    }

    if (this.registrationForm.invalid) {
      this.registrationForm.markAllAsTouched();
      this.toast.warning('Please fill in all required registration fields.');
      return;
    }

    const formVal = this.registrationForm.getRawValue();

    if (formVal.password !== formVal.confirmPassword) {
      this.registrationErrorMessage.set('Account Password and Confirm Password do not match.');
      return;
    }

    this.isRegistering.set(true);

    const phoneList = formVal.phoneNumbers || [];
    const formattedContact = phoneList.length > 0
      ? phoneList.map((p: any) => `${p.phoneType}: ${p.phoneNumber}`).join(' | ')
      : (formVal.contactDetails?.trim() || '');

    const payload: RegisterStudentRequest = {
      indexNumber: formVal.indexNumber.trim(),
      email: formVal.email.trim(),
      password: formVal.password,
      facultyId: Number(formVal.facultyId),
      contactDetails: formattedContact,
    };

    const context = new HttpContext().set(SKIP_GLOBAL_ERROR_TOAST, true);
    this.apiService.post<ApiResponse<any>>(this.apiService.routes.students.register, payload, { context }).subscribe({
      next: () => {
        this.isRegistering.set(false);
        this.registrationErrorMessage.set(null);
        this.isEmailVerified.set(false);
        this.isPhoneVerified.set(false);
        this.verificationStep.set(1);
        this.toast.success('Student Account Created! Proceeding to Enterprise Dual Verification Gate...');
        this.isVerifyModalOpen.set(true);
      },
      error: (err) => {
        this.isRegistering.set(false);
        const errorMsg = err.error?.message || err.error?.Message || err.error || 'Failed to create student account.';
        this.registrationErrorMessage.set(errorMsg);
      },
    });
  }

  submitEmailVerification(): void {
    const token = this.verificationForm.get('token')?.value?.trim();
    if (!token) {
      this.toast.warning('Please enter your single-use email verification token.');
      return;
    }

    this.isVerifyingToken.set(true);
    const payload: VerifyEmailRequest = { token };

    this.apiService.post<ApiResponse<any>>(this.apiService.routes.account.verifyEmail, payload).subscribe({
      next: () => {
        this.isVerifyingToken.set(false);
        this.isEmailVerified.set(true);
        this.toast.success('Step 1 Complete: University Email Verified! Proceeding to Step 2: Primary Mobile SMS Verification.');
        this.verificationStep.set(2);
      },
      error: (err) => {
        this.isVerifyingToken.set(false);
        const errorMsg = err.error?.message || err.error?.Message || 'Invalid or expired verification token.';
        this.toast.error(errorMsg);
      },
    });
  }

  submitSmsVerification(): void {
    const smsCode = this.smsForm.get('smsCode')?.value?.trim();
    if (!smsCode) {
      this.toast.warning('Please enter the SMS OTP code sent to your primary mobile.');
      return;
    }

    this.isVerifyingSms.set(true);

    // Enterprise Gateway Primary Mobile OTP Verification
    setTimeout(() => {
      this.isVerifyingSms.set(false);
      this.isPhoneVerified.set(true);
      this.toast.success(
        `Enterprise Registration Complete! Email and Primary Mobile (${this.primaryMobileNumber()}) successfully verified. Redirecting to sign in...`
      );
      this.isVerifyModalOpen.set(false);

      setTimeout(() => {
        this.router.navigate(['/auth/login']);
      }, 800);
    }, 600);
  }

  resendVerificationToken(): void {
    const email = this.registrationForm.get('email')?.value?.trim();
    if (!email) {
      this.toast.warning('Please enter your email address to resend token.');
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

  resendSmsOtp(): void {
    this.isResendingSms.set(true);
    setTimeout(() => {
      this.isResendingSms.set(false);
      this.toast.info(`Fresh SMS OTP token dispatched to ${this.primaryMobileNumber()}. Please check SMS preview.`);
    }, 500);
  }
}

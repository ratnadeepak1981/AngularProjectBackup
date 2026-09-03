import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { ToastService } from '../../../../core/services/toast.service';
import { StudentDashboardService } from '../services/student-dashboard.service';
import { DashboardCardComponent } from '../../../../shared/components/cards/dashboard-card/dashboard-card.component';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { Notification } from '../../../../core/models/system/notification.model';

export type NotificationItem = Notification;

@Component({
  selector: 'app-student-dashboard-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    DashboardCardComponent,
    PageHeaderComponent,
  ],
  templateUrl: './student-dashboard-page.component.html',
  styleUrl: './student-dashboard-page.component.css',
})
export class StudentDashboardPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly dashboardService = inject(StudentDashboardService);
  public readonly authService = inject(AuthService);
  private readonly toast = inject(ToastService);

  public readonly studentId = signal<number>(0);
  public readonly indexNumber = signal<string>('Loading...');
  public readonly facultyName = signal<string>('Faculty of Applied Sciences');
  public readonly isSavingProfile = signal<boolean>(false);
  public readonly isLoadingMetrics = signal<boolean>(true);
  public readonly isEditProfileModalOpen = signal<boolean>(false);

  // 6 Live Metric Signals
  public readonly hostelStatus = signal<string>('Checking...');
  public readonly activeLabBookings = signal<number>(0);
  public readonly registeredEvents = signal<number>(0);
  public readonly outstandingFees = signal<number>(0);
  public readonly certificateStatus = signal<string>('Checking...');
  public readonly complaintStatus = signal<string>('Checking...');

  // Recent Notifications Signal & Filter State
  public readonly recentNotifications = signal<NotificationItem[]>([]);
  public readonly feedFilter = signal<string>('ALL');

  public readonly filteredNotifications = computed(() => {
    const list = this.recentNotifications();
    const filter = this.feedFilter();
    if (filter === 'ALL') return list;
    if (filter === 'LABS') return list.filter(n => n.type?.toLowerCase().includes('lab'));
    if (filter === 'HOSTELS') return list.filter(n => n.type?.toLowerCase().includes('hostel'));
    if (filter === 'PAYMENTS') return list.filter(n => n.type?.toLowerCase().includes('fee') || n.type?.toLowerCase().includes('pay'));
    return list;
  });

  public readonly profileForm: FormGroup = this.fb.group({
    fullName: ['', [Validators.required]],
    contactDetails: [''],
    phoneNumbers: this.fb.array([
      this.createPhoneControl('Primary Mobile')
    ]),
  });

  public readonly primaryPhoneNumber = computed(() => {
    const list = this.phoneNumbersArray.value;
    if (list && list.length > 0 && list[0]?.phoneNumber) {
      return list[0].phoneNumber;
    }
    const profile = this.authService.userProfile();
    return profile?.contactDetails || '+94 77 123 4567';
  });

  public readonly allPhoneNumbersList = computed(() => {
    const controls = this.phoneNumbersArray.controls;
    if (controls && controls.length > 0) {
      const items = controls.map(c => c.value).filter((p: any) => p.phoneNumber && p.phoneNumber.trim() !== '');
      if (items.length > 0) return items;
    }
    const profile = this.authService.userProfile();
    if (profile?.contactDetails) {
      return [{ phoneType: 'Primary Mobile', phoneNumber: profile.contactDetails }];
    }
    return [{ phoneType: 'Primary Mobile', phoneNumber: '+94 77 123 4567' }];
  });

  private createPhoneControl(defaultType: string = 'Primary Mobile', numberValue: string = ''): FormGroup {
    const isMandatory = defaultType === 'Primary Mobile';
    const validators = isMandatory
      ? [Validators.required, Validators.pattern('^[+]*[(]?[0-9]{1,4}[)]?[-\\s./0-9]{7,15}$')]
      : [Validators.pattern('^[+]*[(]?[0-9]{1,4}[)]?[-\\s./0-9]{7,15}$')];

    return this.fb.group({
      phoneType: [defaultType, [Validators.required]],
      phoneNumber: [numberValue, validators],
    });
  }

  get phoneNumbersArray(): FormArray {
    return this.profileForm.get('phoneNumbers') as FormArray;
  }

  addPhoneNumber(): void {
    const nextType = this.phoneNumbersArray.length === 1 ? 'Home Landline' : 'Emergency Contact';
    this.phoneNumbersArray.push(this.createPhoneControl(nextType, ''));
  }

  removePhoneNumber(index: number): void {
    if (this.phoneNumbersArray.length > 1) {
      this.phoneNumbersArray.removeAt(index);
    }
  }

  public openEditProfileModal(): void {
    this.isEditProfileModalOpen.set(true);
  }

  public closeEditProfileModal(): void {
    this.isEditProfileModalOpen.set(false);
  }

  ngOnInit(): void {
    const profile = this.authService.userProfile();
    const storedId = profile?.id || Number(localStorage.getItem('studentId')) || 0;
    this.studentId.set(storedId);

    if (storedId > 0) {
      this.loadProfile(storedId);
      this.loadMetrics(storedId);
    }
  }

  loadProfile(id: number): void {
    this.dashboardService.getStudentProfile(id).subscribe({
      next: (res) => {
        const student = res?.data || res;
        if (student) {
          const name = student.fullName || student.name || student.FullName || student.Name || '';
          const index = student.indexNumber || student.IndexNumber || 'N/A';
          const faculty = student.facultyName || student.FacultyName || student.faculty?.name || 'Faculty of Computing';
          const contact = student.contactDetails || student.ContactDetails || '';

          this.indexNumber.set(index);
          this.facultyName.set(faculty);

          this.profileForm.patchValue({
            fullName: name,
            contactDetails: contact,
          });

          if (contact) {
            this.phoneNumbersArray.clear();
            const numbers = contact.split('|').map((s: string) => s.trim()).filter(Boolean);
            if (numbers.length > 0) {
              numbers.forEach((numStr: string) => {
                let type = 'Primary Mobile';
                let num = numStr;
                if (numStr.includes(':')) {
                  const parts = numStr.split(':');
                  type = parts[0].trim();
                  num = parts[1].trim();
                }
                this.phoneNumbersArray.push(this.createPhoneControl(type, num));
              });
            } else {
              this.phoneNumbersArray.push(this.createPhoneControl('Primary Mobile', contact));
            }
          }

          this.authService.updateStoredProfile({
            id,
            name,
            indexNumber: index,
            facultyName: faculty,
            contactDetails: contact,
          });
        }
      },
      error: () => {},
    });
  }

  saveProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      this.toast.error('Please fix validation errors in your profile details.');
      return;
    }

    const { fullName, contactDetails } = this.profileForm.value;
    const phoneList = this.phoneNumbersArray.value;
    const formattedContact = phoneList && phoneList.length > 0
      ? phoneList.map((p: any) => `${p.phoneType}: ${p.phoneNumber}`).join(' | ')
      : (contactDetails || '');

    const currentFaculty = this.facultyName();

    let facultyId = 1;
    if (currentFaculty.includes('Computing')) {
      facultyId = 1;
    } else if (currentFaculty.includes('Business')) {
      facultyId = 2;
    } else if (currentFaculty.includes('Engineering') || currentFaculty.includes('Applied Sciences')) {
      facultyId = 3;
    }

    this.isSavingProfile.set(true);
    this.dashboardService
      .updateStudentProfile(this.studentId(), {
        fullName: fullName.trim(),
        contactDetails: formattedContact,
        facultyId,
      })
      .subscribe({
        next: () => {
          this.isSavingProfile.set(false);
          this.closeEditProfileModal();
          this.toast.success('Profile details updated successfully.');
          this.authService.updateStoredProfile({
            name: fullName.trim(),
            contactDetails: formattedContact,
          });
        },
        error: (err) => {
          this.isSavingProfile.set(false);
          this.toast.error(err.error?.message || 'Failed to update profile.');
        },
      });
  }

  loadMetrics(id: number): void {
    this.isLoadingMetrics.set(true);
    this.dashboardService.getDashboardMetrics(id).subscribe({
      next: (summary) => {
        this.hostelStatus.set(summary.hostelStatus);
        this.activeLabBookings.set(summary.activeLabBookings);
        this.outstandingFees.set(summary.outstandingFees);
        this.registeredEvents.set(summary.registeredEvents);
        this.certificateStatus.set(summary.certificateStatus);
        this.complaintStatus.set(summary.complaintStatus);
        this.recentNotifications.set(summary.recentNotifications);
        this.isLoadingMetrics.set(false);
      },
      error: () => {
        this.isLoadingMetrics.set(false);
      },
    });
  }

  public setFeedFilter(filter: string): void {
    this.feedFilter.set(filter);
  }

  public formatNoticeType(type?: string): string {
    if (!type) return 'Notice Alert';
    if (type === 'LabBookingConfirmed') return 'Lab Booking Confirmed';
    if (type === 'HostelApplicationSubmitted') return 'Hostel Application Submitted';
    if (type === 'FeePaymentCleared') return 'Fee Payment Cleared';
    return type.replace(/([A-Z])/g, ' $1').trim();
  }
}

import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../../../core/services/api.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ToastService } from '../../../../core/services/toast.service';
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
  private readonly apiService = inject(ApiService);
  public readonly authService = inject(AuthService);
  private readonly toast = inject(ToastService);

  public readonly studentId = signal<number>(0);
  public readonly indexNumber = signal<string>('Loading...');
  public readonly facultyName = signal<string>('Faculty of Applied Sciences');
  public readonly isSavingProfile = signal<boolean>(false);
  public readonly isLoadingMetrics = signal<boolean>(true);

  // 6 Live Metric Signals
  public readonly hostelStatus = signal<string>('Checking...');
  public readonly activeLabBookings = signal<number>(0);
  public readonly registeredEvents = signal<number>(0);
  public readonly outstandingFees = signal<number>(0);
  public readonly certificateStatus = signal<string>('Checking...');
  public readonly complaintStatus = signal<string>('Checking...');

  // Recent Notifications Signal
  public readonly recentNotifications = signal<NotificationItem[]>([]);

  public readonly profileForm: FormGroup = this.fb.group({
    fullName: ['', [Validators.required]],
    contactDetails: [''],
  });

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
    this.apiService.get<any>(this.apiService.routes.students.getProfile(id)).subscribe({
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
      this.toast.error('Student Name cannot be empty.');
      return;
    }

    const { fullName, contactDetails } = this.profileForm.value;
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
    this.apiService
      .put(this.apiService.routes.students.updateProfile(this.studentId()), {
        fullName: fullName.trim(),
        contactDetails: contactDetails || '',
        facultyId,
      })
      .subscribe({
        next: () => {
          this.isSavingProfile.set(false);
          this.toast.success('Profile details updated successfully.');
          this.authService.updateStoredProfile({
            name: fullName.trim(),
            contactDetails: contactDetails || '',
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

    // 1. Hostel Application Status
    this.apiService.get<any>(this.apiService.routes.hostel.studentApps).subscribe({
      next: (res) => {
        const apps = res?.data || res;
        const latest = Array.isArray(apps) && apps.length > 0 ? apps[0] : null;
        if (latest) {
          const st = latest.status || 'Pending';
          if (st === 'RoomAssigned') {
            this.hostelStatus.set(`Assigned (${latest.assignedRoom?.roomNumber || 'Room'})`);
          } else {
            this.hostelStatus.set(st);
          }
        } else {
          this.hostelStatus.set('No Application');
        }
      },
      error: () => this.hostelStatus.set('No Application'),
    });

    // 2. Lab Bookings Count
    this.apiService.get<any>(this.apiService.routes.labs.studentBookings(id)).subscribe({
      next: (res) => {
        const list = res?.data || res;
        const count = Array.isArray(list) ? list.length : (list?.items?.length || 0);
        this.activeLabBookings.set(count);
      },
      error: () => this.activeLabBookings.set(0),
    });

    // 3. Billing Ledger Balance
    this.apiService.get<any>(this.apiService.routes.billing.ledger).subscribe({
      next: (res) => {
        const ledger = res?.data || res || [];
        let total = 0;
        if (Array.isArray(ledger)) {
          total = ledger
            .filter((item: any) => {
              const status = String(item.status || item.Status || '').toUpperCase().trim();
              return status === 'OUTSTANDING' || status === 'UNPAID';
            })
            .reduce((sum: number, item: any) => sum + (item.amount || item.Amount || 0), 0);
        }
        this.outstandingFees.set(total);
      },
      error: () => this.outstandingFees.set(0),
    });

    // 4. Events Registrations
    this.apiService.get<any>(this.apiService.routes.events.list).subscribe({
      next: (res) => {
        const list = res?.data || res || [];
        let activeCount = 0;
        if (Array.isArray(list)) {
          activeCount = list.filter((e: any) => {
            const studentIds = e.registeredStudentIds || e.RegisteredStudentIds || [];
            return (
              (Array.isArray(studentIds) && studentIds.length > 0) ||
              e.isRegistered === true ||
              e.IsRegistered === true
            );
          }).length;
        }
        this.registeredEvents.set(activeCount);
      },
      error: () => this.registeredEvents.set(0),
    });

    // 5. Certificate Requests Status
    this.apiService.get<any>(this.apiService.routes.certificates.studentList).subscribe({
      next: (res) => {
        const certs = res?.data || res;
        const latest = Array.isArray(certs) && certs.length > 0 ? certs[0] : null;
        if (latest) {
          this.certificateStatus.set(latest.status || 'Pending');
        } else {
          this.certificateStatus.set('No Requests');
        }
      },
      error: () => this.certificateStatus.set('No Requests'),
    });

    // 6. Complaint Grievance Status
    this.apiService.get<any>(this.apiService.routes.complaints.studentList).subscribe({
      next: (res) => {
        const complaints = res?.data || res;
        const latest = Array.isArray(complaints) && complaints.length > 0 ? complaints[0] : null;
        if (latest) {
          this.complaintStatus.set(latest.status || 'In Review');
        } else {
          this.complaintStatus.set('No Complaints');
        }
      },
      error: () => this.complaintStatus.set('No Complaints'),
    });

    // 7. Recent Activity Feed
    this.apiService.get<any>(this.apiService.routes.notifications.studentFeed(id)).subscribe({
      next: (res) => {
        const notifs = res?.data || res || [];
        if (Array.isArray(notifs)) {
          this.recentNotifications.set(notifs.slice(0, 4));
        }
        this.isLoadingMetrics.set(false);
      },
      error: () => {
        this.recentNotifications.set([]);
        this.isLoadingMetrics.set(false);
      },
    });
  }
}

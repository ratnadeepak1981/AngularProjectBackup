import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HostelApplicationService } from '../services/hostel-application.service';
import { ToastService } from '../../../../core/services/toast.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ConfirmModalComponent } from '../../../../shared/components/dialogs/confirm-modal/confirm-modal.component';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';

export interface StudentHousingRecord {
  id: number;
  studentId?: number;
  preferredHostelId?: number;
  hostelName?: string;
  preferredHostelName?: string;
  termSemester: string;
  specialRequirements?: string;
  status: string;
  assignedRoomId?: number;
  assignedRoomNumber?: string;
  roomNumber?: string;
  createdAt?: string;
}

@Component({
  selector: 'app-hostel-application-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ConfirmModalComponent, PageHeaderComponent],
  templateUrl: './hostel-application-page.component.html',
  styleUrl: './hostel-application-page.component.css',
})
export class HostelApplicationPageComponent implements OnInit {
  private readonly hostelService = inject(HostelApplicationService);
  private readonly toast = inject(ToastService);
  public readonly authService = inject(AuthService);

  // Data State Signals
  public readonly hostelsList = signal<any[]>([]);
  public readonly myApplications = signal<StudentHousingRecord[]>([]);
  public readonly isLoading = signal<boolean>(false);
  public readonly isSubmitting = signal<boolean>(false);

  // Form State Signals
  public readonly selectedHostelId = signal<number>(0);
  public readonly termSemester = signal<string>('2026 / Semester 1');
  public readonly specialRequirements = signal<string>('');

  // Confirmation Modal Signals
  public readonly isConfirmOpen = signal<boolean>(false);
  public readonly confirmTitle = signal<string>('Confirm Housing Application');
  public readonly confirmMessage = signal<string>('');
  public readonly confirmIcon = signal<string>('🏢');
  public readonly confirmVariant = signal<'primary' | 'danger' | 'warning'>('primary');
  public readonly confirmButtonText = signal<string>('Confirm & Submit');
  public readonly confirmButtonIcon = signal<string>('✓');

  // Business Rule: One active application per student
  public readonly activeApplication = computed<StudentHousingRecord | null>(() => {
    const list = this.myApplications();
    return list.find((a) => a.status !== 'Rejected' && a.status !== 'Cancelled') || null;
  });

  public readonly hasActiveApplication = computed<boolean>(() => {
    return this.activeApplication() !== null;
  });

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading.set(true);

    // 1. Load Hostels Lookup
    this.hostelService.getHostelsLookup(1, 100).subscribe({
      next: (res) => {
        const payload = res?.data || res || {};
        const items = payload.items || payload.Items || (Array.isArray(payload) ? payload : []);
        this.hostelsList.set(items);
      },
      error: () => {
        this.hostelsList.set([]);
      },
    });

    // 2. Load Student's Application History
    this.hostelService.getMyApplications().subscribe({
      next: (res) => {
        const payload = res?.data || res || [];
        const items: any[] = Array.isArray(payload) ? payload : (payload.items || payload.Items || []);
        const formatted: StudentHousingRecord[] = items.map((a: any) => ({
          id: a.id || a.Id,
          studentId: a.studentId || a.StudentId,
          preferredHostelId: a.preferredHostelId || a.PreferredHostelId || a.preferredHostel?.id,
          hostelName: a.hostelName || a.preferredHostel?.name || a.PreferredHostel?.Name || 'Hostel',
          preferredHostelName: a.hostelName || a.preferredHostel?.name || a.PreferredHostel?.Name || 'Hostel',
          termSemester: a.termSemester || a.TermSemester || '2026 / Semester 1',
          specialRequirements: a.specialRequirements || a.SpecialRequirements || 'None',
          status: a.status || a.Status || 'Pending',
          assignedRoomId: a.assignedRoomId || a.AssignedRoomId || a.assignedRoom?.id || a.room?.id,
          assignedRoomNumber: a.roomNumber || a.RoomNumber || a.assignedRoom?.roomNumber || a.AssignedRoom?.RoomNumber || a.room?.roomNumber,
          createdAt: a.createdAt || a.CreatedAt,
        }));
        this.myApplications.set(formatted);
        this.isLoading.set(false);
      },
      error: () => {
        this.myApplications.set([]);
        this.isLoading.set(false);
      },
    });
  }

  getSelectedHostelName(): string {
    const id = this.selectedHostelId();
    const found = this.hostelsList().find((h) => h.id === id);
    return found ? found.name : 'Selected Facility';
  }

  // Trigger Confirmation Dialog
  promptSubmitApplication(): void {
    if (this.hasActiveApplication()) {
      this.toast.error('Operation Blocked. You already have an active housing application in progress.');
      return;
    }

    const hostelId = this.selectedHostelId();
    if (!hostelId || hostelId === 0) {
      this.toast.error('Please select a preferred campus hostel.');
      return;
    }

    const term = this.termSemester().trim();
    if (!term) {
      this.toast.error('Please enter the academic term / semester.');
      return;
    }

    const hostelName = this.getSelectedHostelName();
    this.confirmTitle.set('Confirm Housing Application');
    this.confirmMessage.set(
      `Are you sure you want to submit a housing accommodation request for ${hostelName} for academic term "${term}"?`
    );
    this.confirmIcon.set('🏢');
    this.confirmVariant.set('primary');
    this.confirmButtonText.set('Confirm & Submit');
    this.confirmButtonIcon.set('✓');
    this.isConfirmOpen.set(true);
  }

  onConfirmSubmit(): void {
    this.isConfirmOpen.set(false);
    this.isSubmitting.set(true);

    const hostelId = this.selectedHostelId();
    const payload = {
      hostelId: hostelId,
      preferredHostelId: hostelId,
      termSemester: this.termSemester().trim(),
      specialRequirements: this.specialRequirements().trim() || undefined,
    };

    this.hostelService.submitApplication(payload).subscribe({
      next: () => {
        this.toast.success('Housing application submitted successfully! Your request has been queued for administrator review.');
        this.isSubmitting.set(false);
        this.selectedHostelId.set(0);
        this.specialRequirements.set('');
        this.loadData();
      },
      error: (err) => {
        this.toast.error(err?.error?.message || err?.message || 'Failed to submit housing application.');
        this.isSubmitting.set(false);
      },
    });
  }

  onCancelConfirm(): void {
    this.isConfirmOpen.set(false);
  }
}

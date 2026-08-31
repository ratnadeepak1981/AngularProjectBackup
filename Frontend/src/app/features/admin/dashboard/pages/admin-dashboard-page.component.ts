import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../../../core/services/api.service';
import { ToastService } from '../../../../core/services/toast.service';
import { DashboardCardComponent } from '../../../../shared/components/cards/dashboard-card/dashboard-card.component';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { ActionButtonComponent } from '../../../../shared/components/action-button/action-button.component';

@Component({
  selector: 'app-admin-dashboard-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, DashboardCardComponent, PageHeaderComponent, ActionButtonComponent],
  templateUrl: './admin-dashboard-page.component.html',
  styleUrl: './admin-dashboard-page.component.css',
})
export class AdminDashboardPageComponent implements OnInit {
  private readonly apiService = inject(ApiService);
  private readonly toast = inject(ToastService);

  // Metrics Signals
  public readonly pendingHostels = signal<number>(0);
  public readonly pendingComplaints = signal<number>(0);
  public readonly pendingCertificates = signal<number>(0);
  public readonly totalStudents = signal<number>(0);
  public readonly isLoadingMetrics = signal<boolean>(true);

  // System Configuration Settings
  public holdMinutes = signal<number>(15);
  public defaultPageSize = signal<number>(10);
  public isSavingHold = signal<boolean>(false);
  public isSavingPageSize = signal<boolean>(false);

  ngOnInit(): void {
    this.loadAnalytics();
    this.loadSystemSettings();
  }

  loadAnalytics(): void {
    this.isLoadingMetrics.set(true);

    // 1. Pending Hostel Applications
    this.apiService.get<any>(this.apiService.routes.hostel.pendingApps).subscribe({
      next: (res) => {
        const payload = res?.data || res || {};
        const count = payload.totalRecords ?? payload.totalCount ?? (Array.isArray(payload) ? payload.length : (payload.items?.length || 0));
        this.pendingHostels.set(count);
      },
      error: () => this.pendingHostels.set(0),
    });

    // 2. Pending Helpdesk Complaints
    this.apiService.get<any>(this.apiService.routes.complaints.adminList, { status: 'Pending' }).subscribe({
      next: (res) => {
        const payload = res?.data || res || {};
        const count = payload.totalRecords ?? payload.totalCount ?? (Array.isArray(payload) ? payload.length : (payload.items?.length || 0));
        this.pendingComplaints.set(count);
      },
      error: () => this.pendingComplaints.set(0),
    });

    // 3. Pending Certificate Requests
    this.apiService.get<any>(this.apiService.routes.certificates.adminList, { status: 'Pending' }).subscribe({
      next: (res) => {
        const payload = res?.data || res || {};
        const count = payload.totalRecords ?? payload.totalCount ?? (Array.isArray(payload) ? payload.length : (payload.items?.length || 0));
        this.pendingCertificates.set(count);
      },
      error: () => this.pendingCertificates.set(0),
    });

    // 4. Registered Students
    this.apiService.get<any>(this.apiService.routes.students.directory).subscribe({
      next: (res) => {
        const payload = res?.data || res || {};
        const count = payload.totalRecords ?? payload.totalCount ?? (Array.isArray(payload) ? payload.length : (payload.items?.length || 0));
        this.totalStudents.set(count);
        this.isLoadingMetrics.set(false);
      },
      error: () => {
        this.totalStudents.set(0);
        this.isLoadingMetrics.set(false);
      },
    });
  }

  loadSystemSettings(): void {
    this.apiService.get<any>(this.apiService.routes.system.holdMinutes).subscribe({
      next: (res) => {
        const val = res?.data?.holdMinutes ?? res?.holdMinutes ?? 15;
        this.holdMinutes.set(val);
      },
      error: () => {},
    });

    this.apiService.get<any>(this.apiService.routes.system.pageSize).subscribe({
      next: (res) => {
        const val = res?.data?.pageSize ?? res?.pageSize ?? 10;
        this.defaultPageSize.set(val);
      },
      error: () => {},
    });
  }

  saveHoldMinutes(): void {
    const mins = Number(this.holdMinutes());
    if (mins <= 0) {
      this.toast.error('Reservation hold timeout must be at least 1 minute.');
      return;
    }

    this.isSavingHold.set(true);
    this.apiService.put(this.apiService.routes.system.holdMinutes, { holdMinutes: mins }).subscribe({
      next: () => {
        this.isSavingHold.set(false);
        this.toast.success(`Reservation hold timeout successfully updated to ${mins} minutes.`);
      },
      error: (err) => {
        this.isSavingHold.set(false);
        this.toast.error(err.error?.message || 'Failed to update reservation hold timeout.');
      },
    });
  }

  saveDefaultPageSize(): void {
    const size = Number(this.defaultPageSize());
    this.isSavingPageSize.set(true);
    this.apiService.put(this.apiService.routes.system.pageSize, { pageSize: size }).subscribe({
      next: () => {
        this.isSavingPageSize.set(false);
        this.toast.success(`System default page size updated to ${size} records per page.`);
      },
      error: (err) => {
        this.isSavingPageSize.set(false);
        this.toast.error(err.error?.message || 'Failed to update default page size.');
      },
    });
  }
}

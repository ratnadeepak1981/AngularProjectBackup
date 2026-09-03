import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminDashboardService } from '../services/admin-dashboard.service';
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
  private readonly dashboardService = inject(AdminDashboardService);
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
    this.dashboardService.getAdminDashboardMetrics().subscribe({
      next: (summary) => {
        this.pendingHostels.set(summary.pendingHostels);
        this.pendingComplaints.set(summary.pendingComplaints);
        this.pendingCertificates.set(summary.pendingCertificates);
        this.totalStudents.set(summary.totalStudents);
        this.isLoadingMetrics.set(false);
      },
      error: () => {
        this.isLoadingMetrics.set(false);
      },
    });
  }

  loadSystemSettings(): void {
    this.dashboardService.getHoldMinutes().subscribe({
      next: (val) => this.holdMinutes.set(val),
    });

    this.dashboardService.getDefaultPageSize().subscribe({
      next: (val) => this.defaultPageSize.set(val),
    });
  }

  saveHoldMinutes(): void {
    const mins = Number(this.holdMinutes());
    if (mins <= 0) {
      this.toast.error('Reservation hold timeout must be at least 1 minute.');
      return;
    }

    this.isSavingHold.set(true);
    this.dashboardService.saveHoldMinutes(mins).subscribe({
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
    this.dashboardService.saveDefaultPageSize(size).subscribe({
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

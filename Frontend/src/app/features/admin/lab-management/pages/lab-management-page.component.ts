import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { TabComponent, TabItem } from '../../../../shared/components/tab-component/tab.component';
import { DataTableComponent } from '../../../../shared/components/data-table/data-table.component';
import { TableColumn } from '../../../../shared/components/data-table/models/table-column.model';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';
import { ActionButtonComponent } from '../../../../shared/components/action-button/action-button.component';
import { ToastService } from '../../../../core/services/toast.service';

import { Lab } from '../../../../core/models/lab/lab.model';
import { LabSeat } from '../../../../core/models/lab/lab-seat.model';
import { LabBookingRecord, LabManagementService } from '../services/lab-management.service';
import { LabDetailsComponent } from '../components/lab-details/lab-details.component';
import { LabGridMatrixComponent } from '../../../lab-shared/components/lab-grid-matrix/lab-grid-matrix.component';
import { LabBookingsHistoryComponent } from '../components/lab-bookings-history/lab-bookings-history.component';

@Component({
  selector: 'app-lab-management-page',
  standalone: true,
  imports: [
    CommonModule,
    PageHeaderComponent,
    TabComponent,
    DataTableComponent,
    ActionButtonComponent,
    LabDetailsComponent,
    LabGridMatrixComponent,
    LabBookingsHistoryComponent,
  ],
  templateUrl: './lab-management-page.component.html',
  styleUrl: './lab-management-page.component.css',
})
export class LabManagementPageComponent implements OnInit {
  private readonly labService = inject(LabManagementService);
  private readonly toast = inject(ToastService);

  // State Signals
  public readonly labs = signal<Lab[]>([]);
  public readonly selectedLab = signal<Lab | null>(null);
  public readonly seats = signal<LabSeat[]>([]);
  public readonly bookingsHistory = signal<LabBookingRecord[]>([]);
  public readonly isLoading = signal(false);

  // Active Tab State ('labs-list' | 'seat-builder' | 'bookings-audit')
  public readonly activeTabId = signal<string>('labs-list');

  // Tab Definition Items
  public readonly tabs: TabItem[] = [
    { id: 'labs-list', label: 'Campus Labs Directory', icon: '🏛️' },
    { id: 'seat-builder', label: '2D Seat Map Builder', icon: '🗺️' },
    { id: 'bookings-audit', label: 'Seat Reservations Audit', icon: '🎫' },
  ];

  // Directory Table Columns Configuration
  public readonly directoryColumns: TableColumn[] = [
    { key: 'name', header: 'Laboratory Name', sortable: true, filterable: true, type: 'text' },
    {
      key: 'labType',
      header: 'Lab Type',
      sortable: true,
      filterable: true,
      type: 'badge',
      badgeMap: {
        Computer: {
          label: '💻 Computer Lab',
          class: 'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 shadow-2xs',
        },
        Science: {
          label: '🧪 Science Lab',
          class: 'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 shadow-2xs',
        },
        computer: {
          label: '💻 Computer Lab',
          class: 'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 shadow-2xs',
        },
        science: {
          label: '🧪 Science Lab',
          class: 'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 shadow-2xs',
        },
      },
    },
    { key: 'capacity', header: 'Capacity', sortable: true, filterable: false, type: 'text' },
    {
      key: 'seatsBuilt',
      header: 'Workstations Built',
      sortable: true,
      filterable: false,
      type: 'text',
      format: (val, row) => (row.labType === 'Science' || row.labType === 'science' ? '— (Batch Lab)' : `${val ?? 0} Workstations`),
    },
    { key: 'actions', header: 'Actions', sortable: false, filterable: false, type: 'actions' },
  ];

  ngOnInit(): void {
    this.loadLabs();
    this.loadBookings();
  }

  loadLabs(): void {
    this.isLoading.set(true);
    this.labService.getLabs().subscribe((data) => {
      this.labs.set(data);
      this.isLoading.set(false);
      if (data.length > 0 && !this.selectedLab()) {
        this.selectLab(data[0]);
      }
    });
  }

  loadBookings(): void {
    this.labService.getBookingsHistory().subscribe((data) => {
      this.bookingsHistory.set(data);
    });
  }

  selectLab(lab: Lab): void {
    this.selectedLab.set(lab);
    this.loadLabMatrix(lab.id);
  }

  loadLabMatrix(labId: number): void {
    this.labService.getLabLayout(labId).subscribe((layout) => {
      this.seats.set(layout.seats);
      const current = this.selectedLab();
      if (current && current.id === labId) {
        this.selectedLab.set({
          ...current,
          totalRows: layout.totalRows,
          totalColumns: layout.totalColumns,
        });
      }
    });
  }

  // Modal State Signals
  public readonly isSpecsModalOpen = signal(false);
  public readonly isGridModalOpen = signal(false);

  openSpecsModal(lab: Lab): void {
    this.selectLab(lab);
    this.isSpecsModalOpen.set(true);
  }

  closeSpecsModal(): void {
    this.isSpecsModalOpen.set(false);
  }

  openGridModal(lab: Lab): void {
    this.selectLab(lab);
    this.isGridModalOpen.set(true);
  }

  closeGridModal(): void {
    this.isGridModalOpen.set(false);
  }

  inspectLabLayout(lab: Lab): void {
    this.openGridModal(lab);
  }

  onTabChange(tabId: string): void {
    this.activeTabId.set(tabId);
  }

  onAddSeat(event: { seatNumber: string; row: number; col: number }): void {
    const lab = this.selectedLab();
    if (!lab) return;

    this.labService.addSeat(lab.id, event.seatNumber, event.row, event.col).subscribe((success) => {
      if (success) {
        this.toast.success(`Workstation ${event.seatNumber} registered at Cell Address (${event.row}, ${event.col}).`);
        this.loadLabMatrix(lab.id);
        this.loadLabs();
      } else {
        this.toast.error('Unable to add workstation seat.');
      }
    });
  }

  onRemoveSeat(seatId: number): void {
    const lab = this.selectedLab();
    if (!lab) return;

    this.labService.removeSeat(lab.id, seatId).subscribe((success) => {
      if (success) {
        this.toast.success('Workstation seat deactivated.');
        this.loadLabMatrix(lab.id);
        this.loadLabs();
      } else {
        this.toast.error('Unable to deactivate seat. Please verify active bookings.');
      }
    });
  }

  onCreateLabSubmitted(data: { name: string; labType: string; capacity: number; totalRows: number; totalColumns: number }): void {
    this.labService.createLab(data).subscribe((success) => {
      if (success) {
        this.toast.success(`Laboratory profile '${data.name}' created successfully.`);
        this.loadLabs();
      } else {
        this.toast.error('Failed to create laboratory profile.');
      }
    });
  }
}

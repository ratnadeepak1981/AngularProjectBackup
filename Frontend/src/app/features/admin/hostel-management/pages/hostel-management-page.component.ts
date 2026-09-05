import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HostelManagementService, HostelBuilding, HostelRoom, HousingApplication } from '../services/hostel-management.service';
import { ToastService } from '../../../../core/services/toast.service';
import { TabComponent, TabItem } from '../../../../shared/components/tab-component/tab.component';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { DataTableComponent } from '../../../../shared/components/data-table/data-table.component';
import { TableColumn } from '../../../../shared/components/data-table/models/table-column.model';
import { AssignRoomModalComponent } from '../components/assign-room-modal/assign-room-modal.component';
import { CreateRoomModalComponent } from '../components/create-room-modal/create-room-modal.component';
import { HostelsRoomsDirectoryComponent } from '../components/hostels-rooms-directory/hostels-rooms-directory.component';
import { ActionButtonComponent } from '../../../../shared/components/action-button/action-button.component';
import { ConfirmModalComponent } from '../../../../shared/components/dialogs/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-hostel-management-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    TabComponent,
    PageHeaderComponent,
    DataTableComponent,
    AssignRoomModalComponent,
    CreateRoomModalComponent,
    HostelsRoomsDirectoryComponent,
    ActionButtonComponent,
    ConfirmModalComponent,
  ],
  templateUrl: './hostel-management-page.component.html',
  styleUrl: './hostel-management-page.component.css',
})
export class HostelManagementPageComponent implements OnInit {
  private readonly hostelService = inject(HostelManagementService);
  private readonly toast = inject(ToastService);

  public readonly activeTabId = signal<string>('pending-apps');

  // Create Hostel Modal Signals
  public readonly isCreateHostelModalOpen = signal<boolean>(false);
  public readonly newHostelName = signal<string>('');
  public readonly isCreatingHostel = signal<boolean>(false);

  // Modal Control Signals
  public readonly isAssignModalOpen = signal<boolean>(false);
  public readonly assignApp = signal<HousingApplication | null>(null);

  public readonly isCreateRoomModalOpen = signal<boolean>(false);
  public readonly initialHostelIdForRoom = signal<number>(0);
  public readonly roomToEdit = signal<HostelRoom | null>(null);

  public readonly selectedHostelId = signal<number>(0);

  // Shared Confirm Modal Signals
  public readonly isConfirmOpen = signal<boolean>(false);
  public readonly confirmTitle = signal<string>('Confirm Action');
  public readonly confirmMessage = signal<string>('Are you sure you want to proceed?');
  public readonly confirmIcon = signal<string>('⚠️');
  public readonly confirmVariant = signal<'primary' | 'danger' | 'warning'>('danger');
  public readonly confirmButtonText = signal<string>('Confirm');
  public readonly confirmButtonIcon = signal<string>('✓');
  public pendingConfirmAction: (() => void) | null = null;

  // Table Column Configurations
  public readonly pendingAppColumns: TableColumn<any>[] = [
    { key: 'studentIndexNumber', header: 'Student Index', sortable: true, filterable: true },
    { key: 'studentName', header: 'Student Name', sortable: true, filterable: true },
    { key: 'preferredHostelName', header: 'Preferred Hostel', sortable: true, filterable: true },
    { key: 'termSemester', header: 'Term / Semester', sortable: true, filterable: true },
    { key: 'specialRequirements', header: 'Special Requirements', sortable: false, filterable: false },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      filterable: true,
      type: 'badge',
      badgeMap: {
        Pending: {
          label: 'PENDING',
          class: 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-700',
        },
        Approved: {
          label: 'APPROVED',
          class: 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700',
        },
      },
    },
    { key: 'actions', header: 'Actions', sortable: false, filterable: false, type: 'actions', align: 'right' },
  ];

  public readonly approvedAppColumns: TableColumn<any>[] = [
    { key: 'studentIndexNumber', header: 'Student Index', sortable: true, filterable: true },
    { key: 'studentName', header: 'Student Name', sortable: true, filterable: true },
    { key: 'preferredHostelName', header: 'Assigned Hostel', sortable: true, filterable: true },
    { key: 'assignedRoomNumber', header: 'Room Number', sortable: true, filterable: true },
    { key: 'termSemester', header: 'Term / Semester', sortable: true, filterable: true },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      filterable: true,
      type: 'badge',
      badgeMap: {
        Approved: {
          label: 'APPROVED',
          class: 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700',
        },
        RoomAssigned: {
          label: 'ROOM ASSIGNED',
          class: 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700',
        },
      },
    },
    { key: 'actions', header: 'Actions', sortable: false, filterable: false, type: 'actions', align: 'right' },
  ];

  // Master Data Signals
  public readonly pendingApplications = signal<HousingApplication[]>([]);
  public readonly allApplications = signal<HousingApplication[]>([]);
  public readonly hostels = signal<HostelBuilding[]>([]);
  public readonly isLoading = signal<boolean>(false);

  // Filtered Approved Housing Applications (Status === 'Approved' || 'RoomAssigned')
  public readonly approvedApplications = computed<HousingApplication[]>(() =>
    this.allApplications().filter((a) => a.status === 'Approved' || a.status === 'RoomAssigned')
  );

  // Header Tab Configuration
  public readonly pendingCount = computed(() => this.pendingApplications().length);
  public readonly approvedCount = computed(() => this.approvedApplications().length);
  public readonly hostelsCount = computed(() => this.hostels().length);

  public readonly hostelTabs = computed<TabItem[]>(() => [
    { id: 'pending-apps', label: 'Pending Housing Applications', icon: '📋', count: this.pendingCount() },
    { id: 'approved-apps', label: 'Approved Allocations', icon: '✅', count: this.approvedCount() },
    { id: 'directory', label: 'Hostels & Rooms Directory', icon: '🏢', count: this.hostelsCount() },
  ]);

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading.set(true);

    this.hostelService.getFormattedHostelsList(1, 100).subscribe({
      next: (items) => {
        this.hostels.set(items);
        if (items.length > 0 && (!this.selectedHostelId() || !items.some((h: any) => h.id === this.selectedHostelId()))) {
          this.selectedHostelId.set(items[0].id);
        }
      },
      error: () => this.hostels.set([]),
    });

    this.hostelService.getFormattedApplications().subscribe({
      next: (group) => {
        this.allApplications.set(group.all);
        this.pendingApplications.set(group.pending);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  onTabChange(tabId: string): void {
    this.activeTabId.set(tabId);
  }

  onHostelBuildingTabChange(tabId: number | string): void {
    const id = typeof tabId === 'number' ? tabId : parseInt(tabId, 10);
    this.selectedHostelId.set(id);
  }

  openAssignRoomModal(app: HousingApplication): void {
    this.assignApp.set(app);
    this.isAssignModalOpen.set(true);
  }

  openCreateHostelModal(): void {
    this.newHostelName.set('');
    this.isCreateHostelModalOpen.set(true);
  }

  closeCreateHostelModal(): void {
    this.isCreateHostelModalOpen.set(false);
  }

  submitCreateHostel(): void {
    const name = this.newHostelName().trim();
    if (!name) return;
    this.isCreatingHostel.set(true);
    this.hostelService.createHostel(name).subscribe({
      next: (res: any) => {
        this.isCreatingHostel.set(false);
        this.toast.success(`Hostel "${name}" registered successfully!`);
        this.closeCreateHostelModal();
        this.loadData();
        const createdId = res?.data?.id || res?.id;
        if (createdId) {
          this.selectedHostelId.set(createdId);
        }
      },
      error: (err: any) => {
        this.isCreatingHostel.set(false);
        this.toast.error(err.error?.message || 'Failed to create hostel building.');
      },
    });
  }

  openCreateRoomModal(hostelId: number = 0): void {
    this.roomToEdit.set(null);
    this.initialHostelIdForRoom.set(hostelId > 0 ? hostelId : (this.hostels()[0]?.id || 0));
    this.isCreateRoomModalOpen.set(true);
  }

  openEditRoomModal(room: HostelRoom): void {
    this.roomToEdit.set(room);
    this.isCreateRoomModalOpen.set(true);
  }

  onTriggerConfirm(event: { title: string; message: string; icon: string; variant: 'primary' | 'danger' | 'warning'; action: () => void }): void {
    this.confirmTitle.set(event.title);
    this.confirmMessage.set(event.message);
    this.confirmIcon.set(event.icon);
    this.confirmVariant.set(event.variant);
    this.confirmButtonText.set('Confirm');
    this.confirmButtonIcon.set('✓');
    this.pendingConfirmAction = event.action;
    this.isConfirmOpen.set(true);
  }

  promptApproveApplication(app: HousingApplication): void {
    this.onTriggerConfirm({
      title: 'Approve Housing Application',
      message: `Are you sure you want to approve housing application for ${app.studentName}? Room assignment will become available once approved.`,
      icon: '✅',
      variant: 'primary',
      action: () => {
        this.hostelService.updateApplicationStatus(app.id, 'Approved').subscribe({
          next: () => {
            this.toast.success(`Housing application approved for ${app.studentName}. You can now assign a room in Approved Allocations.`);
            this.loadData();
            this.activeTabId.set('approved-apps');
          },
          error: (err) => this.toast.error(err?.error?.message || 'Failed to approve application.'),
        });
      },
    });
  }

  promptRejectApplication(app: HousingApplication): void {
    this.onTriggerConfirm({
      title: 'Reject Housing Application',
      message: `Are you sure you want to reject housing application for ${app.studentName}?`,
      icon: '🏠',
      variant: 'danger',
      action: () => {
        this.hostelService.updateApplicationStatus(app.id, 'Rejected').subscribe({
          next: () => {
            this.toast.info('Housing application rejected.');
            this.loadData();
          },
          error: (err) => this.toast.error(err?.error?.message || 'Failed to reject application.'),
        });
      },
    });
  }
}

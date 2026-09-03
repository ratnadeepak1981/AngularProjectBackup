import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CertificateManagementService } from '../services/certificate-management.service';
import { Certificate, CertificateType } from '../../../../core/models/certificate/certificate.model';
import { ToastService } from '../../../../core/services/toast.service';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { TabComponent, TabItem } from '../../../../shared/components/tab-component/tab.component';
import { DataTableComponent } from '../../../../shared/components/data-table/data-table.component';
import { TableColumn } from '../../../../shared/components/data-table/models/table-column.model';
import { ActionButtonComponent } from '../../../../shared/components/action-button/action-button.component';
import { ConfirmModalComponent } from '../../../../shared/components/dialogs/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-certificate-management-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PageHeaderComponent,
    TabComponent,
    DataTableComponent,
    ActionButtonComponent,
    ConfirmModalComponent,
  ],
  templateUrl: './certificate-management-page.component.html',
  styleUrl: './certificate-management-page.component.css',
})
export class CertificateManagementPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly certService = inject(CertificateManagementService);
  private readonly toast = inject(ToastService);

  public readonly activeTabId = signal<string>('requests');
  public readonly isLoading = signal<boolean>(false);
  public readonly isCreateTypeModalOpen = signal<boolean>(false);
  public readonly isSubmittingType = signal<boolean>(false);

  public readonly requests = signal<Certificate[]>([]);
  public readonly types = signal<CertificateType[]>([]);

  // Confirm Modal Signals
  public readonly isConfirmOpen = signal<boolean>(false);
  public readonly confirmTitle = signal<string>('Confirm Action');
  public readonly confirmMessage = signal<string>('');
  public readonly confirmIcon = signal<string>('⚠️');
  public readonly confirmVariant = signal<'primary' | 'danger' | 'warning'>('danger');
  public readonly confirmButtonText = signal<string>('Proceed');
  public readonly confirmButtonIcon = signal<string>('✓');
  public pendingConfirmAction: (() => void) | null = null;

  // Add Type Reactive Form
  public readonly typeForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
  });

  // Table Columns
  public readonly requestColumns: TableColumn<Certificate>[] = [
    { key: 'studentName', header: 'Student Name / Index', sortable: true, filterable: true },
    { key: 'certificateTypeName', header: 'Certificate Type', sortable: true, filterable: true },
    { key: 'reason', header: 'Reason / Justification', sortable: true, filterable: false },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      filterable: true,
      type: 'badge',
      badgeMap: {
        Pending: {
          label: 'PENDING APPROVAL',
          class: 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-700',
        },
        Approved: {
          label: 'APPROVED',
          class: 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700',
        },
        'Ready for Collection': {
          label: 'READY FOR COLLECTION 📦',
          class: 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-700 animate-pulse',
        },
        Rejected: {
          label: 'REJECTED',
          class: 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-700',
        },
      },
    },
    { key: 'requestedAt', header: 'Requested Date', sortable: true, filterable: false, type: 'date' },
    { key: 'actions', header: 'Actions', sortable: false, filterable: false, type: 'actions', align: 'right' },
  ];

  public readonly typeColumns: TableColumn<CertificateType>[] = [
    { key: 'name', header: 'Certificate Type Name', sortable: true, filterable: true },
    {
      key: 'isActive',
      header: 'Catalog Status',
      sortable: true,
      filterable: true,
      type: 'badge',
      badgeMap: {
        true: {
          label: 'ACTIVE',
          class: 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700',
        },
        false: {
          label: 'DEACTIVATED',
          class: 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700',
        },
      },
    },
    { key: 'actions', header: 'Actions', sortable: false, filterable: false, type: 'actions', align: 'right' },
  ];

  public readonly tabs = computed<TabItem[]>(() => [
    { id: 'requests', label: 'Certificate Requests Ledger', icon: '📋', count: this.requests().length },
    { id: 'types', label: 'Certificate Types Catalog', icon: '⚙️', count: this.types().length },
  ]);

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading.set(true);

    this.certService.getRequests().subscribe({
      next: (data) => this.requests.set(data),
      error: () => this.toast.error('Failed to load certificate requests.'),
    });

    this.certService.getCertificateTypes().subscribe({
      next: (types) => {
        this.types.set(types);
        this.isLoading.set(false);
      },
      error: () => {
        this.toast.error('Failed to load certificate types.');
        this.isLoading.set(false);
      },
    });
  }

  onTabChange(tabId: string): void {
    this.activeTabId.set(tabId);
  }

  triggerConfirm(opts: {
    title: string;
    message: string;
    icon: string;
    variant: 'primary' | 'danger' | 'warning';
    buttonText: string;
    buttonIcon: string;
    action: () => void;
  }): void {
    this.confirmTitle.set(opts.title);
    this.confirmMessage.set(opts.message);
    this.confirmIcon.set(opts.icon);
    this.confirmVariant.set(opts.variant);
    this.confirmButtonText.set(opts.buttonText);
    this.confirmButtonIcon.set(opts.buttonIcon);
    this.pendingConfirmAction = opts.action;
    this.isConfirmOpen.set(true);
  }

  onConfirmAction(): void {
    if (this.pendingConfirmAction) {
      this.pendingConfirmAction();
    }
    this.isConfirmOpen.set(false);
  }

  onCancelConfirm(): void {
    this.isConfirmOpen.set(false);
    this.pendingConfirmAction = null;
  }

  promptApproveRequest(req: Certificate): void {
    this.triggerConfirm({
      title: 'Approve Certificate Request',
      message: `Are you sure you want to approve the '${req.certificateTypeName || 'Certificate'}' request for ${req.studentName || 'this student'}?`,
      icon: '✓',
      variant: 'primary',
      buttonText: 'Approve Request',
      buttonIcon: '✓',
      action: () => {
        this.certService.updateRequestStatus(req.id, 'Approved').subscribe({
          next: () => {
            this.toast.success('Certificate request approved successfully.');
            this.loadData();
          },
          error: (err) => this.toast.error(err?.error?.message || 'Failed to approve request.'),
        });
      },
    });
  }

  promptRejectRequest(req: Certificate): void {
    this.triggerConfirm({
      title: 'Reject Certificate Request',
      message: `Are you sure you want to reject the certificate request for ${req.studentName || 'this student'}?`,
      icon: '✕',
      variant: 'danger',
      buttonText: 'Reject Request',
      buttonIcon: '✕',
      action: () => {
        this.certService.updateRequestStatus(req.id, 'Rejected').subscribe({
          next: () => {
            this.toast.info('Certificate request rejected.');
            this.loadData();
          },
          error: (err) => this.toast.error(err?.error?.message || 'Failed to reject request.'),
        });
      },
    });
  }

  promptMarkReadyForCollection(req: Certificate): void {
    this.triggerConfirm({
      title: 'Mark Ready for Collection',
      message: `Are you sure this certificate is printed and ready for pickup? An automated notification will be dispatched to ${req.studentName || 'the student'}.`,
      icon: '📦',
      variant: 'primary',
      buttonText: 'Mark Ready & Notify Student',
      buttonIcon: '📦',
      action: () => {
        this.certService.updateRequestStatus(req.id, 'Ready for Collection').subscribe({
          next: () => {
            this.toast.success('Certificate marked as Ready for Collection! Automated notification dispatched.');
            this.loadData();
          },
          error: (err) => this.toast.error(err?.error?.message || 'Failed to update status.'),
        });
      },
    });
  }

  openCreateTypeModal(): void {
    this.typeForm.reset();
    this.isCreateTypeModalOpen.set(true);
  }

  closeCreateTypeModal(): void {
    this.isCreateTypeModalOpen.set(false);
  }

  submitCreateType(): void {
    if (this.typeForm.invalid) {
      this.typeForm.markAllAsTouched();
      return;
    }

    this.isSubmittingType.set(true);
    const name = this.typeForm.value.name.trim();

    this.certService.createCertificateType(name).subscribe({
      next: () => {
        this.toast.success('Certificate type created successfully.');
        this.isSubmittingType.set(false);
        this.closeCreateTypeModal();
        this.loadData();
      },
      error: (err) => {
        this.toast.error(err?.error?.message || 'Failed to create type.');
        this.isSubmittingType.set(false);
      },
    });
  }

  promptDeactivateType(type: CertificateType): void {
    this.triggerConfirm({
      title: 'Deactivate Certificate Type',
      message: `Are you sure you want to deactivate '${type.name}'? Students will no longer be able to select it.`,
      icon: '🗑️',
      variant: 'danger',
      buttonText: 'Deactivate Type',
      buttonIcon: '🗑️',
      action: () => {
        this.certService.deleteCertificateType(type.id).subscribe({
          next: () => {
            this.toast.info('Certificate type deactivated.');
            this.loadData();
          },
          error: (err) => this.toast.error(err?.error?.message || 'Failed to deactivate type.'),
        });
      },
    });
  }

  promptReactivateType(type: CertificateType): void {
    this.triggerConfirm({
      title: 'Reactivate Certificate Type',
      message: `Are you sure you want to reactivate '${type.name}'? It will immediately become available for student requests.`,
      icon: '🔄',
      variant: 'primary',
      buttonText: 'Reactivate Type',
      buttonIcon: '✓',
      action: () => {
        this.certService.updateCertificateType(type.id, { name: type.name, isActive: true }).subscribe({
          next: () => {
            this.toast.success(`Certificate type '${type.name}' reactivated successfully.`);
            this.loadData();
          },
          error: (err) => this.toast.error(err?.error?.message || 'Failed to reactivate type.'),
        });
      },
    });
  }
}

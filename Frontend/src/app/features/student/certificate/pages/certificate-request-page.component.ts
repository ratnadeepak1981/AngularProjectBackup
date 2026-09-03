import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CertificateRequestService } from '../services/certificate-request.service';
import { Certificate, CertificateType } from '../../../../core/models/certificate/certificate.model';
import { ToastService } from '../../../../core/services/toast.service';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { TabComponent, TabItem } from '../../../../shared/components/tab-component/tab.component';
import { DataTableComponent } from '../../../../shared/components/data-table/data-table.component';
import { TableColumn } from '../../../../shared/components/data-table/models/table-column.model';
import { SelectDropdownComponent } from '../../../../shared/components/select-dropdown/select-dropdown.component';
import { DropdownOption } from '../../../../core/models/common/dropdown-option.model';
import { ActionButtonComponent } from '../../../../shared/components/action-button/action-button.component';

@Component({
  selector: 'app-certificate-request-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PageHeaderComponent,
    TabComponent,
    DataTableComponent,
    SelectDropdownComponent,
    ActionButtonComponent,
  ],
  templateUrl: './certificate-request-page.component.html',
  styleUrl: './certificate-request-page.component.css',
})
export class CertificateRequestPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly certService = inject(CertificateRequestService);
  private readonly toast = inject(ToastService);

  public readonly activeTabId = signal<string>('request');
  public readonly isLoading = signal<boolean>(false);
  public readonly isSubmitting = signal<boolean>(false);
  public readonly errorMessage = signal<string | null>(null);

  public readonly myRequests = signal<Certificate[]>([]);
  public readonly certTypes = signal<CertificateType[]>([]);

  // Reactive Form
  public readonly requestForm: FormGroup = this.fb.group({
    certificateTypeId: ['', [Validators.required]],
    reason: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(500)]],
  });

  // Table Columns
  public readonly requestColumns: TableColumn<Certificate>[] = [
    { key: 'certificateTypeName', header: 'Certificate Type', sortable: true, filterable: true },
    { key: 'reason', header: 'Reason / Purpose', sortable: true, filterable: false },
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
  ];

  public readonly dropdownOptions = computed<DropdownOption[]>(() =>
    this.certTypes().map((t) => ({
      value: String(t.id),
      label: t.name,
      icon: '📜',
    }))
  );

  public readonly tabs = computed<TabItem[]>(() => [
    { id: 'request', label: 'Request Certificate', icon: '📜' },
    { id: 'my-requests', label: 'My Certificate Requests', icon: '📋', count: this.myRequests().length },
  ]);

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading.set(true);

    this.certService.getCertificateTypes().subscribe({
      next: (types) => this.certTypes.set(types),
      error: () => this.toast.error('Failed to load certificate options.'),
    });

    this.certService.getMyRequests().subscribe({
      next: (requests) => {
        this.myRequests.set(requests);
        this.isLoading.set(false);
      },
      error: () => {
        this.toast.error('Failed to load certificate requests.');
        this.isLoading.set(false);
      },
    });
  }

  onTabChange(tabId: string): void {
    this.activeTabId.set(tabId);
  }

  onSelectType(val: string | number): void {
    this.errorMessage.set(null);
    this.requestForm.patchValue({ certificateTypeId: val });
    this.requestForm.get('certificateTypeId')?.markAsTouched();
  }

  submitRequest(): void {
    this.errorMessage.set(null);

    if (this.requestForm.invalid) {
      this.requestForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const formVal = this.requestForm.value;

    this.certService
      .submitRequest({
        certificateTypeId: Number(formVal.certificateTypeId),
        reason: formVal.reason.trim(),
      })
      .subscribe({
        next: () => {
          this.toast.success('Certificate request submitted successfully!');
          this.requestForm.reset();
          this.isSubmitting.set(false);
          this.loadData();
          this.activeTabId.set('my-requests');
        },
        error: (err) => {
          const msg = err?.error?.message || err?.error?.Message || err?.message || 'Failed to submit certificate request.';
          this.errorMessage.set(msg);
          this.isSubmitting.set(false);
        },
      });
  }
}

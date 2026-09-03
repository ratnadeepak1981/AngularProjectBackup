import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { StudentComplaintService } from '../services/student-complaint.service';
import { Complaint, ComplaintCategory } from '../../../../core/models/complaint/complaint.model';
import { ToastService } from '../../../../core/services/toast.service';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { TabComponent, TabItem } from '../../../../shared/components/tab-component/tab.component';
import { DataTableComponent } from '../../../../shared/components/data-table/data-table.component';
import { TableColumn } from '../../../../shared/components/data-table/models/table-column.model';
import { SelectDropdownComponent } from '../../../../shared/components/select-dropdown/select-dropdown.component';
import { DropdownOption } from '../../../../core/models/common/dropdown-option.model';
import { ActionButtonComponent } from '../../../../shared/components/action-button/action-button.component';

@Component({
  selector: 'app-student-complaint-page',
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
  templateUrl: './student-complaint-page.component.html',
  styleUrl: './student-complaint-page.component.css',
})
export class StudentComplaintPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly complaintService = inject(StudentComplaintService);
  private readonly toast = inject(ToastService);

  public readonly activeTabId = signal<string>('lodge');
  public readonly isLoading = signal<boolean>(false);
  public readonly isSubmitting = signal<boolean>(false);
  public readonly errorMessage = signal<string | null>(null);

  public readonly myComplaints = signal<Complaint[]>([]);
  public readonly categories = signal<ComplaintCategory[]>([]);

  // Reactive Form
  public readonly complaintForm: FormGroup = this.fb.group({
    categoryId: ['', [Validators.required]],
    description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(1000)]],
    building: [''],
    roomNumber: [''],
    courseCode: [''],
  });

  public readonly selectedCategoryType = signal<'maintenance' | 'academic' | 'general'>('general');

  // Table Columns
  public readonly complaintColumns: TableColumn<Complaint>[] = [
    { key: 'categoryName', header: 'Category', sortable: true, filterable: true },
    { key: 'description', header: 'Grievance Description', sortable: true, filterable: false },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      filterable: true,
      type: 'badge',
      badgeMap: {
        Pending: {
          label: 'PENDING TRIAGE',
          class: 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-700',
        },
        'In Progress': {
          label: 'IN PROGRESS ⚡',
          class: 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-700',
        },
        Resolved: {
          label: 'RESOLVED ✓',
          class: 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700',
        },
        Rejected: {
          label: 'REJECTED',
          class: 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-700',
        },
      },
    },
    { key: 'resolutionNote', header: 'Staff Resolution Remarks', sortable: false, filterable: false },
    { key: 'createdAt', header: 'Logged Date', sortable: true, filterable: false, type: 'date' },
  ];

  public readonly dropdownOptions = computed<DropdownOption[]>(() =>
    this.categories().map((c) => ({
      value: String(c.id),
      label: c.name,
      icon: '📁',
    }))
  );

  public readonly tabs = computed<TabItem[]>(() => [
    { id: 'lodge', label: 'Lodge New Complaint', icon: '📝' },
    { id: 'my-tickets', label: 'My Grievance Tickets', icon: '🎫', count: this.myComplaints().length },
  ]);

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading.set(true);

    this.complaintService.getCategories().subscribe({
      next: (cats) => this.categories.set(cats),
      error: () => this.toast.error('Failed to load complaint categories.'),
    });

    this.complaintService.getMyComplaints().subscribe({
      next: (complaints) => {
        this.myComplaints.set(complaints);
        this.isLoading.set(false);
      },
      error: () => {
        this.toast.error('Failed to load grievance tickets.');
        this.isLoading.set(false);
      },
    });
  }

  onTabChange(tabId: string): void {
    this.activeTabId.set(tabId);
  }

  onSelectCategory(val: string | number): void {
    this.errorMessage.set(null);
    this.complaintForm.patchValue({ categoryId: val });
    this.complaintForm.get('categoryId')?.markAsTouched();

    const matchedCat = this.categories().find((c) => c.id === Number(val));
    const catName = matchedCat?.name.toLowerCase() || '';

    if (catName.includes('maintenance') || catName.includes('hostel') || catName.includes('facility')) {
      this.selectedCategoryType.set('maintenance');
      this.complaintForm.get('building')?.setValidators([Validators.required]);
      this.complaintForm.get('roomNumber')?.setValidators([Validators.required]);
      this.complaintForm.get('courseCode')?.clearValidators();
    } else if (catName.includes('academic') || catName.includes('course') || catName.includes('exam')) {
      this.selectedCategoryType.set('academic');
      this.complaintForm.get('courseCode')?.setValidators([Validators.required]);
      this.complaintForm.get('building')?.clearValidators();
      this.complaintForm.get('roomNumber')?.clearValidators();
    } else {
      this.selectedCategoryType.set('general');
      this.complaintForm.get('building')?.clearValidators();
      this.complaintForm.get('roomNumber')?.clearValidators();
      this.complaintForm.get('courseCode')?.clearValidators();
    }

    this.complaintForm.get('building')?.updateValueAndValidity();
    this.complaintForm.get('roomNumber')?.updateValueAndValidity();
    this.complaintForm.get('courseCode')?.updateValueAndValidity();
  }

  submitComplaint(): void {
    this.errorMessage.set(null);

    if (this.complaintForm.invalid) {
      this.complaintForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const formVal = this.complaintForm.value;

    let fullDescription = formVal.description.trim();
    if (this.selectedCategoryType() === 'maintenance' && (formVal.building || formVal.roomNumber)) {
      fullDescription = `[Building: ${formVal.building || 'N/A'}, Room: ${formVal.roomNumber || 'N/A'}] - ${fullDescription}`;
    } else if (this.selectedCategoryType() === 'academic' && formVal.courseCode) {
      fullDescription = `[Course Code: ${formVal.courseCode}] - ${fullDescription}`;
    }

    this.complaintService
      .submitComplaint({
        categoryId: Number(formVal.categoryId),
        description: fullDescription.substring(0, 1000),
      })
      .subscribe({
        next: () => {
          this.toast.success('Complaint ticket submitted successfully!');
          this.complaintForm.reset();
          this.selectedCategoryType.set('general');
          this.isSubmitting.set(false);
          this.loadData();
          this.activeTabId.set('my-tickets');
        },
        error: (err) => {
          const msg = err?.error?.message || err?.error?.Message || err?.message || 'Failed to submit complaint.';
          this.errorMessage.set(msg);
          this.isSubmitting.set(false);
        },
      });
  }
}

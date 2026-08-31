import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FacultyManagementService } from '../../services/faculty-management.service';
import { ToastService } from '../../../../../core/services/toast.service';
import { Faculty } from '../../../../../core/models/faculty/faculty.model';
import { PageHeaderComponent } from '../../../../../shared/components/page-header/page-header.component';
import { DataTableComponent } from '../../../../../shared/components/data-table/data-table.component';
import { ConfirmModalComponent } from '../../../../../shared/components/dialogs/confirm-modal/confirm-modal.component';
import { TableColumn } from '../../../../../shared/components/data-table/models/table-column.model';
import { ActionButtonComponent } from '../../../../../shared/components/action-button/action-button.component';

@Component({
  selector: 'app-faculty-management-page',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeaderComponent, DataTableComponent, ConfirmModalComponent, ActionButtonComponent],
  templateUrl: './faculty-management.page.component.html',
  styleUrl: './faculty-management.page.component.css',
})
export class FacultyManagementPageComponent implements OnInit {
  private readonly facultyService = inject(FacultyManagementService);
  private readonly toast = inject(ToastService);

  // State Signals
  public readonly faculties = signal<Faculty[]>([]);
  public readonly isLoading = signal<boolean>(false);
  public readonly searchTerm = signal<string>('');
  public readonly currentPage = signal<number>(1);
  public readonly pageSize = signal<number>(10);
  public readonly sortColumn = signal<string>('name');
  public readonly sortDirection = signal<'asc' | 'desc'>('asc');

  // Create Modal Signals
  public readonly isCreateModalOpen = signal<boolean>(false);
  public readonly isSubmitting = signal<boolean>(false);
  public readonly facultyNameInput = signal<string>('');
  public readonly facultyCodeInput = signal<string>('');

  // Deactivate Confirm Modal Signals
  public readonly isConfirmModalOpen = signal<boolean>(false);
  public readonly isDeactivating = signal<boolean>(false);
  public readonly selectedFacultyForDelete = signal<Faculty | null>(null);

  // Data Table Columns
  public readonly tableColumns: TableColumn<any>[] = [
    { key: 'name', header: 'Faculty Name', sortable: true, filterable: true },
    { key: 'facultyCodeText', header: 'Faculty Code', sortable: true, filterable: true },
    {
      key: 'statusText',
      header: 'Faculty Status',
      sortable: true,
      filterable: true,
      type: 'badge',
      badgeMap: {
        Active: {
          label: 'Active',
          class: 'px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700',
        },
        Deactivated: {
          label: 'Deactivated',
          class: 'px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-700',
        },
      },
    },
    { key: 'actions', header: 'Actions', sortable: false, filterable: false, type: 'actions', align: 'center' },
  ];

  // Formatted Display Records
  public readonly displayFaculties = computed(() => {
    let list = this.faculties().map((f) => ({
      ...f,
      facultyCodeText: f.code || `FAC-${f.id}`,
      statusText: (f as any).isActive === false ? 'Deactivated' : 'Active',
    }));

    const search = this.searchTerm().trim().toLowerCase();
    if (search) {
      list = list.filter(
        (f) =>
          f.name.toLowerCase().includes(search) ||
          f.facultyCodeText.toLowerCase().includes(search) ||
          f.statusText.toLowerCase().includes(search)
      );
    }

    return list;
  });

  ngOnInit(): void {
    this.loadFaculties();
  }

  loadFaculties(): void {
    this.isLoading.set(true);
    this.facultyService.getFaculties().subscribe({
      next: (res) => {
        this.isLoading.set(false);
        const list = res.data || (Array.isArray(res) ? res : []);
        this.faculties.set(list);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.toast.error(err.error?.message || 'Failed to load university faculties master list.');
      },
    });
  }

  onSortChange(event: { column: string; direction: 'asc' | 'desc' }): void {
    this.sortColumn.set(event.column);
    this.sortDirection.set(event.direction);
  }

  // Create Modal Actions
  openCreateModal(): void {
    this.facultyNameInput.set('');
    this.facultyCodeInput.set('');
    this.isCreateModalOpen.set(true);
  }

  closeCreateModal(): void {
    this.isCreateModalOpen.set(false);
  }

  submitCreateFaculty(): void {
    const name = this.facultyNameInput().trim();
    if (!name) {
      this.toast.warning('Please enter a Faculty Name.');
      return;
    }

    this.isSubmitting.set(true);
    const payload = {
      name,
      code: this.facultyCodeInput().trim() || undefined,
    };

    this.facultyService.createFaculty(payload).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.toast.success(`Faculty "${name}" created successfully!`);
        this.closeCreateModal();
        this.loadFaculties();
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.toast.error(err.error?.message || 'Failed to create faculty master entry.');
      },
    });
  }

  // Deactivate Actions using ConfirmModalComponent
  openDeactivateModal(faculty: Faculty): void {
    this.selectedFacultyForDelete.set(faculty);
    this.isConfirmModalOpen.set(true);
  }

  closeDeactivateModal(): void {
    this.isConfirmModalOpen.set(false);
    this.selectedFacultyForDelete.set(null);
  }

  confirmDeactivate(): void {
    const faculty = this.selectedFacultyForDelete();
    if (!faculty) return;

    this.isDeactivating.set(true);
    this.facultyService.deleteFaculty(faculty.id).subscribe({
      next: () => {
        this.isDeactivating.set(false);
        this.toast.success(`Faculty "${faculty.name}" was soft-deactivated successfully.`);
        this.closeDeactivateModal();
        this.loadFaculties();
      },
      error: (err) => {
        this.isDeactivating.set(false);
        this.toast.error(err.error?.message || 'Cannot deactivate faculty with active student registrations.');
      },
    });
  }
}

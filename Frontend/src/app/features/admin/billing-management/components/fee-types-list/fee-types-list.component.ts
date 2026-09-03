import { Component, EventEmitter, Input, Output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FeeTypeItem } from '../../services/admin-billing';
import { DataTableComponent } from '../../../../../shared/components/data-table/data-table.component';
import { TableColumn } from '../../../../../shared/components/data-table/models/table-column.model';
import { ActionButtonComponent } from '../../../../../shared/components/action-button/action-button.component';

@Component({
  selector: 'app-fee-types-list',
  standalone: true,
  imports: [CommonModule, FormsModule, DataTableComponent, ActionButtonComponent],
  templateUrl: './fee-types-list.component.html',
  styleUrl: './fee-types-list.component.css',
})
export class FeeTypesListComponent {
  @Input() feeTypes: FeeTypeItem[] = [];
  @Input() isLoading = false;

  @Output() deactivate = new EventEmitter<FeeTypeItem>();
  @Output() toggleStatus = new EventEmitter<FeeTypeItem>();
  @Output() refresh = new EventEmitter<void>();

  public readonly columns: TableColumn<any>[] = [
    { key: 'name', header: 'Fee Type Name', sortable: true, filterable: true },
    {
      key: 'isActive',
      header: 'Status',
      sortable: true,
      filterable: true,
      type: 'badge',
      badgeMap: {
        true: {
          label: '● ACTIVE',
          class: 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700',
        },
        false: {
          label: '○ DEACTIVATED',
          class: 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-700',
        },
      },
    },
    { key: 'actions', header: 'Actions', sortable: false, filterable: false, type: 'actions', align: 'right' },
  ];
}

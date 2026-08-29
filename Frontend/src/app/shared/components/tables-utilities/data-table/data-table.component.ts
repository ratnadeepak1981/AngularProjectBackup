import { Component, computed, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaginationComponent } from '../pagination/pagination.component';

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  filterType?: 'text' | 'select' | 'boolean';
  filterOptions?: { label: string; value: any }[];
  align?: 'left' | 'center' | 'right';
  width?: string;
}

export interface SortEvent {
  column: string;
  direction: 'asc' | 'desc' | null;
}

export interface FilterChangeEvent {
  filters: Record<string, any>;
  column: string;
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent],
  templateUrl: './data-table.component.html',
  styleUrl: './data-table.component.css',
})
export class DataTableComponent {
  // Inputs
  public readonly columns = input<TableColumn[]>([]);
  public readonly data = input<any[]>([]);
  public readonly isLoading = input<boolean>(false);
  public readonly totalRecords = input<number>(0);
  public readonly currentPage = input<number>(1);
  public readonly pageSize = input<number>(5);
  public readonly pageSizeOptions = input<number[]>([5, 10, 20, 50, 100]);
  public readonly emptyMessage = input<string>('No records found matching your criteria.');
  public readonly showPagination = input<boolean>(true);
  public readonly striped = input<boolean>(true);
  public readonly hoverable = input<boolean>(true);

  // Sorting State
  public readonly currentSortColumn = signal<string | null>(null);
  public readonly currentSortDirection = signal<'asc' | 'desc' | null>(null);

  // Column Filter State
  public readonly activeOpenFilter = signal<string | null>(null);
  public readonly columnSearchTerms = signal<Record<string, string>>({});
  public readonly activeFilters = signal<Record<string, any[]>>({});
  public readonly tempFilterSelections = signal<Record<string, any[]>>({});

  // Outputs
  public readonly pageChange = output<number>();
  public readonly pageSizeChange = output<number>();
  public readonly sortChange = output<SortEvent>();
  public readonly filterChange = output<FilterChangeEvent>();
  public readonly clearAllFiltersEvent = output<void>();

  // Computed count of active filters
  public readonly activeFilterCount = computed(() => {
    const filters = this.activeFilters();
    let count = 0;
    for (const key of Object.keys(filters)) {
      if (filters[key] && filters[key].length > 0) {
        count++;
      }
    }
    return count;
  });

  public onSort(column: TableColumn): void {
    if (!column.sortable) return;

    let direction: 'asc' | 'desc' | null = 'asc';
    if (this.currentSortColumn() === column.key) {
      if (this.currentSortDirection() === 'asc') {
        direction = 'desc';
      } else if (this.currentSortDirection() === 'desc') {
        direction = null;
      }
    }

    this.currentSortColumn.set(direction ? column.key : null);
    this.currentSortDirection.set(direction);

    this.sortChange.emit({
      column: column.key,
      direction,
    });
  }

  public setColumnSort(columnKey: string, direction: 'asc' | 'desc' | null): void {
    this.currentSortColumn.set(direction ? columnKey : null);
    this.currentSortDirection.set(direction);
    this.sortChange.emit({
      column: columnKey,
      direction,
    });
    this.closeFilterMenu();
  }

  public toggleFilterMenu(columnKey: string, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    if (this.activeOpenFilter() === columnKey) {
      this.closeFilterMenu();
      return;
    }

    // Initialize temporary selections from active filters or all distinct values
    const currentActive = this.activeFilters()[columnKey];
    const distinct = this.getDistinctValues(columnKey);
    const initialSelected = currentActive && currentActive.length > 0 ? [...currentActive] : [...distinct];

    this.tempFilterSelections.update((prev) => ({
      ...prev,
      [columnKey]: initialSelected,
    }));

    this.activeOpenFilter.set(columnKey);
  }

  public closeFilterMenu(): void {
    this.activeOpenFilter.set(null);
  }

  public getDistinctValues(columnKey: string): any[] {
    const records = this.data();
    if (!records || records.length === 0) return [];

    const set = new Set<any>();
    records.forEach((row) => {
      const val = row[columnKey];
      if (val !== undefined && val !== null && val !== '') {
        set.add(val);
      }
    });

    return Array.from(set).sort((a, b) => {
      if (typeof a === 'number' && typeof b === 'number') return a - b;
      return String(a).localeCompare(String(b));
    });
  }

  public getFilteredDistinctValues(columnKey: string): any[] {
    const distinct = this.getDistinctValues(columnKey);
    const search = (this.columnSearchTerms()[columnKey] || '').toLowerCase().trim();
    if (!search) return distinct;
    return distinct.filter((val) => String(val).toLowerCase().includes(search));
  }

  public isValueSelected(columnKey: string, value: any): boolean {
    const selected = this.tempFilterSelections()[columnKey] || [];
    return selected.includes(value);
  }

  public toggleValueSelection(columnKey: string, value: any): void {
    const current = this.tempFilterSelections()[columnKey] || [];
    let updated: any[];
    if (current.includes(value)) {
      updated = current.filter((v) => v !== value);
    } else {
      updated = [...current, value];
    }
    this.tempFilterSelections.update((prev) => ({
      ...prev,
      [columnKey]: updated,
    }));
  }

  public isAllSelected(columnKey: string): boolean {
    const distinct = this.getFilteredDistinctValues(columnKey);
    const selected = this.tempFilterSelections()[columnKey] || [];
    return distinct.length > 0 && distinct.every((val) => selected.includes(val));
  }

  public toggleSelectAll(columnKey: string): void {
    const distinct = this.getDistinctValues(columnKey);
    const isAll = this.isAllSelected(columnKey);

    this.tempFilterSelections.update((prev) => ({
      ...prev,
      [columnKey]: isAll ? [] : [...distinct],
    }));
  }

  public onColumnSearchChange(columnKey: string, value: string): void {
    this.columnSearchTerms.update((prev) => ({
      ...prev,
      [columnKey]: value,
    }));
  }

  public applyFilter(columnKey: string): void {
    const selected = this.tempFilterSelections()[columnKey] || [];
    const distinct = this.getDistinctValues(columnKey);

    // If all distinct values are selected or none, consider it unrestricted / cleared
    const isUnrestricted = selected.length === 0 || selected.length === distinct.length;

    this.activeFilters.update((prev) => {
      const copy = { ...prev };
      if (isUnrestricted) {
        delete copy[columnKey];
      } else {
        copy[columnKey] = selected;
      }
      return copy;
    });

    this.filterChange.emit({
      column: columnKey,
      filters: this.activeFilters(),
    });

    this.closeFilterMenu();
  }

  public clearFilter(columnKey: string): void {
    this.activeFilters.update((prev) => {
      const copy = { ...prev };
      delete copy[columnKey];
      return copy;
    });

    this.tempFilterSelections.update((prev) => {
      const copy = { ...prev };
      delete copy[columnKey];
      return copy;
    });

    this.columnSearchTerms.update((prev) => {
      const copy = { ...prev };
      delete copy[columnKey];
      return copy;
    });

    this.filterChange.emit({
      column: columnKey,
      filters: this.activeFilters(),
    });

    this.closeFilterMenu();
  }

  public clearAllFilters(): void {
    this.activeFilters.set({});
    this.tempFilterSelections.set({});
    this.columnSearchTerms.set({});
    this.currentSortColumn.set(null);
    this.currentSortDirection.set(null);
    this.closeFilterMenu();
    this.clearAllFiltersEvent.emit();
  }

  public isColumnFiltered(columnKey: string): boolean {
    const filter = this.activeFilters()[columnKey];
    return Array.isArray(filter) && filter.length > 0;
  }

  public onPageChange(page: number): void {
    this.pageChange.emit(page);
  }

  public onPageSizeChange(size: number): void {
    this.pageSizeChange.emit(size);
  }
}


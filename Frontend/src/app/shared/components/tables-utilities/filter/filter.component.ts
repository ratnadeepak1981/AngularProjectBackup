import { Component, computed, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FilterOption } from '../../../../core/models/common/filter-option.model';

export type { FilterOption };

@Component({
  selector: 'app-filter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './filter.component.html',
  styleUrl: './filter.component.css',
})
export class FilterComponent {
  public readonly label = input<string>('Filter');
  public readonly options = input<FilterOption[]>([]);
  public readonly selectedValues = input<any[]>([]);
  public readonly showSearch = input<boolean>(true);
  public readonly searchPlaceholder = input<string>('Search options...');

  public readonly filterChange = output<any[]>();
  public readonly clear = output<void>();

  public readonly isOpen = signal<boolean>(false);
  public readonly searchTerm = signal<string>('');
  public readonly tempSelections = signal<any[]>([]);

  public readonly filteredOptions = computed(() => {
    const list = this.options();
    const search = this.searchTerm().toLowerCase().trim();
    if (!search) return list;
    return list.filter((opt) => opt.label.toLowerCase().includes(search));
  });

  public readonly isAllSelected = computed(() => {
    const opts = this.filteredOptions();
    const sel = this.tempSelections();
    return opts.length > 0 && opts.every((o) => sel.includes(o.value));
  });

  public readonly isFiltered = computed(() => {
    return this.selectedValues().length > 0;
  });

  public toggleOpen(event?: Event): void {
    if (event) event.stopPropagation();
    if (this.isOpen()) {
      this.close();
    } else {
      this.tempSelections.set([...this.selectedValues()]);
      this.isOpen.set(true);
    }
  }

  public close(): void {
    this.isOpen.set(false);
  }

  public isSelected(val: any): boolean {
    return this.tempSelections().includes(val);
  }

  public toggleOption(val: any): void {
    const current = this.tempSelections();
    if (current.includes(val)) {
      this.tempSelections.set(current.filter((v) => v !== val));
    } else {
      this.tempSelections.set([...current, val]);
    }
  }

  public toggleSelectAll(): void {
    if (this.isAllSelected()) {
      this.tempSelections.set([]);
    } else {
      this.tempSelections.set(this.options().map((o) => o.value));
    }
  }

  public apply(): void {
    this.filterChange.emit(this.tempSelections());
    this.close();
  }

  public reset(): void {
    this.tempSelections.set([]);
    this.clear.emit();
    this.close();
  }
}


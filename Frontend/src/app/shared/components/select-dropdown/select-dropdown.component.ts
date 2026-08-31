import { Component, HostListener, computed, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DropdownOption } from '../../../core/models/common/dropdown-option.model';

@Component({
  selector: 'app-select-dropdown',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './select-dropdown.component.html',
})
export class SelectDropdownComponent {
  public readonly label = input<string>('');
  public readonly options = input<DropdownOption[]>([]);
  public readonly selectedValue = input<any>(null);
  public readonly placeholder = input<string>('-- Select Option --');
  public readonly icon = input<string>('📌');
  public readonly required = input<boolean>(false);

  public readonly selectionChange = output<any>();

  public readonly isOpen = signal<boolean>(false);

  public readonly selectedOption = computed(() => {
    const val = this.selectedValue();
    return this.options().find((o) => o.value === val) || null;
  });

  public toggleOpen(event?: Event): void {
    if (event) event.stopPropagation();
    this.isOpen.set(!this.isOpen());
  }

  public selectOption(opt: DropdownOption, event?: Event): void {
    if (event) event.stopPropagation();
    this.selectionChange.emit(opt.value);
    this.isOpen.set(false);
  }

  @HostListener('document:click')
  public closeOnOutsideClick(): void {
    this.isOpen.set(false);
  }
}

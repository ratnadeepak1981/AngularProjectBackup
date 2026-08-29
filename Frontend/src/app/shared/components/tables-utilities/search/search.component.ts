import { Component, effect, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search.component.html',
  styleUrl: './search.component.css',
})
export class SearchComponent {
  public readonly placeholder = input<string>('Search records...');
  public readonly value = input<string>('');
  public readonly debounceMs = input<number>(300);

  public readonly searchChange = output<string>();
  public readonly clear = output<void>();

  public readonly searchTerm = signal<string>('');
  private debounceTimer: any = null;

  constructor() {
    effect(() => {
      this.searchTerm.set(this.value());
    });
  }

  public onInput(val: string): void {
    this.searchTerm.set(val);
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    this.debounceTimer = setTimeout(() => {
      this.searchChange.emit(val.trim());
    }, this.debounceMs());
  }

  public onClear(): void {
    this.searchTerm.set('');
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    this.searchChange.emit('');
    this.clear.emit();
  }
}


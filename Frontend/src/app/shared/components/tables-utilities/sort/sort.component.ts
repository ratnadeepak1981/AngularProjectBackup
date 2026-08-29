import { Component, computed, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sort',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sort.component.html',
  styleUrl: './sort.component.css',
})
export class SortComponent {
  public readonly column = input<string>('');
  public readonly activeColumn = input<string | null>(null);
  public readonly direction = input<'asc' | 'desc' | null>(null);
  public readonly label = input<string>('');

  public readonly sortChange = output<{ column: string; direction: 'asc' | 'desc' | null }>();

  public readonly isActive = computed(() => {
    return this.activeColumn() === this.column() && this.direction() !== null;
  });

  public toggleSort(): void {
    const col = this.column();
    let nextDir: 'asc' | 'desc' | null = 'asc';

    if (this.activeColumn() === col) {
      if (this.direction() === 'asc') {
        nextDir = 'desc';
      } else if (this.direction() === 'desc') {
        nextDir = null;
      }
    }

    this.sortChange.emit({
      column: col,
      direction: nextDir,
    });
  }
}


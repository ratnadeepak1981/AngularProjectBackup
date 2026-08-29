import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-amount-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './amount-card.component.html',
  styleUrl: './amount-card.component.css',
})
export class AmountCardComponent {
  title = input.required<string>();
  amount = input<string | number>('$0.00');
  icon = input<string>('💳');
  variant = input<'amber' | 'emerald' | 'blue' | 'rose' | 'purple'>('amber');
  isLoading = input<boolean>(false);

  getIconBadgeClass(): string {
    switch (this.variant()) {
      case 'emerald':
        return 'bg-emerald-100/90 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800';
      case 'blue':
        return 'bg-blue-100/90 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-800';
      case 'rose':
        return 'bg-rose-100/90 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300 border border-rose-200 dark:border-rose-800';
      case 'purple':
        return 'bg-purple-100/90 dark:bg-purple-950/60 text-purple-600 dark:text-purple-300 border border-purple-200 dark:border-purple-800';
      case 'amber':
      default:
        return 'bg-amber-100/90 dark:bg-amber-950/60 text-amber-600 dark:text-amber-300 border border-amber-200 dark:border-amber-800';
    }
  }

  getValueColorClass(): string {
    switch (this.variant()) {
      case 'emerald':
        return 'text-emerald-600 dark:text-emerald-400';
      case 'blue':
        return 'text-blue-600 dark:text-blue-400';
      case 'rose':
        return 'text-rose-600 dark:text-rose-400';
      case 'purple':
        return 'text-purple-600 dark:text-purple-400';
      case 'amber':
      default:
        return 'text-amber-600 dark:text-amber-400';
    }
  }
}

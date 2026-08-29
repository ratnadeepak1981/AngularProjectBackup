import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard-card.component.html',
  styleUrl: './dashboard-card.component.css',
})
export class DashboardCardComponent {
  title = input.required<string>();
  value = input<string | number>('');
  icon = input<string>('📊');
  iconVariant = input<'amber' | 'rose' | 'blue' | 'emerald' | 'purple' | 'slate'>('blue');
  valueVariant = input<'amber' | 'rose' | 'blue' | 'emerald' | 'purple' | 'slate'>('blue');
  linkText = input<string>('');
  linkRoute = input<string>('');
  isLoading = input<boolean>(false);

  getIconBadgeClass(): string {
    switch (this.iconVariant()) {
      case 'amber':
        return 'bg-amber-100/90 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200/80 dark:border-amber-800/80';
      case 'rose':
        return 'bg-rose-100/90 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200/80 dark:border-rose-800/80';
      case 'emerald':
        return 'bg-emerald-100/90 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/80';
      case 'purple':
        return 'bg-purple-100/90 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-200/80 dark:border-purple-800/80';
      case 'slate':
        return 'bg-slate-100/90 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-slate-700/80';
      case 'blue':
      default:
        return 'bg-blue-100/90 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-800/80';
    }
  }

  getValueColorClass(): string {
    switch (this.valueVariant()) {
      case 'amber':
        return 'text-amber-600 dark:text-amber-400';
      case 'rose':
        return 'text-rose-600 dark:text-rose-400';
      case 'emerald':
        return 'text-emerald-600 dark:text-emerald-400';
      case 'purple':
        return 'text-purple-600 dark:text-purple-400';
      case 'slate':
        return 'text-slate-800 dark:text-slate-100';
      case 'blue':
      default:
        return 'text-blue-600 dark:text-blue-400';
    }
  }
}


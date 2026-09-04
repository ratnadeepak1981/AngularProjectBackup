import { Directive, HostBinding, Input } from '@angular/core';

@Directive({
  selector: '[appStatusColor]',
  standalone: true
})
export class AppStatusColorDirective {
  @Input('appStatusColor') status: string | undefined | null;

  @HostBinding('class')
  get statusClass(): string {
    const val = (this.status || '').toLowerCase();
    switch (val) {
      case 'approved':
      case 'resolved':
      case 'paid':
        return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
      case 'pending':
      case 'in progress':
        return 'bg-amber-100 text-amber-800 border border-amber-200';
      case 'rejected':
      case 'cancelled':
      case 'failed':
        return 'bg-red-100 text-red-800 border border-red-200';
      case 'room assigned':
      case 'ready for collection':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  }
}

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'statusLabel',
  standalone: true
})
export class StatusLabelPipe implements PipeTransform {
  transform(value: string | undefined | null): string {
    if (!value) return 'Unknown';
    const trimmed = String(value).trim();
    if (!trimmed) return 'Unknown';

    // Replace underscores and hyphens with space
    let text = trimmed.replace(/[_-]+/g, ' ');

    // If text is ALL CAPS (e.g. "APPROVED", "PENDING REVIEW")
    if (text === text.toUpperCase() && text !== text.toLowerCase()) {
      text = text.toLowerCase();
    }

    // Split camelCase and PascalCase boundaries (e.g. "AccountRegistered" -> "Account Registered")
    const formatted = text.replace(/([a-z0-9])([A-Z])/g, '$1 $2').trim();

    // Capitalize each word properly
    return formatted
      .split(' ')
      .filter(Boolean)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}

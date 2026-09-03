import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'shortText',
  standalone: true,
})
export class ShortTextPipe implements PipeTransform {
  transform(value: string | null | undefined, limit: number = 50, suffix: string = '...'): string {
    if (!value) return '';
    if (value.length <= limit) return value;
    return value.substring(0, limit).trim() + suffix;
  }
}

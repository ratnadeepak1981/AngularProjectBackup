import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeRange',
  standalone: true
})
export class TimeRangePipe implements PipeTransform {
  transform(startTime: string | Date | undefined, endTime: string | Date | undefined): string {
    if (!startTime || !endTime) return '';
    
    const formatTime = (time: string | Date) => {
      const date = new Date(time);
      if (isNaN(date.getTime())) {
        // Fallback for times provided as strings like "14:00" or "14:00:00"
        return time.toString(); 
      }
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    };

    return `${formatTime(startTime)} - ${formatTime(endTime)}`;
  }
}

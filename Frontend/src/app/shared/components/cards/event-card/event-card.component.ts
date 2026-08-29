import { Component, computed, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventCardModel } from '../models/event-card.model';

@Component({
  selector: 'app-event-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './event-card.component.html',
  styleUrl: './event-card.component.css',
})
export class EventCardComponent {
  public readonly event = input.required<EventCardModel>();
  public readonly isProcessing = input<boolean>(false);

  public readonly register = output<number>();
  public readonly cancel = output<number>();

  public readonly isRegistered = computed<boolean>(() => !!this.event().isRegistered);
  
  public readonly isFull = computed<boolean>(() => {
    const e = this.event();
    return !this.isRegistered() && e.capacity > 0 && e.registeredCount >= e.capacity;
  });

  public readonly canCancel = computed<boolean>(() => {
    const e = this.event();
    if (!e.startDateTime) return true;
    try {
      const startDate = new Date(e.startDateTime);
      return new Date() < startDate;
    } catch {
      return true;
    }
  });

  public readonly formattedStart = computed<string>(() => {
    const s = this.event().startDateTime;
    if (!s) return 'N/A';
    try {
      return new Date(s).toLocaleString([], {
        month: 'numeric',
        day: 'numeric',
        year: '2-digit',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return s;
    }
  });

  public readonly formattedEnd = computed<string>(() => {
    const e = this.event().endDateTime;
    if (!e) return 'N/A';
    try {
      return new Date(e).toLocaleString([], {
        month: 'numeric',
        day: 'numeric',
        year: '2-digit',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return e;
    }
  });

  public readonly seatPercentage = computed<number>(() => {
    const e = this.event();
    if (!e.capacity || e.capacity <= 0) return 0;
    return Math.min(100, Math.round((e.registeredCount / e.capacity) * 100));
  });

  onRegisterClick(): void {
    if (!this.isProcessing() && !this.isFull() && !this.isRegistered()) {
      this.register.emit(this.event().id);
    }
  }

  onCancelClick(): void {
    if (!this.isProcessing() && this.isRegistered() && this.canCancel()) {
      this.cancel.emit(this.event().id);
    }
  }
}

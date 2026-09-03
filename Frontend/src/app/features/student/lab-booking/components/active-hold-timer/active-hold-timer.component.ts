import { Component, OnDestroy, OnInit, input, output, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActionButtonComponent } from '../../../../../shared/components/action-button/action-button.component';
import { StatusBadgeComponent } from '../../../../../shared/components/status-badge/status-badge.component';
import { LabBooking } from '../../../../../core/models/lab/lab-booking.model';

@Component({
  selector: 'app-active-hold-timer',
  standalone: true,
  imports: [CommonModule, ActionButtonComponent, StatusBadgeComponent],
  templateUrl: './active-hold-timer.component.html',
  styleUrl: './active-hold-timer.component.css',
})
export class ActiveHoldTimerComponent implements OnInit, OnDestroy {
  public readonly activeBooking = input<LabBooking | null>(null);
  public readonly holdMinutes = input<number>(10);
  public readonly isSubmitting = input<boolean>(false);

  public readonly remainingSeconds = signal<number>(600);
  public readonly formattedTime = signal<string>('10:00');

  public readonly confirm = output<void>();
  public readonly releaseClick = output<void>();
  public readonly holdExpired = output<void>();

  private timerInterval: any = null;

  constructor() {
    effect(() => {
      const booking = this.activeBooking();
      if (booking) {
        this.startTimer();
      }
    });
  }

  ngOnInit(): void {
    this.startTimer();
  }

  ngOnDestroy(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  private startTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    const booking = this.activeBooking();
    if (booking?.expiresAt) {
      const iso = booking.expiresAt.endsWith('Z') ? booking.expiresAt : `${booking.expiresAt}Z`;
      const expTime = new Date(iso).getTime();
      const now = new Date().getTime();
      const diffSec = Math.max(0, Math.floor((expTime - now) / 1000));
      this.remainingSeconds.set(diffSec);
    } else {
      this.remainingSeconds.set(this.holdMinutes() * 60);
    }

    this.updateFormattedTime();

    if (this.remainingSeconds() <= 0) {
      this.holdExpired.emit();
      return;
    }

    this.timerInterval = setInterval(() => {
      const current = this.remainingSeconds();
      if (current <= 1) {
        this.remainingSeconds.set(0);
        this.updateFormattedTime();
        clearInterval(this.timerInterval);
        this.holdExpired.emit();
      } else {
        this.remainingSeconds.set(current - 1);
        this.updateFormattedTime();
      }
    }, 1000);
  }

  private updateFormattedTime(): void {
    const sec = this.remainingSeconds();
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    const str = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    this.formattedTime.set(str);
  }

  public onConfirmClick(): void {
    this.confirm.emit();
  }

  public onCancelClick(): void {
    this.releaseClick.emit();
  }
}

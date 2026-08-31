import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LabSeat } from '../../../../core/models/lab/lab-seat.model';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';
import { ActionButtonComponent } from '../../../../shared/components/action-button/action-button.component';
import { ConfirmModalComponent } from '../../../../shared/components/dialogs/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-lab-grid-matrix',
  standalone: true,
  imports: [CommonModule, FormsModule, StatusBadgeComponent, ActionButtonComponent, ConfirmModalComponent],
  templateUrl: './lab-grid-matrix.component.html',
  styleUrl: './lab-grid-matrix.component.css',
})
export class LabGridMatrixComponent {
  @Input() labId: number = 1;
  @Input() labName: string = 'Campus Laboratory';
  @Input() totalRows: number = 4;
  @Input() totalCols: number = 3;
  @Input() seats: LabSeat[] = [];
  @Input() isModal: boolean = false;
  @Input() isStudent: boolean = false;

  @Output() seatAdded = new EventEmitter<{ seatNumber: string; row: number; col: number }>();
  @Output() seatRemoved = new EventEmitter<number>();
  @Output() closeModal = new EventEmitter<void>();
  @Output() seatSelected = new EventEmitter<LabSeat>();

  // Confirmation Modal Signals
  public readonly isAddConfirmOpen = signal(false);
  public readonly selectedCell = signal<{ row: number; col: number } | null>(null);
  public readonly pendingSeatNumber = signal<string>('');

  public readonly isRemoveConfirmOpen = signal(false);
  public readonly selectedSeatToRemove = signal<LabSeat | null>(null);

  /**
   * Helper array for 1-indexed row loop (1..totalRows)
   */
  get rowsArray(): number[] {
    return Array.from({ length: Math.max(1, this.totalRows) }, (_, i) => i + 1);
  }

  /**
   * Helper array for 1-indexed col loop (1..totalCols)
   */
  get colsArray(): number[] {
    return Array.from({ length: Math.max(1, this.totalCols) }, (_, i) => i + 1);
  }

  /**
   * Get seat object located at 1-indexed (row, col)
   */
  getSeatAt(row: number, col: number): LabSeat | undefined {
    return this.seats.find((s) => s.rowIndex === row && s.columnIndex === col);
  }

  /**
   * Cell Click Handler for 1-indexed Address (row, col)
   */
  onCellClick(row: number, col: number): void {
    if (this.isStudent) return; // In Student mode, blank cell creation is disabled

    const existingSeat = this.getSeatAt(row, col);
    if (existingSeat) {
      // Seat already exists at this address
      return;
    }

    // Open confirmation modal for blank cell placement
    this.selectedCell.set({ row, col });
    this.pendingSeatNumber.set(`LAB${this.labId}-PC-R${row}C${col}`);
    this.isAddConfirmOpen.set(true);
  }

  onStudentSeatClick(seat: LabSeat): void {
    if (this.isStudent && seat.status === 'Available' && !seat.isBroken) {
      this.seatSelected.emit(seat);
    }
  }

  confirmAddSeat(): void {
    const cell = this.selectedCell();
    const seatNum = this.pendingSeatNumber().trim();
    if (cell && seatNum) {
      this.seatAdded.emit({
        seatNumber: seatNum,
        row: cell.row,
        col: cell.col,
      });
    }
    this.closeAddModal();
  }

  closeAddModal(): void {
    this.isAddConfirmOpen.set(false);
    this.selectedCell.set(null);
  }

  promptRemoveSeat(seat: LabSeat, event: Event): void {
    event.stopPropagation();
    this.selectedSeatToRemove.set(seat);
    this.isRemoveConfirmOpen.set(true);
  }

  confirmRemoveSeat(): void {
    const seat = this.selectedSeatToRemove();
    if (seat) {
      this.seatRemoved.emit(seat.id);
    }
    this.closeRemoveModal();
  }

  closeRemoveModal(): void {
    this.isRemoveConfirmOpen.set(false);
    this.selectedSeatToRemove.set(null);
  }
}

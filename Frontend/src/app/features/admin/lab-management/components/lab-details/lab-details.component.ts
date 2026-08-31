import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Lab } from '../../../../../core/models/lab/lab.model';
import { StatusBadgeComponent } from '../../../../../shared/components/status-badge/status-badge.component';
import { ActionButtonComponent } from '../../../../../shared/components/action-button/action-button.component';

@Component({
  selector: 'app-lab-details',
  standalone: true,
  imports: [CommonModule, FormsModule, StatusBadgeComponent, ActionButtonComponent],
  templateUrl: './lab-details.component.html',
  styleUrl: './lab-details.component.css',
})
export class LabDetailsComponent {
  @Input() lab: Lab | null = null;
  @Input() isModal: boolean = false;
  @Output() inspectLayout = new EventEmitter<Lab>();
  @Output() closeModal = new EventEmitter<void>();
  @Output() createLabSubmitted = new EventEmitter<{ name: string; labType: string; capacity: number; totalRows: number; totalColumns: number }>();

  // Create Lab Modal Signal
  public readonly isCreateModalOpen = signal(false);
  public readonly newLabName = signal('');
  public readonly newLabType = signal<'Computer' | 'Science'>('Computer');
  public readonly newLabCapacity = signal(24);
  public readonly newLabRows = signal(4);
  public readonly newLabCols = signal(3);

  openCreateModal(): void {
    this.newLabName.set('');
    this.newLabType.set('Computer');
    this.newLabRows.set(4);
    this.newLabCols.set(6);
    this.newLabCapacity.set(24);
    this.isCreateModalOpen.set(true);
  }

  onRowsColsChange(rows: number, cols: number): void {
    this.newLabRows.set(rows);
    this.newLabCols.set(cols);
    if (this.newLabType() === 'Computer') {
      this.newLabCapacity.set((rows || 0) * (cols || 0));
    }
  }

  onLabTypeChange(type: 'Computer' | 'Science'): void {
    this.newLabType.set(type);
    if (type === 'Computer') {
      this.newLabCapacity.set(this.newLabRows() * this.newLabCols());
    }
  }

  closeCreateModal(): void {
    this.isCreateModalOpen.set(false);
  }

  submitCreate(): void {
    const name = this.newLabName().trim();
    if (!name || this.newLabCapacity() <= 0) return;

    this.createLabSubmitted.emit({
      name,
      labType: this.newLabType(),
      capacity: this.newLabCapacity(),
      totalRows: this.newLabRows(),
      totalColumns: this.newLabCols(),
    });

    this.closeCreateModal();
  }
}

import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HostelBuilding, HostelManagementService, HousingApplication } from '../../services/hostel-management.service';
import { ToastService } from '../../../../../core/services/toast.service';

export interface VacantRoomOption {
  id: number;
  roomNumber: string;
  hostelName: string;
  maxCapacity: number;
  balanceCapacity: number;
  isCurrent?: boolean;
}

@Component({
  selector: 'app-assign-room-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './assign-room-modal.component.html',
  styleUrl: './assign-room-modal.component.css',
})
export class AssignRoomModalComponent implements OnChanges {
  private readonly hostelService = inject(HostelManagementService);
  private readonly toast = inject(ToastService);

  @Input() isOpen = false;
  @Input() application: HousingApplication | null = null;
  @Input() hostels: HostelBuilding[] = [];

  @Output() close = new EventEmitter<void>();
  @Output() assigned = new EventEmitter<void>();

  public readonly vacantRooms = signal<VacantRoomOption[]>([]);
  public readonly selectedRoomId = signal<number>(0);
  public readonly isSubmitting = signal<boolean>(false);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['application'] || changes['isOpen'] || changes['hostels']) {
      if (this.isOpen && this.application) {
        this.computeVacantRooms();
      }
    }
  }

  computeVacantRooms(): void {
    const app = this.application;
    if (!app) return;

    const targetHostelName = (app.preferredHostelName || '').toLowerCase().trim();
    const vacant: VacantRoomOption[] = [];
    let initialSelectedRoomId = app.assignedRoomId || 0;

    this.hostels.forEach((h) => {
      const hName = h.name.toLowerCase().trim();
      if (!targetHostelName || hName === targetHostelName || hName.includes(targetHostelName) || targetHostelName.includes(hName)) {
        if (h.rooms) {
          h.rooms.forEach((r) => {
            const maxCap = r.maxCapacity || 0;
            const occ = r.currentOccupancy ?? (r as any).CurrentOccupancy ?? 0;
            const bal = maxCap - occ;
            const isCurrentlyAssigned = (app.assignedRoomId && r.id === app.assignedRoomId) ||
              (app.assignedRoomNumber && r.roomNumber === app.assignedRoomNumber);

            if (isCurrentlyAssigned) {
              initialSelectedRoomId = r.id;
            }

            if (bal > 0 || isCurrentlyAssigned) {
              vacant.push({
                id: r.id,
                roomNumber: r.roomNumber,
                hostelName: h.name,
                maxCapacity: maxCap,
                balanceCapacity: bal,
                isCurrent: !!isCurrentlyAssigned,
              });
            }
          });
        }
      }
    });

    this.vacantRooms.set(vacant);
    this.selectedRoomId.set(initialSelectedRoomId > 0 ? initialSelectedRoomId : (vacant[0]?.id || 0));
  }

  onClose(): void {
    this.selectedRoomId.set(0);
    this.close.emit();
  }

  onSubmit(): void {
    const app = this.application;
    const roomId = this.selectedRoomId();
    if (!app || roomId === 0) return;

    this.isSubmitting.set(true);
    this.hostelService.assignRoom(app.id, roomId).subscribe({
      next: () => {
        this.toast.success(`Room assigned to ${app.studentName} successfully.`);
        this.isSubmitting.set(false);
        this.onClose();
        this.assigned.emit();
      },
      error: (err: any) => {
        this.toast.error(err?.error?.message || 'Failed to assign room.');
        this.isSubmitting.set(false);
      },
    });
  }
}

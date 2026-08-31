import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataTableComponent } from '../../../../../shared/components/data-table/data-table.component';
import { TableColumn } from '../../../../../shared/components/data-table/models/table-column.model';
import { LabBookingRecord } from '../../services/lab-management.service';

@Component({
  selector: 'app-lab-bookings-history',
  standalone: true,
  imports: [CommonModule, DataTableComponent],
  templateUrl: './lab-bookings-history.component.html',
  styleUrl: './lab-bookings-history.component.css',
})
export class LabBookingsHistoryComponent {
  @Input() bookings: LabBookingRecord[] = [];
  @Input() loading: boolean = false;

  public readonly columns: TableColumn[] = [
    { key: 'id', header: 'Booking Ref', sortable: true, filterable: true, type: 'text' },
    { key: 'labName', header: 'Campus Laboratory', sortable: true, filterable: true, type: 'text' },
    { key: 'studentName', header: 'Student Name', sortable: true, filterable: true, type: 'text' },
    { key: 'seatNumber', header: 'Station / Seat ID', sortable: true, filterable: true, type: 'text' },
    { key: 'timeSlot', header: 'Reservation Slot', sortable: true, filterable: true, type: 'text' },
    { key: 'status', header: 'Reservation Status', sortable: true, filterable: true, type: 'badge' },
    { key: 'createdAt', header: 'Created Date', sortable: true, filterable: false, type: 'text' },
  ];
}

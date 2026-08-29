import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FeePaymentItem } from '../../services/admin-billing';
import { DataTableComponent } from '../../../../../shared/components/data-table/data-table.component';
import { TableColumn } from '../../../../../shared/components/data-table/models/table-column.model';

@Component({
  selector: 'app-fee-assignments-list',
  standalone: true,
  imports: [CommonModule, FormsModule, DataTableComponent],
  templateUrl: './fee-assignments-list.component.html',
  styleUrl: './fee-assignments-list.component.css',
})
export class FeeAssignmentsListComponent implements OnChanges {
  @Input() ledgerItems: FeePaymentItem[] = [];
  @Input() isLoading = false;
  @Input() totalRecords = 0;
  @Input() currentPage = 1;
  @Input() pageSize = 5;

  @Output() cancelUnpaid = new EventEmitter<FeePaymentItem>();
  @Output() refresh = new EventEmitter<void>();
  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();

  public readonly inputLedgerSignal = signal<FeePaymentItem[]>([]);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['ledgerItems']) {
      this.inputLedgerSignal.set(this.ledgerItems || []);
    }
  }

  public readonly columns: TableColumn<any>[] = [
    { key: 'studentInfo', header: 'Student Name / Index', sortable: true, filterable: true },
    { key: 'feeTypeName', header: 'Fee Description', sortable: true, filterable: true },
    { key: 'formattedAmount', header: 'Amount', sortable: true, filterable: true },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      filterable: true,
      type: 'badge',
      badgeMap: {
        PAID: {
          label: '✓ PAID',
          class: 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700',
        },
        Paid: {
          label: '✓ PAID',
          class: 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700',
        },
        OUTSTANDING: {
          label: '⏳ OUTSTANDING',
          class: 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-700',
        },
        UNPAID: {
          label: '⏳ OUTSTANDING',
          class: 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-700',
        },
        Unpaid: {
          label: '⏳ OUTSTANDING',
          class: 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-700',
        },
      },
    },
    { key: 'receiptInfo', header: 'Receipt / Date', sortable: true, filterable: true },
    { key: 'actions', header: 'Actions', sortable: false, filterable: false, type: 'actions', align: 'right' },
  ];

  public readonly displayItems = computed(() => {
    return (this.inputLedgerSignal() || []).map((i) => {
      const sName = i.studentName || (i as any).StudentName || (i as any).student?.fullName || 'Student';
      const sIndex = i.studentIndexNumber || (i as any).StudentIndexNumber || (i as any).student?.indexNumber || 'N/A';
      const desc = i.feeTypeName || i.description || (i as any).FeeTypeName || 'Fee';
      const amt = Number(i.amount) || 0;
      const statusRaw = (i.status || 'UNPAID').toUpperCase();

      let receipt = 'Unpaid';
      if (statusRaw === 'PAID') {
        const recNo = i.receiptNumber || 'REC';
        const pDate = i.paidAt ? new Date(i.paidAt).toLocaleDateString() : '';
        receipt = `Receipt #${recNo} ${pDate ? '(' + pDate + ')' : ''}`;
      }

      return {
        ...i,
        studentInfo: `${sName} (${sIndex})`,
        feeTypeName: desc,
        formattedAmount: `$${amt.toFixed(2)}`,
        status: statusRaw === 'PAID' ? 'PAID' : 'OUTSTANDING',
        isPaid: statusRaw === 'PAID',
        receiptInfo: receipt,
      };
    });
  });
}

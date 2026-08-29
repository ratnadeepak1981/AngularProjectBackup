import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FeePaymentItem } from '../../services/student-billing.service';
import { DataTableComponent } from '../../../../../shared/components/data-table/data-table.component';
import { TableColumn } from '../../../../../shared/components/data-table/models/table-column.model';

@Component({
  selector: 'app-bill-ledger-list',
  standalone: true,
  imports: [CommonModule, FormsModule, DataTableComponent],
  templateUrl: './bill-ledger-list.component.html',
  styleUrl: './bill-ledger-list.component.css',
})
export class BillLedgerListComponent implements OnChanges {
  @Input() ledgerItems: FeePaymentItem[] = [];
  @Input() isLoading = false;

  @Output() payOnline = new EventEmitter<FeePaymentItem>();
  @Output() viewReceipt = new EventEmitter<FeePaymentItem>();
  @Output() refresh = new EventEmitter<void>();

  public readonly inputLedgerSignal = signal<FeePaymentItem[]>([]);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['ledgerItems']) {
      this.inputLedgerSignal.set(this.ledgerItems || []);
    }
  }

  public readonly columns: TableColumn<any>[] = [
    { key: 'feeTypeName', header: 'Fee / Fine Description', sortable: true, filterable: true },
    { key: 'formattedAmount', header: 'Amount', sortable: true, filterable: true },
    { key: 'dueDateText', header: 'Due Date', sortable: true, filterable: true },
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
    { key: 'receiptInfo', header: 'Receipt / Paid Date', sortable: true, filterable: true },
    { key: 'actions', header: 'Action', sortable: false, filterable: false, type: 'actions', align: 'right' },
  ];

  public readonly displayItems = computed(() => {
    return (this.inputLedgerSignal() || []).map((i) => {
      const desc = i.feeTypeName || i.description || (i as any).FeeTypeName || 'Fee';
      const amt = Number(i.amount) || 0;
      const statusRaw = (i.status || 'UNPAID').toUpperCase();

      let receipt = '-';
      if (statusRaw === 'PAID') {
        const recNo = i.receiptNumber || 'REC';
        const pDate = i.paidAt ? new Date(i.paidAt).toLocaleDateString() : '';
        receipt = `Receipt #${recNo} ${pDate ? '(' + pDate + ')' : ''}`;
      }

      const dDate = i.dueDate ? new Date(i.dueDate).toLocaleDateString() : 'N/A';

      return {
        ...i,
        feeTypeName: desc,
        formattedAmount: `$${amt.toFixed(2)}`,
        dueDateText: dDate,
        status: statusRaw === 'PAID' ? 'PAID' : 'OUTSTANDING',
        isPaid: statusRaw === 'PAID',
        receiptInfo: receipt,
      };
    });
  });
}

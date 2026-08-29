import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { StudentBillingService, FeePaymentItem } from '../services/student-billing.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ToastService } from '../../../../core/services/toast.service';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { AmountCardComponent } from '../../../../shared/components/cards/amount-card/amount-card.component';
import { BillLedgerListComponent } from '../components/bill-ledger-list/bill-ledger-list.component';

@Component({
  selector: 'app-student-billing-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    PageHeaderComponent,
    AmountCardComponent,
    BillLedgerListComponent,
  ],
  templateUrl: './student-billing-page.component.html',
  styleUrl: './student-billing-page.component.css',
})
export class StudentBillingPageComponent implements OnInit {
  private readonly billingService = inject(StudentBillingService);
  public readonly authService = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  public readonly ledgerItems = signal<FeePaymentItem[]>([]);
  public readonly isLoadingLedger = signal<boolean>(false);

  // Official Bursar Receipt Modal Signals
  public readonly selectedReceiptItem = signal<FeePaymentItem | null>(null);
  public readonly isReceiptModalOpen = signal<boolean>(false);

  // Reusable AmountCard Metric Signals
  public readonly totalOutstandingFormatted = computed(() => {
    const total = (this.ledgerItems() || [])
      .filter((i) => (i.status || '').toLowerCase() !== 'paid')
      .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    return `$${total.toFixed(2)}`;
  });

  public readonly totalPaidFormatted = computed(() => {
    const total = (this.ledgerItems() || [])
      .filter((i) => (i.status || '').toLowerCase() === 'paid')
      .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    return `$${total.toFixed(2)}`;
  });

  ngOnInit(): void {
    this.loadLedger();
  }

  loadLedger(): void {
    this.isLoadingLedger.set(true);
    this.billingService.getStudentLedger().subscribe({
      next: (res) => {
        const payload = res?.data || res || [];
        const items: FeePaymentItem[] = Array.isArray(payload) ? payload : (payload.items || payload.Items || []);
        this.ledgerItems.set(items);
        this.isLoadingLedger.set(false);
      },
      error: () => {
        this.toast.error('Failed to load your student fee ledger statement.');
        this.isLoadingLedger.set(false);
      },
    });
  }

  onPayOnline(item: FeePaymentItem): void {
    this.router.navigate(['/student/billing/checkout', item.id]);
  }

  onViewReceipt(item: FeePaymentItem): void {
    this.selectedReceiptItem.set(item);
    this.isReceiptModalOpen.set(true);
  }

  closeReceiptModal(): void {
    this.isReceiptModalOpen.set(false);
    this.selectedReceiptItem.set(null);
  }

  printReceipt(): void {
    window.print();
  }
}

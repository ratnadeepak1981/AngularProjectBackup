import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { StudentBillingService, FeePaymentItem } from '../services/student-billing.service';
import { SystemSettingsService } from '../../../admin/system-settings/services/system-settings.service';
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
  private readonly systemSettingsService = inject(SystemSettingsService);
  public readonly authService = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  public readonly ledgerItems = signal<FeePaymentItem[]>([]);
  public readonly isLoadingLedger = signal<boolean>(false);
  public readonly totalOutstandingFormatted = signal<string>('$0.00');
  public readonly totalPaidFormatted = signal<string>('$0.00');
  public readonly institutionName = signal<string>('University of Knowledge (UOK)');

  // Official Bursar Receipt Modal Signals
  public readonly selectedReceiptItem = signal<FeePaymentItem | null>(null);
  public readonly isReceiptModalOpen = signal<boolean>(false);

  ngOnInit(): void {
    this.loadLedger();
  }

  loadLedger(): void {
    this.isLoadingLedger.set(true);

    // Fetch dynamic institution name from System Settings
    this.systemSettingsService.getAllSettings().subscribe({
      next: (res) => {
        if (res.data && res.data['InstitutionName']) {
          this.institutionName.set(res.data['InstitutionName']);
        }
      },
    });

    this.billingService.getFormattedLedger().subscribe({
      next: (summary) => {
        this.ledgerItems.set(summary.items);
        this.totalOutstandingFormatted.set(summary.outstandingFormatted);
        this.totalPaidFormatted.set(summary.paidFormatted);
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

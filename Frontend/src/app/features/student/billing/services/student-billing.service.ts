import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from '../../../../core/services/api.service';
import { FeePaymentItem } from '../../../../core/models/billing/fee-payment-item.model';

export type { FeePaymentItem };

export interface StudentLedgerSummary {
  items: FeePaymentItem[];
  outstandingFormatted: string;
  paidFormatted: string;
}

@Injectable({
  providedIn: 'root',
})
export class StudentBillingService {
  private readonly apiService = inject(ApiService);

  getStudentLedger(): Observable<any> {
    return this.apiService.get<any>(this.apiService.routes.billing.ledger);
  }

  getFormattedLedger(): Observable<StudentLedgerSummary> {
    return this.getStudentLedger().pipe(
      map((res) => {
        const payload = res?.data || res || [];
        const items: FeePaymentItem[] = Array.isArray(payload) ? payload : (payload.items || payload.Items || []);

        const outstanding = items
          .filter((i) => (i.status || '').toLowerCase() !== 'paid')
          .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

        const paid = items
          .filter((i) => (i.status || '').toLowerCase() === 'paid')
          .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

        return {
          items,
          outstandingFormatted: `$${outstanding.toFixed(2)}`,
          paidFormatted: `$${paid.toFixed(2)}`,
        };
      })
    );
  }

  getInvoiceDetails(invoiceId: number): Observable<FeePaymentItem | null> {
    return this.getStudentLedger().pipe(
      map((res) => {
        const payload = res?.data || res || [];
        const items: FeePaymentItem[] = Array.isArray(payload) ? payload : (payload.items || payload.Items || []);
        return items.find((i) => i.id === invoiceId) || null;
      })
    );
  }

  payInvoice(id: number): Observable<any> {
    return this.apiService.post<any>(this.apiService.routes.billing.pay(id), {});
  }
}

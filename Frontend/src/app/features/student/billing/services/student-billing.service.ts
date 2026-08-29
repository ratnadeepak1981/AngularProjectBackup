import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../../core/services/api.service';
import { FeePaymentItem } from '../../../../core/models/billing/fee-payment-item.model';

export type { FeePaymentItem };

@Injectable({
  providedIn: 'root',
})
export class StudentBillingService {
  private readonly apiService = inject(ApiService);

  getStudentLedger(): Observable<any> {
    return this.apiService.get<any>(this.apiService.routes.billing.ledger);
  }

  payInvoice(id: number): Observable<any> {
    return this.apiService.post<any>(this.apiService.routes.billing.pay(id), {});
  }
}

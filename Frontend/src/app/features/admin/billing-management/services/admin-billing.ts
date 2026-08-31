import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../../core/services/api.service';
import { FeePaymentItem } from '../../../../core/models/billing/fee-payment-item.model';
import { FeeTypeItem } from '../../../../core/models/billing/fee-type-item.model';
import { AssignFeePayload } from '../../../../core/models/billing/assign-fee-payload.model';

export type { FeePaymentItem, FeeTypeItem, AssignFeePayload };

@Injectable({
  providedIn: 'root',
})
export class AdminBillingService {
  private readonly apiService = inject(ApiService);

  getFeeLedger(page: number = 1, size: number = 5): Observable<any> {
    return this.apiService.get<any>(this.apiService.routes.billing.ledger, {
      pageNumber: page,
      pageSize: size,
    });
  }

  getFeeTypes(): Observable<any> {
    return this.apiService.get<any>('/fee-types');
  }

  getStudentsDirectory(): Observable<any> {
    return this.apiService.get<any>(this.apiService.routes.students.directory);
  }

  searchStudents(search: string = '', faculty: string = '', page: number = 1, size: number = 10): Observable<any> {
    return this.apiService.get<any>(this.apiService.routes.students.directory, {
      search,
      faculty,
      pageNumber: page,
      pageSize: size,
    });
  }

  getFaculties(): Observable<any> {
    return this.apiService.get<any>('/faculties');
  }

  assignFee(payload: AssignFeePayload): Observable<any> {
    return this.apiService.post<any>('/billing/fees/assign', payload);
  }

  createFeeType(name: string): Observable<any> {
    return this.apiService.post<any>('/fee-types', { name });
  }

  deactivateFeeType(id: number): Observable<any> {
    return this.apiService.delete<any>(`/fee-types/${id}`);
  }

  toggleFeeTypeStatus(id: number): Observable<any> {
    return this.apiService.put<any>(`/fee-types/${id}/toggle-status`, {});
  }

  cancelUnpaidFee(id: number): Observable<any> {
    return this.apiService.delete<any>(`/billing/fee-payments/${id}`);
  }
}

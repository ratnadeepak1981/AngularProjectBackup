import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from '../../../../core/services/api.service';
import { FeePaymentItem } from '../../../../core/models/billing/fee-payment-item.model';
import { FeeTypeItem } from '../../../../core/models/billing/fee-type-item.model';
import { AssignFeePayload } from '../../../../core/models/billing/assign-fee-payload.model';

export type { FeePaymentItem, FeeTypeItem, AssignFeePayload };

export interface FormattedLedgerResponse {
  items: FeePaymentItem[];
  totalRecords: number;
}

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

  getFormattedFeeLedger(page: number = 1, size: number = 5): Observable<FormattedLedgerResponse> {
    return this.getFeeLedger(page, size).pipe(
      map((res) => {
        const payload = res?.data || res || {};
        const items: FeePaymentItem[] = Array.isArray(payload) ? payload : (payload.items || payload.Items || []);
        const total = payload.totalRecords || payload.totalCount || payload.totalItems || items.length;
        return { items, totalRecords: total };
      })
    );
  }

  getFeeTypes(): Observable<any> {
    return this.apiService.get<any>('/fee-types');
  }

  getFormattedFeeTypes(): Observable<FeeTypeItem[]> {
    return this.getFeeTypes().pipe(
      map((res) => {
        const payload = res?.data || res || [];
        const incoming: any[] = Array.isArray(payload) ? payload : (payload.items || payload.Items || []);
        
        const list: FeeTypeItem[] = incoming.map((item: any) => ({
          id: item.id || item.Id || 0,
          name: item.name || item.Name || 'Fee Type',
          isActive: item.isActive !== undefined ? item.isActive : (item.IsActive !== undefined ? item.IsActive : true),
        }));

        return list.length > 0 ? list : [
          { id: 1, name: 'Tuition Fee', isActive: true },
          { id: 2, name: 'Semester Fee', isActive: true },
          { id: 3, name: 'Exam Fee', isActive: true },
          { id: 4, name: 'Lab Fine', isActive: true },
        ];
      })
    );
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

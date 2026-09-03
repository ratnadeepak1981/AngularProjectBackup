import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from '../../../../core/services/api.service';
import { ApiResponse } from '../../../../core/models/common/api-response.model';
import { Complaint, ComplaintCategory, UpdateComplaintStatusDto } from '../../../../core/models/complaint/complaint.model';

@Injectable({
  providedIn: 'root',
})
export class ComplaintManagementService {
  private readonly api = inject(ApiService);

  getComplaints(status?: string): Observable<Complaint[]> {
    const params = status ? { status } : undefined;
    return this.api
      .get<ApiResponse<Complaint[]> | Complaint[]>('/complaints', params)
      .pipe(
        map((res: any) => {
          if (Array.isArray(res)) return res;
          return res?.data || res?.Data || [];
        })
      );
  }

  updateComplaintStatus(complaintId: number, dto: UpdateComplaintStatusDto): Observable<Complaint> {
    return this.api
      .put<ApiResponse<Complaint>>(`/complaints/${complaintId}/status`, dto)
      .pipe(
        map((res: any) => res?.data || res?.Data || res)
      );
  }

  getCategories(): Observable<ComplaintCategory[]> {
    return this.api
      .get<ApiResponse<ComplaintCategory[]> | ComplaintCategory[]>('/complaint-categories')
      .pipe(
        map((res: any) => {
          if (Array.isArray(res)) return res;
          return res?.data || res?.Data || [];
        })
      );
  }

  createCategory(name: string): Observable<ComplaintCategory> {
    return this.api
      .post<ApiResponse<ComplaintCategory>>('/complaint-categories', { name })
      .pipe(
        map((res: any) => res?.data || res?.Data || res)
      );
  }

  deleteCategory(id: number): Observable<boolean> {
    return this.api
      .delete<ApiResponse<any>>(`/complaint-categories/${id}`)
      .pipe(
        map(() => true)
      );
  }

  updateCategory(id: number, data: { name: string; isActive: boolean }): Observable<ComplaintCategory> {
    return this.api
      .put<ApiResponse<ComplaintCategory>>(`/complaint-categories/${id}`, data)
      .pipe(
        map((res: any) => res?.data || res?.Data || res)
      );
  }
}

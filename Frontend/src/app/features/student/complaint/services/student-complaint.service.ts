import { HttpContext } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from '../../../../core/services/api.service';
import { ApiResponse } from '../../../../core/models/common/api-response.model';
import { Complaint, ComplaintCategory, SubmitComplaintDto } from '../../../../core/models/complaint/complaint.model';
import { SKIP_GLOBAL_ERROR_TOAST } from '../../../../core/interceptors/error-interceptor';

@Injectable({
  providedIn: 'root',
})
export class StudentComplaintService {
  private readonly api = inject(ApiService);

  getMyComplaints(): Observable<Complaint[]> {
    return this.api
      .get<ApiResponse<Complaint[]> | Complaint[]>('/complaints/student')
      .pipe(
        map((res: any) => {
          if (Array.isArray(res)) return res;
          return res?.data || res?.Data || [];
        })
      );
  }

  submitComplaint(dto: SubmitComplaintDto): Observable<Complaint> {
    return this.api
      .post<ApiResponse<Complaint>>('/complaints', dto, {
        context: new HttpContext().set(SKIP_GLOBAL_ERROR_TOAST, true),
      })
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
          return (res?.data || res?.Data || []).filter((c: ComplaintCategory) => c.isActive);
        })
      );
  }
}

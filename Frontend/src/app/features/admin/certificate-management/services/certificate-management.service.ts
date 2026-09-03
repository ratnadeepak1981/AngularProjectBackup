import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from '../../../../core/services/api.service';
import { ApiResponse } from '../../../../core/models/common/api-response.model';
import { Certificate, CertificateType } from '../../../../core/models/certificate/certificate.model';

@Injectable({
  providedIn: 'root',
})
export class CertificateManagementService {
  private readonly api = inject(ApiService);

  getRequests(status?: string): Observable<Certificate[]> {
    const params = status ? { status } : undefined;
    return this.api
      .get<ApiResponse<Certificate[]> | Certificate[]>('/certificate-requests', params)
      .pipe(
        map((res: any) => {
          if (Array.isArray(res)) return res;
          return res?.data || res?.Data || [];
        })
      );
  }

  updateRequestStatus(requestId: number, status: string): Observable<Certificate> {
    return this.api
      .put<ApiResponse<Certificate>>(`/certificate-requests/${requestId}/status`, { status })
      .pipe(
        map((res: any) => res?.data || res?.Data || res)
      );
  }

  getCertificateTypes(): Observable<CertificateType[]> {
    return this.api
      .get<ApiResponse<CertificateType[]> | CertificateType[]>('/certificate-types')
      .pipe(
        map((res: any) => {
          if (Array.isArray(res)) return res;
          return res?.data || res?.Data || [];
        })
      );
  }

  createCertificateType(name: string): Observable<CertificateType> {
    return this.api
      .post<ApiResponse<CertificateType>>('/certificate-types', { name })
      .pipe(
        map((res: any) => res?.data || res?.Data || res)
      );
  }

  deleteCertificateType(id: number): Observable<boolean> {
    return this.api
      .delete<ApiResponse<any>>(`/certificate-types/${id}`)
      .pipe(
        map(() => true)
      );
  }

  updateCertificateType(id: number, data: { name: string; isActive: boolean }): Observable<CertificateType> {
    return this.api
      .put<ApiResponse<CertificateType>>(`/certificate-types/${id}`, data)
      .pipe(
        map((res: any) => res?.data || res?.Data || res)
      );
  }
}

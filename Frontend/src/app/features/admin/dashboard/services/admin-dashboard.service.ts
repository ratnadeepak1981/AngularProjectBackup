import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ApiService } from '../../../../core/services/api.service';

export interface AdminDashboardMetricsSummary {
  pendingHostels: number;
  pendingComplaints: number;
  pendingCertificates: number;
  totalStudents: number;
}

@Injectable({
  providedIn: 'root',
})
export class AdminDashboardService {
  private readonly apiService = inject(ApiService);

  getAdminDashboardMetrics(): Observable<AdminDashboardMetricsSummary> {
    const hostels$ = this.apiService.get<any>(this.apiService.routes.hostel.pendingApps).pipe(
      map((res) => {
        const payload = res?.data || res || {};
        return payload.totalRecords ?? payload.totalCount ?? (Array.isArray(payload) ? payload.length : (payload.items?.length || 0));
      }),
      catchError(() => of(0))
    );

    const complaints$ = this.apiService.get<any>(this.apiService.routes.complaints.adminList, { status: 'Pending' }).pipe(
      map((res) => {
        const payload = res?.data || res || {};
        return payload.totalRecords ?? payload.totalCount ?? (Array.isArray(payload) ? payload.length : (payload.items?.length || 0));
      }),
      catchError(() => of(0))
    );

    const certs$ = this.apiService.get<any>(this.apiService.routes.certificates.adminList, { status: 'Pending' }).pipe(
      map((res) => {
        const payload = res?.data || res || {};
        return payload.totalRecords ?? payload.totalCount ?? (Array.isArray(payload) ? payload.length : (payload.items?.length || 0));
      }),
      catchError(() => of(0))
    );

    const students$ = this.apiService.get<any>(this.apiService.routes.students.directory).pipe(
      map((res) => {
        const payload = res?.data || res || {};
        return payload.totalRecords ?? payload.totalCount ?? (Array.isArray(payload) ? payload.length : (payload.items?.length || 0));
      }),
      catchError(() => of(0))
    );

    return forkJoin({
      pendingHostels: hostels$,
      pendingComplaints: complaints$,
      pendingCertificates: certs$,
      totalStudents: students$,
    });
  }

  getHoldMinutes(): Observable<number> {
    return this.apiService.get<any>(this.apiService.routes.system.holdMinutes).pipe(
      map((res) => res?.data?.holdMinutes ?? res?.holdMinutes ?? 15),
      catchError(() => of(15))
    );
  }

  saveHoldMinutes(mins: number): Observable<any> {
    return this.apiService.put(this.apiService.routes.system.holdMinutes, { holdMinutes: mins });
  }

  getDefaultPageSize(): Observable<number> {
    return this.apiService.get<any>(this.apiService.routes.system.pageSize).pipe(
      map((res) => res?.data?.pageSize ?? res?.pageSize ?? 10),
      catchError(() => of(10))
    );
  }

  saveDefaultPageSize(size: number): Observable<any> {
    return this.apiService.put(this.apiService.routes.system.pageSize, { pageSize: size });
  }
}

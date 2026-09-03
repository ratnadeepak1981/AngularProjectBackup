import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from '../../../../core/services/api.service';
import { HostelApplication } from '../../../../core/models/hostel/hostel-application.model';

@Injectable({
  providedIn: 'root',
})
export class HostelApplicationService {
  private readonly apiService = inject(ApiService);

  getHostelsLookup(page: number = 1, size: number = 100): Observable<any> {
    return this.apiService.get<any>(this.apiService.routes.hostel.selectHostels, {
      pageNumber: page,
      pageSize: size,
    });
  }

  getFormattedHostelsLookup(page: number = 1, size: number = 100): Observable<any[]> {
    return this.getHostelsLookup(page, size).pipe(
      map((res) => {
        const payload = res?.data || res || {};
        return payload.items || payload.Items || (Array.isArray(payload) ? payload : []);
      })
    );
  }

  getMyApplications(): Observable<any> {
    return this.apiService.get<any>(this.apiService.routes.hostel.studentApps);
  }

  getMyFormattedApplications(): Observable<HostelApplication[]> {
    return this.getMyApplications().pipe(
      map((res) => {
        const payload = res?.data || res || [];
        const items: any[] = Array.isArray(payload) ? payload : (payload.items || payload.Items || []);
        return items.map((a: any) => ({
          id: a.id || a.Id,
          studentId: a.studentId || a.StudentId,
          preferredHostelId: a.preferredHostelId || a.PreferredHostelId || a.preferredHostel?.id,
          hostelName: a.hostelName || a.preferredHostel?.name || a.PreferredHostel?.Name || 'Hostel',
          preferredHostelName: a.hostelName || a.preferredHostel?.name || a.PreferredHostel?.Name || 'Hostel',
          termSemester: a.termSemester || a.TermSemester || '2026 / Semester 1',
          specialRequirements: a.specialRequirements || a.SpecialRequirements || 'None',
          status: a.status || a.Status || 'Pending',
          assignedRoomId: a.assignedRoomId || a.AssignedRoomId || a.assignedRoom?.id || a.room?.id,
          assignedRoomNumber:
            a.roomNumber ||
            a.RoomNumber ||
            a.assignedRoom?.roomNumber ||
            a.AssignedRoom?.RoomNumber ||
            a.room?.roomNumber,
          createdAt: a.createdAt || a.CreatedAt,
        }));
      })
    );
  }

  submitApplication(payload: Partial<HostelApplication>): Observable<any> {
    return this.apiService.post<any>(this.apiService.routes.hostel.submit, payload);
  }
}

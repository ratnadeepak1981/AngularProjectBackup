import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../../core/services/api.service';
import { Notification } from '../../../../core/models/system/notification.model';
import { StudentProfile } from '../../../../core/models/auth/student-profile.model';
import { Faculty } from '../../../../core/models/faculty/faculty.model';
import { ApiResponse } from '../../../../core/models/common/api-response.model';

@Injectable({
  providedIn: 'root',
})
export class NotificationMonitorService {
  private readonly apiService = inject(ApiService);

  getAdminAuditLog(): Observable<Notification[]> {
    return this.apiService.get<Notification[]>(this.apiService.routes.notifications.adminMonitor);
  }

  getStudentsDirectory(): Observable<ApiResponse<StudentProfile[]>> {
    return this.apiService.get<ApiResponse<StudentProfile[]>>(this.apiService.routes.students.directory);
  }

  getFaculties(): Observable<ApiResponse<Faculty[]>> {
    return this.apiService.get<ApiResponse<Faculty[]>>(this.apiService.routes.faculties.list);
  }

  sendInternalNotification(payload: {
    studentId?: number;
    facultyId?: number;
    dispatchMode: 'single' | 'faculty';
    type: string;
    message: string;
  }): Observable<ApiResponse<any>> {
    return this.apiService.post<ApiResponse<any>>('/internal/notifications', payload);
  }
}

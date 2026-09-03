import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from '../../../../core/services/api.service';
import { Notification } from '../../../../core/models/system/notification.model';
import { ApiResponse } from '../../../../core/models/common/api-response.model';

@Injectable({
  providedIn: 'root',
})
export class StudentNotificationService {
  private readonly apiService = inject(ApiService);

  getMyNotifications(studentId: number = 0): Observable<ApiResponse<Notification[]>> {
    return this.apiService.get<ApiResponse<Notification[]>>(
      this.apiService.routes.notifications.studentFeed(studentId)
    );
  }

  getFormattedNotifications(studentId: number = 0): Observable<Notification[]> {
    return this.getMyNotifications(studentId).pipe(
      map((res) => {
        return res.data || (Array.isArray(res) ? res : []);
      })
    );
  }

  markAsRead(notificationId: number): Observable<ApiResponse<any>> {
    return this.apiService.put<ApiResponse<any>>(
      this.apiService.routes.notifications.markRead(notificationId),
      {}
    );
  }

  markAsUnread(notificationId: number): Observable<ApiResponse<any>> {
    return this.apiService.put<ApiResponse<any>>(
      `/notifications/${notificationId}/read`,
      { isRead: false }
    );
  }
}

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../../../core/models/common/api-response.model';

@Injectable({
  providedIn: 'root',
})
export class SystemSettingsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/admin/system-settings';

  public getAllSettings(): Observable<ApiResponse<Record<string, string>>> {
    return this.http.get<ApiResponse<Record<string, string>>>(`${this.baseUrl}/all`);
  }

  public updateSettingsBatch(payload: Record<string, string>): Observable<ApiResponse<Record<string, string>>> {
    return this.http.put<ApiResponse<Record<string, string>>>(`${this.baseUrl}/batch`, payload);
  }

  public getHoldMinutes(): Observable<ApiResponse<{ holdMinutes: number }>> {
    return this.http.get<ApiResponse<{ holdMinutes: number }>>(`${this.baseUrl}/reservation-hold-minutes`);
  }

  public updateHoldMinutes(holdMinutes: number): Observable<ApiResponse<{ message: string; holdMinutes: number }>> {
    return this.http.put<ApiResponse<{ message: string; holdMinutes: number }>>(
      `${this.baseUrl}/reservation-hold-minutes`,
      { holdMinutes }
    );
  }
}

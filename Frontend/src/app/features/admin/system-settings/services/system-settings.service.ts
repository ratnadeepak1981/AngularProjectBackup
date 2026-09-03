import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../../core/services/api.service';
import { ApiResponse } from '../../../../core/models/common/api-response.model';

@Injectable({
  providedIn: 'root',
})
export class SystemSettingsService {
  private readonly api = inject(ApiService);
  private readonly endpoint = '/admin/system-settings';

  public getAllSettings(): Observable<ApiResponse<Record<string, string>>> {
    return this.api.get<ApiResponse<Record<string, string>>>(`${this.endpoint}/all`);
  }

  public updateSettingsBatch(payload: Record<string, string>): Observable<ApiResponse<Record<string, string>>> {
    return this.api.put<ApiResponse<Record<string, string>>>(`${this.endpoint}/batch`, payload);
  }

  public getHoldMinutes(): Observable<ApiResponse<{ holdMinutes: number }>> {
    return this.api.get<ApiResponse<{ holdMinutes: number }>>(`${this.endpoint}/reservation-hold-minutes`);
  }

  public updateHoldMinutes(holdMinutes: number): Observable<ApiResponse<{ message: string; holdMinutes: number }>> {
    return this.api.put<ApiResponse<{ message: string; holdMinutes: number }>>(
      `${this.endpoint}/reservation-hold-minutes`,
      { holdMinutes }
    );
  }
}

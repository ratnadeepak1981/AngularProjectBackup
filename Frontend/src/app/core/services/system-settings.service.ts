import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse } from '../models/common/api-response.model';

@Injectable({
  providedIn: 'root',
})
export class SystemSettingsService {
  private readonly api = inject(ApiService);

  public getAllSettings(): Observable<ApiResponse<Record<string, string>>> {
    return this.api.get<ApiResponse<Record<string, string>>>(this.api.routes.system.allSettings);
  }

  public updateSettingsBatch(payload: Record<string, string>): Observable<ApiResponse<Record<string, string>>> {
    return this.api.put<ApiResponse<Record<string, string>>>(this.api.routes.system.updateBatch, payload);
  }

  public getHoldMinutes(): Observable<ApiResponse<{ holdMinutes: number }>> {
    return this.api.get<ApiResponse<{ holdMinutes: number }>>(this.api.routes.system.holdMinutes);
  }

  public updateHoldMinutes(holdMinutes: number): Observable<ApiResponse<{ message: string; holdMinutes: number }>> {
    return this.api.put<ApiResponse<{ message: string; holdMinutes: number }>>(
      this.api.routes.system.holdMinutes,
      { holdMinutes }
    );
  }
}

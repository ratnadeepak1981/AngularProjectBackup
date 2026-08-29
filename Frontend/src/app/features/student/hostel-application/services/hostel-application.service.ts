import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../../core/services/api.service';

export interface SubmitHostelApplicationPayload {
  hostelId: number;
  preferredHostelId: number;
  termSemester: string;
  specialRequirements?: string;
}

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

  getMyApplications(): Observable<any> {
    return this.apiService.get<any>(this.apiService.routes.hostel.studentApps);
  }

  submitApplication(payload: SubmitHostelApplicationPayload): Observable<any> {
    return this.apiService.post<any>(this.apiService.routes.hostel.submit, payload);
  }
}

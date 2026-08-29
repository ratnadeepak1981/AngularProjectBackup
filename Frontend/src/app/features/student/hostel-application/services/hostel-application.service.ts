import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
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

  getMyApplications(): Observable<any> {
    return this.apiService.get<any>(this.apiService.routes.hostel.studentApps);
  }

  submitApplication(payload: Partial<HostelApplication>): Observable<any> {
    return this.apiService.post<any>(this.apiService.routes.hostel.submit, payload);
  }
}

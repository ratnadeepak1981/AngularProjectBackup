import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../../core/services/api.service';
import { Faculty } from '../../../../core/models/faculty/faculty.model';
import { ApiResponse } from '../../../../core/models/common/api-response.model';

@Injectable({
  providedIn: 'root',
})
export class FacultyManagementService {
  private readonly apiService = inject(ApiService);

  getFaculties(): Observable<ApiResponse<Faculty[]>> {
    return this.apiService.get<ApiResponse<Faculty[]>>(this.apiService.routes.faculties.list);
  }

  createFaculty(payload: { name: string; code?: string }): Observable<ApiResponse<any>> {
    return this.apiService.post<ApiResponse<any>>(this.apiService.routes.faculties.create, payload);
  }

  updateFaculty(id: number, payload: { name: string; code?: string }): Observable<ApiResponse<any>> {
    return this.apiService.put<ApiResponse<any>>(`/faculties/${id}`, payload);
  }

  deleteFaculty(id: number): Observable<ApiResponse<any>> {
    return this.apiService.delete<ApiResponse<any>>(this.apiService.routes.faculties.delete(id));
  }
}

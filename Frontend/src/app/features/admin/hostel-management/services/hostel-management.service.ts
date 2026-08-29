import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../../core/services/api.service';

import { HostelRoom } from '../../../../core/models/hostel/room.model';
import { HostelBuilding } from '../../../../core/models/hostel/hostel.model';
import { HousingApplication } from '../../../../core/models/hostel/hostel-application.model';

export type { HostelRoom, HostelBuilding, HousingApplication };

@Injectable({
  providedIn: 'root',
})
export class HostelManagementService {
  private readonly apiService = inject(ApiService);

  getPendingApplications(page: number = 1, size: number = 10): Observable<any> {
    return this.apiService.get<any>(this.apiService.routes.hostel.pendingApps, {
      pageNumber: page,
      pageSize: size,
    });
  }

  getAllApplications(): Observable<any> {
    return this.apiService.get<any>(this.apiService.routes.hostel.allApps);
  }

  getHostelsMasterList(page: number = 1, size: number = 100): Observable<any> {
    return this.apiService.get<any>(this.apiService.routes.hostel.selectHostels, {
      pageNumber: page,
      pageSize: size,
    });
  }

  updateApplicationStatus(id: number, status: 'Approved' | 'Rejected'): Observable<any> {
    return this.apiService.put<any>(this.apiService.routes.hostel.updateStatus(id), {
      status,
    });
  }

  assignRoom(applicationId: number, roomId: number): Observable<any> {
    return this.apiService.put<any>(this.apiService.routes.hostel.assignRoom(applicationId), {
      roomId,
    });
  }

  createHostel(name: string): Observable<any> {
    return this.apiService.post<any>(this.apiService.routes.hostel.hostels, {
      name,
    });
  }

  updateHostel(id: number, name: string, location: string = 'Campus Main', isActive: boolean = true): Observable<any> {
    return this.apiService.put<any>(this.apiService.routes.hostel.updateHostel(id), {
      name,
      location,
      isActive,
    });
  }

  deleteHostel(id: number): Observable<any> {
    return this.apiService.delete<any>(this.apiService.routes.hostel.deleteHostel(id));
  }

  createRoom(hostelId: number, roomNumber: string, maxCapacity: number): Observable<any> {
    return this.apiService.post<any>(this.apiService.routes.hostel.rooms(hostelId), {
      roomNumber,
      maxCapacity,
    });
  }

  updateRoom(id: number, roomNumber: string, maxCapacity: number, isActive: boolean = true): Observable<any> {
    return this.apiService.put<any>(this.apiService.routes.hostel.updateRoom(id), {
      roomNumber,
      maxCapacity,
      isActive,
    });
  }

  deleteRoom(id: number): Observable<any> {
    return this.apiService.delete<any>(this.apiService.routes.hostel.deleteRoom(id));
  }
}


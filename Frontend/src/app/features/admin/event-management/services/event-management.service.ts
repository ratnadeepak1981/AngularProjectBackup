import { Injectable, inject } from '@angular/core';
import { HttpContext } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ApiService } from '../../../../core/services/api.service';
import { SKIP_GLOBAL_ERROR_TOAST } from '../../../../core/interceptors/error-interceptor';

import { AdminEventItem } from '../../../../core/models/event/event.model';
import { AdminVenueItem } from '../../../../core/models/event/venue.model';
import { EventAttendeeItem } from '../../../../core/models/event/event-registration.model';
import { CreateEventPayload } from '../../../../core/models/event/create-event-payload.model';
import { CreateVenuePayload } from '../../../../core/models/event/create-venue-payload.model';

export type { AdminEventItem, AdminVenueItem, CreateEventPayload, CreateVenuePayload, EventAttendeeItem };

@Injectable({
  providedIn: 'root',
})
export class EventManagementService {
  private readonly api = inject(ApiService);

  // Events API
  getEvents(): Observable<any> {
    return this.api.get<any>(this.api.routes.events.list);
  }

  getFormattedEvents(): Observable<AdminEventItem[]> {
    return this.getEvents().pipe(
      map((res) => {
        const payload = res?.data || res || [];
        return Array.isArray(payload) ? payload : (payload.items || []);
      })
    );
  }

  createEvent(payload: CreateEventPayload): Observable<any> {
    return this.api.post<any>(
      this.api.routes.events.create,
      payload,
      { context: new HttpContext().set(SKIP_GLOBAL_ERROR_TOAST, true) }
    );
  }

  getEventRegistrations(eventId: number): Observable<any> {
    return this.api.get<any>(this.api.routes.events.registrations(eventId));
  }

  getFormattedEventRegistrations(eventId: number): Observable<EventAttendeeItem[]> {
    return this.getEventRegistrations(eventId).pipe(
      map((res) => {
        const payload = res?.data || res || [];
        return Array.isArray(payload) ? payload : (payload.items || []);
      })
    );
  }

  // Venues API
  getVenues(): Observable<any> {
    return this.api.get<any>(this.api.routes.venues.list);
  }

  getFormattedVenues(): Observable<AdminVenueItem[]> {
    return this.getVenues().pipe(
      map((res) => {
        const payload = res?.data || res || [];
        return Array.isArray(payload) ? payload : (payload.items || []);
      })
    );
  }

  createVenue(payload: CreateVenuePayload): Observable<any> {
    return this.api.post<any>(this.api.routes.venues.create, payload);
  }

  updateVenue(id: number, payload: { name: string; venueType: string; capacity: number; isActive: boolean }): Observable<any> {
    return this.api.put<any>(this.api.routes.venues.update(id), payload);
  }

  deleteVenue(id: number): Observable<any> {
    return this.api.delete<any>(this.api.routes.venues.delete(id));
  }
}

import { Injectable, inject } from '@angular/core';
import { HttpContext } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from '../../../../core/services/api.service';
import { SKIP_GLOBAL_ERROR_TOAST } from '../../../../core/interceptors/error-interceptor';
import { CampusEvent } from '../../../../core/models/event/event.model';

export type StudentEventDto = CampusEvent;

@Injectable({
  providedIn: 'root',
})
export class EventService {
  private readonly api = inject(ApiService);

  getAvailableEvents(): Observable<any> {
    return this.api.get<any>(this.api.routes.events.list);
  }

  registerForEvent(eventId: number): Observable<any> {
    return this.api.post<any>(
      this.api.routes.events.register,
      { eventId },
      { context: new HttpContext().set(SKIP_GLOBAL_ERROR_TOAST, true) }
    );
  }

  cancelRegistration(eventId: number): Observable<any> {
    return this.api.delete<any>(
      this.api.routes.events.cancelRegistration(eventId),
      { context: new HttpContext().set(SKIP_GLOBAL_ERROR_TOAST, true) }
    );
  }
}

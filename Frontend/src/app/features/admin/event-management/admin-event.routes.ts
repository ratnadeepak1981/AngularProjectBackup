import { Routes } from '@angular/router';
import { EventManagementPageComponent } from './pages/event-management-page.component';

export const ADMIN_EVENT_ROUTES: Routes = [
  {
    path: '',
    component: EventManagementPageComponent,
  },
];

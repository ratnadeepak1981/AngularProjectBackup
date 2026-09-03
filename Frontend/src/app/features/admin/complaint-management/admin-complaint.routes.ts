import { Routes } from '@angular/router';
import { ComplaintManagementPageComponent } from './pages/complaint-management-page.component';

export const ADMIN_COMPLAINT_ROUTES: Routes = [
  {
    path: '',
    component: ComplaintManagementPageComponent,
  },
];

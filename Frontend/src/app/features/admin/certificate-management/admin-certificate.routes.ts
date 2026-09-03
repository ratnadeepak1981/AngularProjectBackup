import { Routes } from '@angular/router';
import { CertificateManagementPageComponent } from './pages/certificate-management-page.component';

export const ADMIN_CERTIFICATE_ROUTES: Routes = [
  {
    path: '',
    component: CertificateManagementPageComponent,
  },
];

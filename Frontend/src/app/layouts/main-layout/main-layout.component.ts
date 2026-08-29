import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponentComponent } from '../../shared/layout-components/header-component/header-component.component';
import { NavbarComponentComponent } from '../../shared/layout-components/navbar-component/navbar-component.component';
import { FooterComponentComponent } from '../../shared/layout-components/footer-component/footer-component.component';
import { ToastContainerComponent } from '../../shared/components/toast-container/toast-container.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    HeaderComponentComponent,
    NavbarComponentComponent,
    FooterComponentComponent,
    ToastContainerComponent,
  ],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.css',
})
export class MainLayoutComponent {}

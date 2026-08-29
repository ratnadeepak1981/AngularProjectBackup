import { Component, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './page-header.component.html',
  styleUrl: './page-header.component.css',
})
export class PageHeaderComponent {
  public readonly authService = inject(AuthService);

  icon = input<string>('');
  title = input<string>('');
  description = input<string>('');
  badgeText = input<string>('');
  showIndexBadge = input<boolean>(true);
}

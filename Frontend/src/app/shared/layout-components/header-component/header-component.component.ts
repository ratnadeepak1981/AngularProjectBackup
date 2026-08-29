import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ApiService } from '../../../core/services/api.service';
import { ThemeService } from '../../../core/services/theme.service';
import { ThemeOption } from '../../../core/models/system/theme-option.model';

@Component({
  selector: 'app-header-component',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './header-component.component.html',
  styleUrl: './header-component.component.css',
})
export class HeaderComponentComponent implements OnInit, OnDestroy {
  public readonly authService = inject(AuthService);
  public readonly themeService = inject(ThemeService);
  private readonly apiService = inject(ApiService);

  public readonly isConnected = signal<boolean>(true);
  public readonly themes: ThemeOption[] = ThemeService.THEMES;
  private healthCheckInterval: any = null;

  public readonly userInitials = computed(() => {
    const profile = this.authService.userProfile();
    const name = profile?.name || (this.authService.isAdmin() ? 'Administrator Account' : 'Student Account');
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  });

  ngOnInit(): void {
    this.checkBackendHealth();
    this.healthCheckInterval = setInterval(() => {
      this.checkBackendHealth();
    }, 15000);
  }

  ngOnDestroy(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
  }

  checkBackendHealth(): void {
    this.apiService.get(this.apiService.routes.labs.list).subscribe({
      next: () => this.isConnected.set(true),
      error: (err) => {
        if (err.status && err.status !== 0) {
          this.isConnected.set(true);
        } else {
          this.isConnected.set(false);
        }
      },
    });
  }

  onThemeChange(themeId: string): void {
    this.themeService.setTheme(themeId);
  }

  onToggleDarkMode(): void {
    this.themeService.toggleDarkMode();
  }

  onLogout(): void {
    this.authService.logout();
  }
}

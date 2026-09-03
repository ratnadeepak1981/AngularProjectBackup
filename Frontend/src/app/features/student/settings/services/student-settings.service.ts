import { Injectable, inject, signal } from '@angular/core';
import { ThemeService } from '../../../../core/services/theme.service';
import { ToastService } from '../../../../core/services/toast.service';

export interface HeaderGradientOption {
  id: string;
  name: string;
  class: string;
}

@Injectable({
  providedIn: 'root',
})
export class StudentSettingsService {
  public readonly themeService = inject(ThemeService);
  private readonly toast = inject(ToastService);

  public readonly fontSize = signal<string>(localStorage.getItem('userFontSize') || 'Medium');
  public readonly headerGradient = signal<string>(localStorage.getItem('userHeaderGradient') || 'Oxford-Navy');

  public readonly themeOptions = ThemeService.THEMES;
  public readonly fontSizes: string[] = ['Small (Compact)', 'Medium (Default)', 'Large (Accessible)'];
  public readonly headerGradients: HeaderGradientOption[] = [
    { id: 'Oxford-Navy', name: 'Oxford Royal Navy', class: 'from-slate-900 via-slate-800 to-blue-950' },
    { id: 'Cambridge-Emerald', name: 'Cambridge Emerald', class: 'from-emerald-950 via-teal-900 to-emerald-900' },
    { id: 'Harvard-Crimson', name: 'Harvard Crimson', class: 'from-rose-950 via-red-900 to-rose-900' },
    { id: 'Stanford-Amber', name: 'Stanford Golden Amber', class: 'from-amber-950 via-yellow-900 to-amber-900' },
  ];

  selectTheme(themeId: string): void {
    this.themeService.setTheme(themeId);
    this.toast.success(`🎨 Theme updated to ${themeId}. Preference saved!`);
  }

  toggleDarkMode(): void {
    this.themeService.toggleDarkMode();
    const mode = this.themeService.isDarkMode() ? 'Dark Mode' : 'Light Mode';
    this.toast.success(`🌙 Mode switched to ${mode}.`);
  }

  setFontSize(size: string): void {
    this.fontSize.set(size);
    localStorage.setItem('userFontSize', size);
    this.toast.success(`🔤 Font size set to ${size}. Preference saved!`);
  }

  setHeaderGradient(gradientId: string): void {
    this.headerGradient.set(gradientId);
    localStorage.setItem('userHeaderGradient', gradientId);
    this.toast.success(`🖼️ Header theme set to ${gradientId}. Preference saved!`);
  }
}

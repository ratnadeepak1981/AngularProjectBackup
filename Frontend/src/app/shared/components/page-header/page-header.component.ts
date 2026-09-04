import { Component, OnInit, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { SystemSettingsService } from '../../../core/services/system-settings.service';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './page-header.component.html',
  styleUrl: './page-header.component.css',
})
export class PageHeaderComponent implements OnInit {
  public readonly authService = inject(AuthService);
  private readonly settingsService = inject(SystemSettingsService);

  icon = input<string>('');
  title = input<string>('');
  description = input<string>('');
  badgeText = input<string>('');
  showIndexBadge = input<boolean>(true);

  public readonly academicYear = signal<string>('2025/2026');
  public readonly semester = signal<string>('Semester 1');

  ngOnInit(): void {
    if (this.authService.isStudent()) {
      this.settingsService.getAllSettings().subscribe({
        next: (res) => {
          const dict = (res as any)?.data || res;
          if (dict) {
            if (dict['AcademicYear']) this.academicYear.set(dict['AcademicYear']);
            if (dict['Semester']) this.semester.set(dict['Semester']);
          }
        },
        error: () => {},
      });
    }
  }

  public get avatarInitials(): string {
    const name = this.authService.userProfile()?.name;
    if (!name) return 'ST';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  }

  public get studentName(): string {
    return this.authService.userProfile()?.name || 'Student';
  }

  public get studentIndex(): string {
    return this.authService.userProfile()?.indexNumber || 'STU/2026/001';
  }

  public get studentFaculty(): string {
    return this.authService.userProfile()?.facultyName || 'Faculty of Computing & Technology';
  }
}

import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { ControlPanelCardComponent } from '../../../../shared/components/cards/control-panel-card/control-panel-card.component';
import { SearchComponent } from '../../../../shared/components/tables-utilities/search/search.component';
import { FilterComponent, FilterOption } from '../../../../shared/components/tables-utilities/filter/filter.component';
import { ToastContainerComponent } from '../../../../shared/components/toast-container/toast-container.component';
import { ToastService } from '../../../../core/services/toast.service';
import { SystemSettingsService } from '../services/system-settings.service';
import { ThemeService } from '../../../../core/services/theme.service';
import { SystemSettingPanelCard } from '../../../../core/models/system/system-setting.model';

@Component({
  selector: 'app-system-settings-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PageHeaderComponent,
    ControlPanelCardComponent,
    SearchComponent,
    FilterComponent,
    ToastContainerComponent,
  ],
  templateUrl: './system-settings-page.component.html',
})
export class SystemSettingsPageComponent implements OnInit {
  private readonly settingsService = inject(SystemSettingsService);
  private readonly themeService = inject(ThemeService);
  private readonly toast = inject(ToastService);

  public readonly searchQuery = signal<string>('');
  public readonly selectedCategoryFilter = signal<string>('ALL');
  public readonly isLoading = signal<boolean>(false);

  public readonly themeOptions = ThemeService.THEMES;

  public readonly categoryFilterOptions: FilterOption[] = [
    { label: 'All Setting Categories', value: 'ALL' },
    { label: '🏢 Organization & Academic', value: 'organization' },
    { label: '🧪 Laboratory & Seat Matrix', value: 'laboratory' },
    { label: '🔐 Security & Authentication', value: 'security' },
    { label: '⚙️ Application & Themes', value: 'application' },
    { label: '💰 Finance & Fee Structure', value: 'finance' },
    { label: '🎓 Student & Registration', value: 'student' },
    { label: '🏠 Hostel & Room Allocation', value: 'hostel' },
    { label: '🎪 Events & Venues', value: 'events' },
    { label: '🔔 Notifications & Alerts', value: 'notifications' },
  ];

  // Settings State Signals
  public readonly institutionName = signal<string>('University of Knowledge (UOK)');
  public readonly holdMinutes = signal<number>(15);
  public readonly maxDailySlots = signal<number>(2);
  public readonly requireSeatSelection = signal<boolean>(true);
  public readonly computerLabSeatSelection = signal<boolean>(true);
  public readonly scienceLabSeatSelection = signal<boolean>(false);
  public readonly selectedLabTypeConfig = signal<string>('computer-cs');
  public readonly academicYear = signal<string>('2025/2026');
  public readonly academicYearsList = signal<string[]>(['2024/2025', '2025/2026', '2026/2027']);
  public readonly newAcademicYearInput = signal<string>('');

  public readonly semester = signal<string>('Semester 1');
  public readonly semestersList = signal<string[]>(['Semester 1', 'Semester 2', 'Summer Trimester', 'Special Term']);
  public readonly newSemesterInput = signal<string>('');

  public readonly minPasswordLength = signal<number>(8);
  public readonly maxFailedLogins = signal<number>(5);
  public readonly themeColor = signal<string>(this.themeService.currentTheme());
  public readonly fontSize = signal<string>('Medium');
  public readonly headerGradient = signal<string>('Navy-Indigo');
  public readonly defaultPageSize = signal<number>(5);

  // Category Modal State
  public readonly isModalOpen = signal<boolean>(false);
  public readonly activeCategory = signal<SystemSettingPanelCard | null>(null);

  // Deactivation / Reactivation State Mapping
  public readonly activeStatusMap = signal<Record<string, boolean>>({
    Organization: true,
    Laboratory: true,
    Security: true,
    Application: true,
    Finance: true,
    Student: true,
    Hostel: true,
    Events: true,
    Notifications: true,
  });

  public readonly masterCategoryCards: SystemSettingPanelCard[] = [
    {
      id: 'organization',
      title: '🏢 Organization & Academic Calendar',
      icon: '🏢',
      colorTheme: 'blue',
      description: 'Configure institution name, academic years, active semesters, faculties, and departments.',
      summaryItems: ['Institution Name', 'Academic Calendar', 'Semester 1/2', 'Faculties'],
      settingsCount: 5,
    },
    {
      id: 'laboratory',
      title: '🧪 Laboratory & Seat Matrix Rules',
      icon: '🧪',
      colorTheme: 'emerald',
      description: 'System reservation hold timeout (15 mins), max daily slots (2 slots / 4 hrs), seat matrix toggle.',
      summaryItems: ['15-Min Hold Timeout', 'Max 2 Daily Slots', 'Seat Matrix (T/F)', 'Advance Booking'],
      settingsCount: 4,
    },
    {
      id: 'security',
      title: '🔐 Security & Authentication Policies',
      icon: '🔐',
      colorTheme: 'rose',
      description: 'Password complexity policies, failed login attempt thresholds, roles, permissions, and MFA.',
      summaryItems: ['Password Policy', 'Max 5 Failed Logins', 'Roles & Permissions', 'MFA'],
      settingsCount: 4,
    },
    {
      id: 'application',
      title: '⚙️ Application, Themes & Wallpapers',
      icon: '⚙️',
      colorTheme: 'purple',
      description: 'Custom theme color schemes, font sizing, wallpaper gradients, SMTP email, and default pagination.',
      summaryItems: ['Theme Color (Blue)', 'Font Sizing', 'Header Gradients', 'Default Page Size (10)'],
      settingsCount: 4,
    },
    {
      id: 'finance',
      title: '💰 Finance & Fee Structure',
      icon: '💰',
      colorTheme: 'amber',
      description: 'Tuition fee types, payment gateway settings, fee categories, tax rules, and discount thresholds.',
      summaryItems: ['Fee Types', 'Payment Methods', 'Fee Categories', 'Tax / Discount'],
      settingsCount: 4,
    },
    {
      id: 'student',
      title: '🎓 Student & Registration Types',
      icon: '🎓',
      colorTheme: 'indigo',
      description: 'Student categorization, registration types, student statuses, and auto ID generator format.',
      summaryItems: ['Student Types', 'ID Format (STU/2026)', 'Registration Types', 'Statuses'],
      settingsCount: 4,
    },
    {
      id: 'hostel',
      title: '🏠 Hostel & Room Allocation',
      icon: '🏠',
      colorTheme: 'emerald',
      description: 'Hostel facility types, room types, room statuses, maintenance locks, and auto-allocation rules.',
      summaryItems: ['Hostel Types', 'Room Types', 'Room Statuses', 'Allocation Rules'],
      settingsCount: 4,
    },
    {
      id: 'events',
      title: '🎪 Campus Events & Venues',
      icon: '🎪',
      colorTheme: 'blue',
      description: 'Event categories, auditorium/venue types, event statuses, and advance venue booking windows.',
      summaryItems: ['Event Types', 'Venue Types', 'Event Statuses', 'Booking Windows'],
      settingsCount: 3,
    },
    {
      id: 'notifications',
      title: '🔔 Notifications & Templates',
      icon: '🔔',
      colorTheme: 'slate',
      description: 'Notification types, automated Email/SMS message templates, and dispatch alert rules.',
      summaryItems: ['Notification Types', 'Email Templates', 'SMS Dispatch', 'Alert Rules'],
      settingsCount: 3,
    },
  ];

  public readonly filteredCards = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const cat = this.selectedCategoryFilter();

    return this.masterCategoryCards.filter((c) => {
      const matchesCategory = cat === 'ALL' || c.id === cat;
      const matchesSearch =
        !q ||
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.summaryItems.some((s) => s.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  });

  public ngOnInit(): void {
    this.fetchSystemSettings();
  }

  public fetchSystemSettings(): void {
    this.isLoading.set(true);
    this.settingsService.getAllSettings().subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res.data) {
          const dict = res.data;
          if (dict['InstitutionName']) this.institutionName.set(dict['InstitutionName']);
          if (dict['LabBookingHoldMinutes']) this.holdMinutes.set(parseInt(dict['LabBookingHoldMinutes'], 10) || 15);
          if (dict['MaxDailySlots']) this.maxDailySlots.set(parseInt(dict['MaxDailySlots'], 10) || 2);
          if (dict['RequireSeatSelection']) this.requireSeatSelection.set(dict['RequireSeatSelection'] === 'true');
          if (dict['ComputerLabSeatSelection']) this.computerLabSeatSelection.set(dict['ComputerLabSeatSelection'] === 'true');
          if (dict['ScienceLabSeatSelection']) this.scienceLabSeatSelection.set(dict['ScienceLabSeatSelection'] === 'true');
          if (dict['AcademicYear']) this.academicYear.set(dict['AcademicYear']);
          if (dict['AcademicYearsList']) {
            const list = dict['AcademicYearsList'].split(',').map((s) => s.trim()).filter(Boolean);
            if (list.length > 0) this.academicYearsList.set(list);
          }
          if (dict['Semester']) this.semester.set(dict['Semester']);
          if (dict['SemestersList']) {
            const list = dict['SemestersList'].split(',').map((s) => s.trim()).filter(Boolean);
            if (list.length > 0) this.semestersList.set(list);
          }
          if (dict['MinPasswordLength']) this.minPasswordLength.set(parseInt(dict['MinPasswordLength'], 10) || 8);
          if (dict['MaxFailedLogins']) this.maxFailedLogins.set(parseInt(dict['MaxFailedLogins'], 10) || 5);
          if (dict['ThemeColor']) this.themeColor.set(dict['ThemeColor']);
          if (dict['FontSize']) this.fontSize.set(dict['FontSize']);
          if (dict['DefaultPageSize']) this.defaultPageSize.set(parseInt(dict['DefaultPageSize'], 10) || 5);
        }
      },
      error: () => this.isLoading.set(false),
    });
  }

  public addAcademicYear(): void {
    const val = this.newAcademicYearInput().trim();
    if (!val) {
      this.toast.warning('⚠️ Please enter an Academic Year (e.g. 2027/2028).');
      return;
    }
    const current = this.academicYearsList();
    if (current.includes(val)) {
      this.academicYear.set(val);
      this.newAcademicYearInput.set('');
      this.toast.info(`ℹ️ Academic Year "${val}" selected.`);
      return;
    }
    this.academicYearsList.set([...current, val]);
    this.academicYear.set(val);
    this.newAcademicYearInput.set('');
    this.toast.success(`📅 Created New Academic Year: ${val}`);
  }

  public addSemester(): void {
    const val = this.newSemesterInput().trim();
    if (!val) {
      this.toast.warning('⚠️ Please enter a Semester Name (e.g. Summer Trimester).');
      return;
    }
    const current = this.semestersList();
    if (current.includes(val)) {
      this.semester.set(val);
      this.newSemesterInput.set('');
      this.toast.info(`ℹ️ Semester "${val}" selected.`);
      return;
    }
    this.semestersList.set([...current, val]);
    this.semester.set(val);
    this.newSemesterInput.set('');
    this.toast.success(`🏛️ Created New Semester Term: ${val}`);
  }

  public onCategoryFilterChange(values: any[]): void {
    const val = values && values.length > 0 ? values[0] : 'ALL';
    this.selectedCategoryFilter.set(val);
  }

  public openCategoryModal(card: SystemSettingPanelCard): void {
    this.activeCategory.set(card);
    this.isModalOpen.set(true);
  }

  public closeModal(): void {
    this.isModalOpen.set(false);
    this.activeCategory.set(null);
  }

  public toggleCategoryDeactivation(categoryTitle: string): void {
    const current = this.activeStatusMap();
    const nextState = !current[categoryTitle];
    this.activeStatusMap.set({ ...current, [categoryTitle]: nextState });

    if (nextState) {
      this.toast.success(`⚡ Category Reactivated: ${categoryTitle} module parameters are active.`);
    } else {
      this.toast.warning(`⚙️ Category Deactivated: ${categoryTitle} module parameters placed in maintenance.`);
    }
  }

  public saveCategorySettings(): void {
    const payload: Record<string, string> = {
      InstitutionName: this.institutionName(),
      LabBookingHoldMinutes: this.holdMinutes().toString(),
      MaxDailySlots: this.maxDailySlots().toString(),
      RequireSeatSelection: this.requireSeatSelection().toString(),
      ComputerLabSeatSelection: this.computerLabSeatSelection().toString(),
      ScienceLabSeatSelection: this.scienceLabSeatSelection().toString(),
      AcademicYear: this.academicYear(),
      AcademicYearsList: this.academicYearsList().join(','),
      Semester: this.semester(),
      SemestersList: this.semestersList().join(','),
      MinPasswordLength: this.minPasswordLength().toString(),
      MaxFailedLogins: this.maxFailedLogins().toString(),
      ThemeColor: this.themeColor(),
      FontSize: this.fontSize(),
      DefaultPageSize: this.defaultPageSize().toString(),
    };

    this.isLoading.set(true);
    this.themeService.setTheme(this.themeColor());
    this.settingsService.updateSettingsBatch(payload).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.closeModal();
        this.toast.success('System Settings updated successfully with live backend persistence!');
      },
      error: () => {
        this.isLoading.set(false);
        this.toast.warning('Warning: Unable to save system settings payload.');
      },
    });
  }
}

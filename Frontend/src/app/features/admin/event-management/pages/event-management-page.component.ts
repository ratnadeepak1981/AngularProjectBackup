import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import {
  EventManagementService,
  AdminEventItem,
  AdminVenueItem,
  EventAttendeeItem,
  CreateEventPayload,
  CreateVenuePayload,
} from '../services/event-management.service';
import { ToastService } from '../../../../core/services/toast.service';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { TabComponent, TabItem } from '../../../../shared/components/tab-component/tab.component';
import { ConfirmModalComponent } from '../../../../shared/components/dialogs/confirm-modal/confirm-modal.component';
import { AlertModalComponent } from '../../../../shared/components/dialogs/alert-modal/alert-modal.component';
import { DataTableComponent } from '../../../../shared/components/data-table/data-table.component';
import { TableColumn } from '../../../../shared/components/data-table/models/table-column.model';

@Component({
  selector: 'app-event-management-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    PageHeaderComponent,
    TabComponent,
    ConfirmModalComponent,
    AlertModalComponent,
    DataTableComponent,
  ],
  templateUrl: './event-management-page.component.html',
  styleUrl: './event-management-page.component.css',
})
export class EventManagementPageComponent implements OnInit {
  private readonly eventService = inject(EventManagementService);
  private readonly toast = inject(ToastService);

  // Active Tab State
  public readonly activeTabId = signal<string>('events');

  // Tab Configuration
  public readonly eventTabs = signal<TabItem[]>([
    { id: 'events', label: 'Scheduled Events', icon: '📅', count: 0 },
    { id: 'venues', label: 'University Venues', icon: '🏛️', count: 0 },
  ]);

  // Master Data Signals
  public readonly eventsList = signal<AdminEventItem[]>([]);
  public readonly venuesList = signal<AdminVenueItem[]>([]);
  public readonly attendeesList = signal<EventAttendeeItem[]>([]);
  public readonly selectedEventForAttendees = signal<AdminEventItem | null>(null);

  public readonly isLoadingEvents = signal<boolean>(false);
  public readonly isLoadingVenues = signal<boolean>(false);
  public readonly isLoadingAttendees = signal<boolean>(false);

  // Table Column Configurations
  public readonly eventColumns: TableColumn<any>[] = [
    { key: 'title', header: 'Event Title', sortable: true, filterable: true },
    { key: 'venueName', header: 'Assigned Venue', sortable: true, filterable: true },
    { key: 'formattedSchedule', header: 'Start & End Schedule', sortable: true, filterable: true },
    { key: 'formattedCapacity', header: 'Capacity', sortable: true, filterable: true },
    { key: 'actions', header: 'Actions', sortable: false, filterable: false, type: 'actions', align: 'right' },
  ];

  public readonly venueColumns: TableColumn<any>[] = [
    { key: 'name', header: 'Venue Name', sortable: true, filterable: true },
    { key: 'type', header: 'Venue Type', sortable: true, filterable: true },
    { key: 'formattedCapacity', header: 'Max Capacity', sortable: true, filterable: true },
    {
      key: 'isActive',
      header: 'Status',
      sortable: true,
      filterable: true,
      type: 'badge',
      badgeMap: {
        true: {
          label: 'ACTIVE',
          class: 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700',
        },
        false: {
          label: 'DEACTIVATED',
          class: 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-700',
        },
      },
    },
    { key: 'actions', header: 'Actions', sortable: false, filterable: false, type: 'actions', align: 'right' },
  ];

  // Display Formatted Computations for Data Tables
  public readonly displayEvents = computed(() => {
    return this.eventsList().map((e) => {
      const startDate = e.startDateTime ? new Date(e.startDateTime).toLocaleString() : 'N/A';
      const endDate = e.endDateTime ? new Date(e.endDateTime).toLocaleString() : 'N/A';
      return {
        ...e,
        formattedSchedule: `${startDate} - ${endDate}`,
        formattedCapacity: `${e.capacity || 0} Students (${e.registeredCount || 0} registered)`,
      };
    });
  });

  public readonly displayVenues = computed(() => {
    return this.venuesList().map((v) => ({
      ...v,
      formattedCapacity: `${v.capacity || 0} People`,
    }));
  });

  // Modal State Signals
  public readonly isScheduleEventModalOpen = signal<boolean>(false);
  public readonly isCreateVenueModalOpen = signal<boolean>(false);
  public readonly isAttendeesModalOpen = signal<boolean>(false);
  public readonly isSubmittingEvent = signal<boolean>(false);
  public readonly isSubmittingVenue = signal<boolean>(false);

  // Schedule Event Form Fields
  public readonly newEventTitle = signal<string>('');
  public readonly newEventVenueId = signal<number>(0);
  public readonly newEventStartDateTime = signal<string>('');
  public readonly newEventEndDateTime = signal<string>('');
  public readonly newEventCapacity = signal<number>(100);
  public readonly newEventDescription = signal<string>('');

  // Create Venue Form Fields
  public readonly newVenueName = signal<string>('');
  public readonly newVenueType = signal<string>('Event Hall');
  public readonly newVenueCapacity = signal<number>(150);

  // Reusable Dialog Signals (Confirm & Alert)
  public readonly isConfirmOpen = signal<boolean>(false);
  public readonly confirmTitle = signal<string>('Confirm Action');
  public readonly confirmMessage = signal<string>('');
  public readonly confirmIcon = signal<string>('⚠️');
  public readonly confirmVariant = signal<'danger' | 'warning' | 'primary'>('danger');
  public readonly confirmButtonText = signal<string>('Proceed');
  public readonly confirmButtonIcon = signal<string>('✓');
  private pendingConfirmAction: (() => void) | null = null;

  public readonly isAlertOpen = signal<boolean>(false);
  public readonly alertTitle = signal<string>('Notice');
  public readonly alertMessage = signal<string>('');
  public readonly alertIcon = signal<string>('⚠️');
  public readonly alertVariant = signal<'danger' | 'warning' | 'info' | 'success'>('warning');
  public readonly alertButtonText = signal<string>('Understood');

  // Date Bounds & Capacity Validation Computations
  public readonly minStartDateTime = computed<string>(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  });

  public readonly selectedVenue = computed<AdminVenueItem | null>(() => {
    const vId = this.newEventVenueId();
    return this.venuesList().find((v) => v.id === vId) || null;
  });

  public readonly selectedVenueCapacity = computed<number>(() => {
    return this.selectedVenue()?.capacity || 0;
  });

  public readonly isCapacityExceeded = computed<boolean>(() => {
    const vCap = this.selectedVenueCapacity();
    if (vCap <= 0) return false;
    return this.newEventCapacity() > vCap;
  });

  public readonly isScheduleDateInvalid = computed<boolean>(() => {
    const start = this.newEventStartDateTime();
    const end = this.newEventEndDateTime();
    if (!start || !end) return false;
    const sTime = new Date(start).getTime();
    const eTime = new Date(end).getTime();
    return eTime <= sTime;
  });

  public readonly isScheduleDatePast = computed<boolean>(() => {
    const start = this.newEventStartDateTime();
    if (!start) return false;
    const sTime = new Date(start).getTime();
    const minTime = new Date(this.minStartDateTime()).getTime();
    return sTime < minTime;
  });

  ngOnInit(): void {
    this.loadAllData();
  }

  loadAllData(): void {
    this.loadEvents();
    this.loadVenues();
  }

  loadEvents(): void {
    this.isLoadingEvents.set(true);
    this.eventService.getEvents().subscribe({
      next: (res) => {
        const payload = res?.data || res || [];
        const items: AdminEventItem[] = Array.isArray(payload) ? payload : (payload.items || []);
        this.eventsList.set(items);
        this.updateTabCounts();
        this.isLoadingEvents.set(false);
      },
      error: () => {
        this.toast.error('Failed to load university campus events.');
        this.isLoadingEvents.set(false);
      },
    });
  }

  loadVenues(): void {
    this.isLoadingVenues.set(true);
    this.eventService.getVenues().subscribe({
      next: (res) => {
        const payload = res?.data || res || [];
        const items: AdminVenueItem[] = Array.isArray(payload) ? payload : (payload.items || []);
        this.venuesList.set(items);
        this.updateTabCounts();
        this.isLoadingVenues.set(false);
      },
      error: () => {
        this.toast.error('Failed to load university venues directory.');
        this.isLoadingVenues.set(false);
      },
    });
  }

  updateTabCounts(): void {
    this.eventTabs.set([
      { id: 'events', label: 'Scheduled Events', icon: '📅', count: this.eventsList().length },
      { id: 'venues', label: 'University Venues', icon: '🏛️', count: this.venuesList().length },
    ]);
  }

  setActiveTab(tabId: string): void {
    this.activeTabId.set(tabId);
  }

  // Schedule Event Workflows
  openScheduleEventModal(): void {
    this.newEventTitle.set('');
    const firstVenue = this.venuesList().find((v) => v.isActive);
    this.newEventVenueId.set(firstVenue ? firstVenue.id : 0);

    const now = new Date();
    now.setHours(now.getHours() + 1, 0, 0, 0);
    const startStr = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    now.setHours(now.getHours() + 3);
    const endStr = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);

    this.newEventStartDateTime.set(startStr);
    this.newEventEndDateTime.set(endStr);
    this.newEventCapacity.set(firstVenue ? Math.min(100, firstVenue.capacity) : 100);
    this.newEventDescription.set('');
    this.isScheduleEventModalOpen.set(true);
  }

  closeScheduleEventModal(): void {
    this.isScheduleEventModalOpen.set(false);
  }

  onStartDateChange(startVal: string): void {
    this.newEventStartDateTime.set(startVal);
    const sTime = new Date(startVal).getTime();
    const eTime = new Date(this.newEventEndDateTime()).getTime();
    if (!this.newEventEndDateTime() || eTime <= sTime) {
      const adjusted = new Date(sTime + 2 * 3600000);
      const adjStr = new Date(adjusted.getTime() - adjusted.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
      this.newEventEndDateTime.set(adjStr);
    }
  }

  onEndDateChange(endVal: string): void {
    this.newEventEndDateTime.set(endVal);
  }

  onVenueSelectionChange(venueId: number): void {
    this.newEventVenueId.set(venueId);
    const v = this.venuesList().find((item) => item.id === venueId);
    if (v && this.newEventCapacity() > v.capacity) {
      this.newEventCapacity.set(v.capacity);
    }
  }

  submitScheduleEvent(): void {
    const title = this.newEventTitle().trim();
    const venueId = this.newEventVenueId();
    const start = this.newEventStartDateTime();
    const end = this.newEventEndDateTime();
    const cap = this.newEventCapacity();
    const desc = this.newEventDescription().trim();

    if (!title) {
      this.toast.error('Please enter an event title.');
      return;
    }
    if (!venueId || venueId === 0) {
      this.toast.error('Please select an assigned campus venue.');
      return;
    }
    if (!start || !end) {
      this.toast.error('Please select both start and end date/time.');
      return;
    }

    const sDate = new Date(start);
    const eDate = new Date(end);
    if (sDate >= eDate) {
      this.showAlert(
        'Invalid Scheduling Window',
        'The scheduled event start date & time must occur strictly before the end date & time.',
        '⏰',
        'warning'
      );
      return;
    }

    const v = this.venuesList().find((item) => item.id === venueId);
    if (v && cap > v.capacity) {
      this.showAlert(
        'Structural Limit Exceeded [BRD Rule #13]',
        `Event capacity (${cap} Students) exceeds maximum physical seating limit of ${v.name} (${v.capacity} People). Please adjust capacity or select a larger venue.`,
        '🏛️',
        'danger'
      );
      return;
    }

    const payload: CreateEventPayload = {
      title,
      venueId,
      startDateTime: sDate.toISOString(),
      endDateTime: eDate.toISOString(),
      capacity: cap,
      description: desc || undefined,
    };

    this.confirmTitle.set('Confirm Event Scheduling');
    this.confirmMessage.set(
      `Are you sure you want to schedule and publish "${title}" at ${v?.name || 'the selected venue'} for up to ${cap} students?`
    );
    this.confirmIcon.set('📅');
    this.confirmVariant.set('primary');
    this.confirmButtonText.set('Schedule Event');
    this.confirmButtonIcon.set('📅');

    this.pendingConfirmAction = () => {
      this.isSubmittingEvent.set(true);
      this.eventService.createEvent(payload).subscribe({
        next: () => {
          this.toast.success(`Event "${title}" scheduled and published successfully!`);
          this.isSubmittingEvent.set(false);
          this.closeScheduleEventModal();
          this.loadEvents();
        },
        error: (err: any) => {
          this.isSubmittingEvent.set(false);
          const msg = err?.error?.message || err?.message || 'Failed to schedule event.';
          if (msg.toLowerCase().includes('overlap') || msg.toLowerCase().includes('conflict') || err.status === 409) {
            this.showAlert(
              'Schedule Overlap Conflict [BRD Rule #6]',
              `The selected venue (${v?.name || 'Venue'}) is already booked for another event during this requested timeframe. Please choose an alternate timeslot or venue.`,
              '⚠️',
              'danger'
            );
          } else {
            this.toast.error(msg);
          }
        },
      });
    };
    this.isConfirmOpen.set(true);
  }

  // Create Venue Workflows
  openCreateVenueModal(): void {
    this.newVenueName.set('');
    this.newVenueType.set('Event Hall');
    this.newVenueCapacity.set(150);
    this.isCreateVenueModalOpen.set(true);
  }

  closeCreateVenueModal(): void {
    this.isCreateVenueModalOpen.set(false);
  }

  submitCreateVenue(): void {
    const name = this.newVenueName().trim();
    const type = this.newVenueType();
    const cap = this.newVenueCapacity();

    if (!name) {
      this.toast.error('Please enter a venue name.');
      return;
    }
    if (cap <= 0) {
      this.toast.error('Seating capacity must be greater than 0.');
      return;
    }

    const payload: CreateVenuePayload = {
      name,
      venueType: type,
      capacity: cap,
    };

    this.confirmTitle.set('Confirm University Venue Creation');
    this.confirmMessage.set(
      `Are you sure you want to create and register university venue "${name}" (${type} - Max ${cap} People)?`
    );
    this.confirmIcon.set('🏛️');
    this.confirmVariant.set('primary');
    this.confirmButtonText.set('Create Venue');
    this.confirmButtonIcon.set('🏛️');

    this.pendingConfirmAction = () => {
      this.isSubmittingVenue.set(true);
      this.eventService.createVenue(payload).subscribe({
        next: () => {
          this.toast.success(`University venue "${name}" created successfully!`);
          this.isSubmittingVenue.set(false);
          this.closeCreateVenueModal();
          this.loadVenues();
        },
        error: (err: any) => {
          this.toast.error(err?.error?.message || err?.message || 'Failed to create venue.');
          this.isSubmittingVenue.set(false);
        },
      });
    };
    this.isConfirmOpen.set(true);
  }

  promptToggleVenue(venue: AdminVenueItem): void {
    if (venue.isActive) {
      this.confirmTitle.set('Deactivate University Venue');
      this.confirmMessage.set(
        `Are you sure you want to deactivate "${venue.name}"? New events will not be able to book this venue.`
      );
      this.confirmIcon.set('🏛️');
      this.confirmVariant.set('danger');
      this.confirmButtonText.set('Deactivate Venue');
      this.confirmButtonIcon.set('🗑️');
      this.pendingConfirmAction = () => {
        this.eventService.deleteVenue(venue.id).subscribe({
          next: () => {
            this.toast.success(`Venue "${venue.name}" deactivated successfully.`);
            this.loadVenues();
          },
          error: (err: any) => {
            this.toast.error(err?.error?.message || 'Failed to deactivate venue.');
          },
        });
      };
    } else {
      this.confirmTitle.set('Reactivate University Venue');
      this.confirmMessage.set(`Are you sure you want to reactivate "${venue.name}" for campus bookings?`);
      this.confirmIcon.set('🏛️');
      this.confirmVariant.set('primary');
      this.confirmButtonText.set('Reactivate Venue');
      this.confirmButtonIcon.set('✓');
      this.pendingConfirmAction = () => {
        this.eventService
          .updateVenue(venue.id, {
            name: venue.name,
            venueType: venue.type,
            capacity: venue.capacity,
            isActive: true,
          })
          .subscribe({
            next: () => {
              this.toast.success(`Venue "${venue.name}" reactivated successfully.`);
              this.loadVenues();
            },
            error: (err: any) => {
              this.toast.error(err?.error?.message || 'Failed to reactivate venue.');
            },
          });
      };
    }
    this.isConfirmOpen.set(true);
  }

  onConfirmAction(): void {
    this.isConfirmOpen.set(false);
    if (this.pendingConfirmAction) {
      this.pendingConfirmAction();
      this.pendingConfirmAction = null;
    }
  }

  onCancelConfirm(): void {
    this.isConfirmOpen.set(false);
    this.pendingConfirmAction = null;
  }

  // Attendees Monitor Modal
  openAttendeesModal(eventItem: AdminEventItem): void {
    this.selectedEventForAttendees.set(eventItem);
    this.attendeesList.set([]);
    this.isLoadingAttendees.set(true);
    this.isAttendeesModalOpen.set(true);

    this.eventService.getEventRegistrations(eventItem.id).subscribe({
      next: (res) => {
        const payload = res?.data || res || [];
        const items: EventAttendeeItem[] = Array.isArray(payload) ? payload : (payload.items || []);
        this.attendeesList.set(items);
        this.isLoadingAttendees.set(false);
      },
      error: () => {
        this.attendeesList.set([]);
        this.isLoadingAttendees.set(false);
      },
    });
  }

  closeAttendeesModal(): void {
    this.isAttendeesModalOpen.set(false);
    this.selectedEventForAttendees.set(null);
  }

  showAlert(title: string, message: string, icon = '⚠️', variant: 'danger' | 'warning' | 'info' | 'success' = 'warning'): void {
    this.alertTitle.set(title);
    this.alertMessage.set(message);
    this.alertIcon.set(icon);
    this.alertVariant.set(variant);
    this.isAlertOpen.set(true);
  }

  closeAlert(): void {
    this.isAlertOpen.set(false);
  }
}

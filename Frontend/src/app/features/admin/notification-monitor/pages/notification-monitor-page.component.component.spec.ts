import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationMonitorPageComponentComponent } from './notification-monitor-page.component.component';

describe('NotificationMonitorPageComponentComponent', () => {
  let component: NotificationMonitorPageComponentComponent;
  let fixture: ComponentFixture<NotificationMonitorPageComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotificationMonitorPageComponentComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(NotificationMonitorPageComponentComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

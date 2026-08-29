import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventManagementPageComponent } from './event-management-page.component';

describe('EventManagementPageComponent', () => {
  let component: EventManagementPageComponent;
  let fixture: ComponentFixture<EventManagementPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventManagementPageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EventManagementPageComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LabBookingsHistoryComponent } from './lab-bookings-history.component';

describe('LabBookingsHistoryComponent', () => {
  let component: LabBookingsHistoryComponent;
  let fixture: ComponentFixture<LabBookingsHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LabBookingsHistoryComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LabBookingsHistoryComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

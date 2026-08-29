import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LabBookingPageComponent } from './lab-booking-page.component';

describe('LabBookingPageComponent', () => {
  let component: LabBookingPageComponent;
  let fixture: ComponentFixture<LabBookingPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LabBookingPageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LabBookingPageComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { TestBed } from '@angular/core/testing';

import { LabBookingService } from './lab-booking.service';

describe('LabBookingService', () => {
  let service: LabBookingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LabBookingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

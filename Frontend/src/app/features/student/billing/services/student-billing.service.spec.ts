import { TestBed } from '@angular/core/testing';

import { StudentBillingService } from './student-billing.service';

describe('StudentBillingService', () => {
  let service: StudentBillingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StudentBillingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

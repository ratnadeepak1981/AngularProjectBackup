import { TestBed } from '@angular/core/testing';

import { ComplaintManagementService } from './complaint-management.service';

describe('ComplaintManagementService', () => {
  let service: ComplaintManagementService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ComplaintManagementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

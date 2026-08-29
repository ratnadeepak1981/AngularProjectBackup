import { TestBed } from '@angular/core/testing';

import { HostelManagementService } from './hostel-management.service';

describe('HostelManagementService', () => {
  let service: HostelManagementService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HostelManagementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

import { TestBed } from '@angular/core/testing';

import { LabManagementService } from './lab-management.service';

describe('LabManagementService', () => {
  let service: LabManagementService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LabManagementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
